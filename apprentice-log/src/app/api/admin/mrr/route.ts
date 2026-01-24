import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/employer-stripe";

// Admin emails that can access this endpoint
const ADMIN_EMAILS = [
  "admin@apprenticelog.nz",
  "demo@apprenticelog.nz", // For testing
];

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (!ADMIN_EMAILS.includes(user.email || "")) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Get all organizations with their subscription status
    const { data: organizations, error: orgError } = await supabase
      .from("organizations")
      .select("id, name, plan, status, stripe_subscription_id, stripe_customer_id, created_at, current_period_end");

    if (orgError) {
      throw orgError;
    }

    // Calculate metrics
    const totalOrgs = organizations?.length || 0;
    const proOrgs = organizations?.filter(o => o.plan === "pro" || o.plan === "paid") || [];
    const freeOrgs = organizations?.filter(o => o.plan === "free" || !o.plan) || [];
    const activeSubscriptions = proOrgs.filter(o => o.status === "active" || o.status === "trialing");

    // MRR calculation: $29 NZD per active Pro subscription
    const pricePerMonth = 29;
    const mrr = activeSubscriptions.length * pricePerMonth;
    const arr = mrr * 12;

    // Get apprentice counts
    const { count: totalApprentices } = await supabase
      .from("organization_members")
      .select("*", { count: "exact", head: true })
      .eq("role", "apprentice")
      .eq("status", "active");

    const { count: totalUsers } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    const { count: totalEntries } = await supabase
      .from("logbook_entries")
      .select("*", { count: "exact", head: true });

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count: recentEntries } = await supabase
      .from("logbook_entries")
      .select("*", { count: "exact", head: true })
      .gte("created_at", thirtyDaysAgo.toISOString());

    const { count: newOrgsThisMonth } = await supabase
      .from("organizations")
      .select("*", { count: "exact", head: true })
      .gte("created_at", thirtyDaysAgo.toISOString());

    // Monthly growth calculation
    const lastMonthStart = new Date();
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
    lastMonthStart.setDate(1);
    const lastMonthEnd = new Date();
    lastMonthEnd.setDate(0);

    const { count: lastMonthNewOrgs } = await supabase
      .from("organizations")
      .select("*", { count: "exact", head: true })
      .gte("created_at", lastMonthStart.toISOString())
      .lte("created_at", lastMonthEnd.toISOString());

    return NextResponse.json({
      revenue: {
        mrr,
        arr,
        currency: "NZD",
        pricePerMonth,
      },
      organizations: {
        total: totalOrgs,
        pro: proOrgs.length,
        free: freeOrgs.length,
        activeSubscriptions: activeSubscriptions.length,
        newThisMonth: newOrgsThisMonth || 0,
        lastMonthNew: lastMonthNewOrgs || 0,
      },
      usage: {
        totalUsers: totalUsers || 0,
        totalApprentices: totalApprentices || 0,
        totalEntries: totalEntries || 0,
        entriesLast30Days: recentEntries || 0,
      },
      subscriptions: proOrgs.map(o => ({
        id: o.id,
        name: o.name,
        plan: o.plan,
        status: o.status,
        stripeCustomerId: o.stripe_customer_id,
        stripeSubscriptionId: o.stripe_subscription_id,
        currentPeriodEnd: o.current_period_end,
        createdAt: o.created_at,
      })),
    });
  } catch (error) {
    console.error("Admin MRR error:", error);
    return NextResponse.json(
      { error: "Failed to fetch MRR data" },
      { status: 500 }
    );
  }
}
