import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET - Combined dashboard data (org + stats + apprentices in one call)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get organization where user is owner or active member - single query
    const { data: membership } = await supabase
      .from("organization_members")
      .select(`
        role,
        organization:organizations (
          id,
          name,
          slug,
          plan,
          status,
          max_seats,
          owner_id
        )
      `)
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    // Also check if user is org owner directly
    let organization = membership?.organization as {
      id: string;
      name: string;
      slug: string;
      plan: string;
      status: string;
      max_seats: number;
      owner_id: string;
    } | null;
    let userRole = membership?.role;

    if (!organization) {
      const { data: ownedOrg } = await supabase
        .from("organizations")
        .select("id, name, slug, plan, status, max_seats, owner_id")
        .eq("owner_id", user.id)
        .single();

      if (ownedOrg) {
        organization = ownedOrg;
        userRole = "owner";
      }
    }

    if (!organization) {
      return NextResponse.json(
        { error: "No organization found" },
        { status: 404 }
      );
    }

    // Fetch apprentices and stats in parallel
    const [apprenticesResult, statsResult] = await Promise.all([
      // Get apprentices with stats
      (async () => {
        const { data: apprenticeMembers } = await supabase
          .from("organization_members")
          .select("*")
          .eq("organization_id", organization!.id)
          .eq("role", "apprentice")
          .eq("status", "active");

        if (!apprenticeMembers || apprenticeMembers.length === 0) {
          return [];
        }

        const userIds = apprenticeMembers
          .filter(m => m.user_id)
          .map(m => m.user_id);

        let statsMap: Record<string, { entries_count: number; total_hours: number; last_entry_date: string | null }> = {};

        if (userIds.length > 0) {
          const { data: entriesData } = await supabase
            .from("apprentice_entries")
            .select("user_id, hours, date")
            .in("user_id", userIds)
            .eq("is_deleted", false)
            .order("date", { ascending: false });

          if (entriesData) {
            for (const entry of entriesData) {
              if (!statsMap[entry.user_id]) {
                statsMap[entry.user_id] = {
                  entries_count: 0,
                  total_hours: 0,
                  last_entry_date: entry.date,
                };
              }
              statsMap[entry.user_id].entries_count++;
              statsMap[entry.user_id].total_hours += entry.hours || 0;
            }
          }
        }

        return apprenticeMembers.map((member) => {
          const stats = member.user_id ? statsMap[member.user_id] : null;
          return {
            id: member.user_id || member.id,
            email: member.email,
            full_name: null,
            role: member.role,
            joined_at: member.joined_at,
            entries_count: stats?.entries_count || 0,
            total_hours: stats?.total_hours || 0,
            last_entry_date: stats?.last_entry_date || null,
          };
        });
      })(),

      // Get org stats (member count, hours this week/month)
      (async () => {
        const { count: memberCount } = await supabase
          .from("organization_members")
          .select("*", { count: "exact", head: true })
          .eq("organization_id", organization!.id)
          .eq("status", "active");

        // Get apprentice user IDs for entry stats
        const { data: apprenticeMembers } = await supabase
          .from("organization_members")
          .select("user_id")
          .eq("organization_id", organization!.id)
          .eq("role", "apprentice")
          .eq("status", "active");

        const apprenticeUserIds = apprenticeMembers
          ?.filter(m => m.user_id)
          .map(m => m.user_id) || [];

        let entriesThisWeek = 0;
        let hoursThisWeek = 0;
        let entriesThisMonth = 0;
        let hoursThisMonth = 0;

        if (apprenticeUserIds.length > 0) {
          const now = new Date();
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay());
          startOfWeek.setHours(0, 0, 0, 0);

          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

          // Get entries this month (includes this week)
          const { data: monthEntries } = await supabase
            .from("apprentice_entries")
            .select("hours, date")
            .in("user_id", apprenticeUserIds)
            .eq("is_deleted", false)
            .gte("date", startOfMonth.toISOString().split("T")[0]);

          if (monthEntries) {
            const weekStart = startOfWeek.toISOString().split("T")[0];
            for (const entry of monthEntries) {
              entriesThisMonth++;
              hoursThisMonth += entry.hours || 0;
              if (entry.date >= weekStart) {
                entriesThisWeek++;
                hoursThisWeek += entry.hours || 0;
              }
            }
          }
        }

        return {
          member_count: memberCount || 0,
          entries_this_week: entriesThisWeek,
          hours_this_week: Math.round(hoursThisWeek * 10) / 10,
          entries_this_month: entriesThisMonth,
          hours_this_month: Math.round(hoursThisMonth * 10) / 10,
        };
      })(),
    ]);

    return NextResponse.json({
      organization: {
        ...organization,
        role: userRole,
      },
      stats: statsResult,
      apprentices: apprenticesResult,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Failed to load dashboard data" },
      { status: 500 }
    );
  }
}
