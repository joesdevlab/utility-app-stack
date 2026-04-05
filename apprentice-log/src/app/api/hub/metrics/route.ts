import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/hub/metrics
 *
 * Polled by the Laika Dynamics Hub every 5 minutes.
 * Authenticated via X-Api-Key header (matches HUB_API_KEY env var).
 * Returns platform health metrics, subscription counts, and revenue data.
 */
export async function GET(request: NextRequest) {
  // Authenticate — the Hub sends the shared API key
  const apiKey = request.headers.get("x-api-key");
  const expectedKey = process.env.HUB_API_KEY;

  if (!expectedKey || apiKey !== expectedKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      activeApprenticesResult,
      activeEmployersResult,
      entriesLast7dResult,
      activeSubscriptionsResult,
      cancelledLast30dResult,
      hoursLast7dResult,
    ] = await Promise.all([
      // Active apprentices: distinct users who logged an entry in the last 30 days
      supabase
        .from("apprentice_entries")
        .select("user_id", { count: "exact", head: true })
        .eq("is_deleted", false)
        .gte("date", thirtyDaysAgo.toISOString().split("T")[0]),

      // Active employers: organizations with status = active
      supabase
        .from("organizations")
        .select("id", { count: "exact", head: true })
        .eq("status", "active"),

      // Logbook entries in last 7 days
      supabase
        .from("apprentice_entries")
        .select("id", { count: "exact", head: true })
        .eq("is_deleted", false)
        .gte("date", sevenDaysAgo.toISOString().split("T")[0]),

      // Total active subscriptions (pro plan, active status)
      supabase
        .from("organizations")
        .select("id", { count: "exact", head: true })
        .eq("plan", "pro")
        .in("status", ["active", "trialing"]),

      // Cancelled in last 30 days
      supabase
        .from("organizations")
        .select("id", { count: "exact", head: true })
        .eq("status", "canceled")
        .gte("updated_at", thirtyDaysAgo.toISOString()),

      // Hours data for last 7 days (to compute avg hours/week)
      supabase
        .from("apprentice_entries")
        .select("user_id, hours")
        .eq("is_deleted", false)
        .gte("date", sevenDaysAgo.toISOString().split("T")[0])
        .not("hours", "is", null),
    ]);

    // Calculate average hours per week per apprentice
    const hoursData = hoursLast7dResult.data || [];
    const hoursByUser: Record<string, number> = {};
    for (const entry of hoursData) {
      hoursByUser[entry.user_id] = (hoursByUser[entry.user_id] || 0) + Number(entry.hours);
    }
    const userHours = Object.values(hoursByUser);
    const avgHoursPerWeek =
      userHours.length > 0
        ? Math.round((userHours.reduce((a, b) => a + b, 0) / userHours.length) * 10) / 10
        : 0;

    // MRR: active pro orgs × $29 NZD = 2900 cents
    const activeProCount = activeSubscriptionsResult.count || 0;
    const mrrCents = activeProCount * 2900;

    return NextResponse.json({
      health: {
        active_apprentices: activeApprenticesResult.count || 0,
        active_employers: activeEmployersResult.count || 0,
        logbook_entries_7d: entriesLast7dResult.count || 0,
        completion_rate: 0, // No completion tracking in schema yet
        avg_hours_per_week: avgHoursPerWeek,
      },
      subscriptions: {
        total: activeProCount,
      },
      revenue: {
        mrr_cents: mrrCents,
        cancelled_30d: cancelledLast30dResult.count || 0,
      },
    });
  } catch (error) {
    console.error("[Hub Metrics] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 }
    );
  }
}
