import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/resend";
import { WeeklySummaryEmail } from "@/emails";

/**
 * GET /api/cron/weekly-summary
 *
 * Sends weekly summary emails to all active users who logged entries in the past week.
 * Intended to be called by Vercel Cron every Monday at 8am NZST.
 */
export async function GET(request: NextRequest) {
  // Verify this is a legitimate cron request (Vercel sets this header)
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();

    // Calculate the past week's date range
    const now = new Date();
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() - 1); // Yesterday
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekStart.getDate() - 6); // 7 days ago

    const weekStartStr = weekStart.toISOString().split("T")[0];
    const weekEndStr = weekEnd.toISOString().split("T")[0];

    const weekStartDisplay = weekStart.toLocaleDateString("en-NZ", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    const weekEndDisplay = weekEnd.toLocaleDateString("en-NZ", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    // Get all users who have entries in the past week
    const { data: weekEntries, error: entriesError } = await supabase
      .from("apprentice_entries")
      .select("user_id, date, total_hours, hours, tasks")
      .eq("is_deleted", false)
      .gte("date", weekStartStr)
      .lte("date", weekEndStr);

    if (entriesError) {
      console.error("Failed to fetch weekly entries:", entriesError);
      return NextResponse.json(
        { error: "Failed to fetch entries" },
        { status: 500 }
      );
    }

    if (!weekEntries || weekEntries.length === 0) {
      return NextResponse.json({
        message: "No entries this week, no emails sent",
        sent: 0,
      });
    }

    // Group entries by user
    const userEntries = new Map<string, typeof weekEntries>();
    for (const entry of weekEntries) {
      if (!entry.user_id) continue;
      const existing = userEntries.get(entry.user_id) || [];
      existing.push(entry);
      userEntries.set(entry.user_id, existing);
    }

    // Get user profiles for names and emails
    const userIds = [...userEntries.keys()];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", userIds);

    const profileMap = new Map(
      (profiles || []).map((p) => [p.id, p])
    );

    // Calculate streak for each user (consecutive days with entries in past 30 days)
    let sentCount = 0;
    let errorCount = 0;

    for (const [userId, entries] of userEntries) {
      const profile = profileMap.get(userId);
      if (!profile?.email) continue;

      const totalHours = entries.reduce(
        (sum, e) => sum + (e.total_hours || e.hours || 0),
        0
      );

      // Extract all skills from tasks
      const allSkills: string[] = [];
      for (const entry of entries) {
        const tasks = entry.tasks as Array<{ skills?: string[] }> | null;
        if (tasks) {
          for (const task of tasks) {
            if (task.skills) allSkills.push(...task.skills);
          }
        }
      }

      // Find the most common skill
      const skillCounts = new Map<string, number>();
      for (const skill of allSkills) {
        skillCounts.set(skill, (skillCounts.get(skill) || 0) + 1);
      }
      const topSkill = [...skillCounts.entries()]
        .sort((a, b) => b[1] - a[1])[0]?.[0];

      // Calculate streak (consecutive entry days ending at weekEnd)
      const entryDates = new Set(entries.map((e) => e.date));
      let streak = 0;
      const checkDate = new Date(weekEnd);
      while (entryDates.has(checkDate.toISOString().split("T")[0])) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }

      const stats = {
        totalHours,
        entriesCount: entries.length,
        streak,
        topSkill,
      };

      const result = await sendEmail({
        to: profile.email,
        subject: `Your Week in Review — ${weekStartDisplay} to ${weekEndDisplay}`,
        react: WeeklySummaryEmail({
          userName: profile.full_name || undefined,
          weekStartDate: weekStartDisplay,
          weekEndDate: weekEndDisplay,
          stats,
        }),
        text: `Your weekly summary: ${entries.length} entries, ${totalHours} hours logged.`,
      });

      if (result.success) {
        sentCount++;
      } else {
        errorCount++;
        console.error(`Failed to send weekly summary to ${profile.email}:`, result.error);
      }
    }

    return NextResponse.json({
      message: `Weekly summaries sent`,
      sent: sentCount,
      errors: errorCount,
      totalUsers: userEntries.size,
    });
  } catch (error) {
    console.error("Weekly summary cron error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
