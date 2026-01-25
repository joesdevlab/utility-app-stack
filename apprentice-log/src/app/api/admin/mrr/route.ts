import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Admin emails that can access this endpoint
const ADMIN_EMAILS = [
  "joe@apprenticelog.nz",
  "joe@laikadynamics.co.nz",
  "joseph.doidge@gmail.com",
];

// Price per month in NZD
const PRICE_PER_MONTH = 29;

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

    // Get all organizations with subscription data
    const { data: organizations, error: orgError } = await supabase
      .from("organizations")
      .select("id, name, plan, status, stripe_subscription_id, stripe_customer_id, created_at, current_period_end, owner_id")
      .order("created_at", { ascending: false });

    if (orgError) throw orgError;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Date ranges for analysis
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sixtyDaysAgo = new Date(today);
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const ninetyDaysAgo = new Date(today);
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    // Current month bounds
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const twoMonthsAgoStart = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    const twoMonthsAgoEnd = new Date(now.getFullYear(), now.getMonth() - 1, 0);

    // Categorize organizations
    const allOrgs = organizations || [];
    const proOrgs = allOrgs.filter(o => o.plan === "pro" || o.plan === "paid");
    const freeOrgs = allOrgs.filter(o => o.plan === "free" || !o.plan);
    const activeProOrgs = proOrgs.filter(o => o.status === "active" || o.status === "trialing");
    const churned = proOrgs.filter(o => o.status === "canceled" || o.status === "past_due");
    const trialing = proOrgs.filter(o => o.status === "trialing");

    // MRR Calculations
    const currentMRR = activeProOrgs.length * PRICE_PER_MONTH;
    const arr = currentMRR * 12;

    // New MRR this month (new Pro subscribers this month)
    const newProThisMonth = proOrgs.filter(o =>
      new Date(o.created_at) >= currentMonthStart &&
      (o.status === "active" || o.status === "trialing")
    );
    const newMRR = newProThisMonth.length * PRICE_PER_MONTH;

    // Churned MRR (estimate based on canceled subscriptions)
    const churnedThisMonth = proOrgs.filter(o =>
      o.status === "canceled" &&
      o.current_period_end &&
      new Date(o.current_period_end) >= currentMonthStart
    );
    const churnedMRR = churnedThisMonth.length * PRICE_PER_MONTH;

    // Net MRR change
    const netMRR = newMRR - churnedMRR;

    // Historical MRR (last month)
    const proLastMonth = proOrgs.filter(o =>
      new Date(o.created_at) <= lastMonthEnd &&
      (o.status === "active" || o.status === "trialing" ||
       (o.status === "canceled" && o.current_period_end && new Date(o.current_period_end) > lastMonthEnd))
    );
    const lastMonthMRR = proLastMonth.length * PRICE_PER_MONTH;
    const mrrGrowthRate = lastMonthMRR > 0 ? ((currentMRR - lastMonthMRR) / lastMonthMRR) * 100 : 0;

    // Churn rate calculation
    const customersStartOfMonth = proOrgs.filter(o => new Date(o.created_at) < currentMonthStart).length;
    const churnRate = customersStartOfMonth > 0 ? (churnedThisMonth.length / customersStartOfMonth) * 100 : 0;

    // NRR (Net Revenue Retention) - measures revenue retained from existing customers
    // NRR = (Start MRR + Expansion - Churn - Contraction) / Start MRR * 100
    // Since we have flat pricing (no expansion/contraction), NRR = (Start MRR - Churn) / Start MRR * 100
    const startMRR = customersStartOfMonth * PRICE_PER_MONTH;
    const nrr = startMRR > 0 ? ((startMRR - churnedMRR) / startMRR) * 100 : 100;

    // LTV calculation (simplified: average revenue per customer / churn rate)
    const avgMonthlyChurn = churnRate > 0 ? churnRate / 100 : 0.05; // Default 5% if no churn data
    const ltv = avgMonthlyChurn > 0 ? PRICE_PER_MONTH / avgMonthlyChurn : PRICE_PER_MONTH * 20;

    // Customer Acquisition
    const newOrgsThisMonth = allOrgs.filter(o => new Date(o.created_at) >= currentMonthStart).length;
    const newOrgsLastMonth = allOrgs.filter(o =>
      new Date(o.created_at) >= lastMonthStart && new Date(o.created_at) <= lastMonthEnd
    ).length;
    const newOrgsTwoMonthsAgo = allOrgs.filter(o =>
      new Date(o.created_at) >= twoMonthsAgoStart && new Date(o.created_at) <= twoMonthsAgoEnd
    ).length;

    // Conversion rate (Free to Pro)
    const conversions = proOrgs.filter(o => new Date(o.created_at) >= currentMonthStart).length;
    const conversionRate = newOrgsThisMonth > 0 ? (conversions / newOrgsThisMonth) * 100 : 0;

    // Get user and usage stats
    const [
      { count: totalUsers },
      { count: totalApprentices },
      { count: totalEntries },
      { count: entriesLast30Days },
      { count: entriesLast7Days },
      { count: activeUsersLast30Days },
    ] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("organization_members").select("*", { count: "exact", head: true })
        .eq("role", "apprentice").eq("status", "active"),
      supabase.from("logbook_entries").select("*", { count: "exact", head: true }),
      supabase.from("logbook_entries").select("*", { count: "exact", head: true })
        .gte("created_at", thirtyDaysAgo.toISOString()),
      supabase.from("logbook_entries").select("*", { count: "exact", head: true })
        .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
      supabase.from("logbook_entries").select("user_id", { count: "exact", head: true })
        .gte("created_at", thirtyDaysAgo.toISOString()),
    ]);

    // Calculate ARPU (Average Revenue Per User)
    const arpu = (totalUsers || 0) > 0 ? currentMRR / (totalUsers || 1) : 0;

    // Calculate average apprentices per paying org
    const { data: memberCounts } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("role", "apprentice")
      .eq("status", "active");

    const apprenticesPerOrg: Record<string, number> = {};
    (memberCounts || []).forEach(m => {
      apprenticesPerOrg[m.organization_id] = (apprenticesPerOrg[m.organization_id] || 0) + 1;
    });

    const payingOrgIds = new Set(activeProOrgs.map(o => o.id));
    const payingOrgApprentices = Object.entries(apprenticesPerOrg)
      .filter(([orgId]) => payingOrgIds.has(orgId))
      .map(([, count]) => count);

    const avgApprenticesPerPayingOrg = payingOrgApprentices.length > 0
      ? payingOrgApprentices.reduce((a, b) => a + b, 0) / payingOrgApprentices.length
      : 0;

    // Monthly trend data (last 6 months)
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const monthLabel = monthStart.toLocaleDateString("en-NZ", { month: "short", year: "2-digit" });

      const proAtEndOfMonth = proOrgs.filter(o =>
        new Date(o.created_at) <= monthEnd &&
        (o.status === "active" || o.status === "trialing" ||
         (o.status === "canceled" && o.current_period_end && new Date(o.current_period_end) > monthEnd))
      ).length;

      const newOrgsInMonth = allOrgs.filter(o =>
        new Date(o.created_at) >= monthStart && new Date(o.created_at) <= monthEnd
      ).length;

      monthlyTrend.push({
        month: monthLabel,
        mrr: proAtEndOfMonth * PRICE_PER_MONTH,
        customers: proAtEndOfMonth,
        newSignups: newOrgsInMonth,
      });
    }

    // Recent activity timeline
    const { data: recentOrgs } = await supabase
      .from("organizations")
      .select("id, name, plan, status, created_at")
      .order("created_at", { ascending: false })
      .limit(10);

    // Customer health scores - OPTIMIZED: batch queries instead of N+1
    const proOrgIds = activeProOrgs.map(o => o.id);

    // Batch query: Get entry counts per org for last 30 days
    const { data: entryCounts } = await supabase
      .from("logbook_entries")
      .select("organization_id")
      .in("organization_id", proOrgIds)
      .gte("created_at", thirtyDaysAgo.toISOString());

    // Count entries per org
    const entryCountMap: Record<string, number> = {};
    (entryCounts || []).forEach(e => {
      entryCountMap[e.organization_id] = (entryCountMap[e.organization_id] || 0) + 1;
    });

    // Batch query: Get apprentice counts per org
    const { data: apprenticeCounts } = await supabase
      .from("organization_members")
      .select("organization_id")
      .in("organization_id", proOrgIds)
      .eq("role", "apprentice")
      .eq("status", "active");

    // Count apprentices per org
    const apprenticeCountMap: Record<string, number> = {};
    (apprenticeCounts || []).forEach(a => {
      apprenticeCountMap[a.organization_id] = (apprenticeCountMap[a.organization_id] || 0) + 1;
    });

    // Build health data from batch results (no limit - show all paying customers)
    const customerHealth = activeProOrgs.map(org => {
      const recentActivity = entryCountMap[org.id] || 0;
      const apprenticeCount = apprenticeCountMap[org.id] || 0;

      // Health score: 0-100 based on activity
      const activityScore = Math.min(100, (recentActivity / 10) * 50);
      const apprenticeScore = Math.min(50, apprenticeCount * 10);
      const healthScore = Math.round(activityScore + apprenticeScore);

      return {
        id: org.id,
        name: org.name,
        status: org.status,
        apprentices: apprenticeCount,
        entriesLast30Days: recentActivity,
        healthScore,
        healthStatus: healthScore >= 70 ? "healthy" : healthScore >= 40 ? "at-risk" : "critical" as const,
        currentPeriodEnd: org.current_period_end,
        createdAt: org.created_at,
      };
    });

    return NextResponse.json({
      // Core MRR Metrics
      mrr: {
        current: currentMRR,
        new: newMRR,
        churned: churnedMRR,
        net: netMRR,
        lastMonth: lastMonthMRR,
        growthRate: Math.round(mrrGrowthRate * 10) / 10,
        arr,
        nrr: Math.round(nrr * 10) / 10, // Net Revenue Retention
      },

      // Customer Metrics
      customers: {
        total: allOrgs.length,
        paying: activeProOrgs.length,
        free: freeOrgs.length,
        trialing: trialing.length,
        churned: churned.length,
        churnRate: Math.round(churnRate * 10) / 10,
        ltv: Math.round(ltv),
        arpu: Math.round(arpu * 100) / 100,
      },

      // Acquisition Metrics
      acquisition: {
        thisMonth: newOrgsThisMonth,
        lastMonth: newOrgsLastMonth,
        twoMonthsAgo: newOrgsTwoMonthsAgo,
        conversionRate: Math.round(conversionRate * 10) / 10,
        conversionsThisMonth: conversions,
      },

      // Usage Metrics
      usage: {
        totalUsers: totalUsers || 0,
        totalApprentices: totalApprentices || 0,
        avgApprenticesPerPayingOrg: Math.round(avgApprenticesPerPayingOrg * 10) / 10,
        totalEntries: totalEntries || 0,
        entriesLast30Days: entriesLast30Days || 0,
        entriesLast7Days: entriesLast7Days || 0,
        activeUsersLast30Days: activeUsersLast30Days || 0,
      },

      // Trend Data
      monthlyTrend,

      // Customer Health
      customerHealth: customerHealth.sort((a, b) => a.healthScore - b.healthScore),

      // Recent Activity
      recentActivity: (recentOrgs || []).map(o => ({
        id: o.id,
        name: o.name,
        plan: o.plan,
        status: o.status,
        createdAt: o.created_at,
        type: o.plan === "pro" || o.plan === "paid" ? "upgrade" : "signup",
      })),

      // Config
      config: {
        pricePerMonth: PRICE_PER_MONTH,
        currency: "NZD",
      },
    });
  } catch (error) {
    console.error("Admin MRR error:", error);
    return NextResponse.json(
      { error: "Failed to fetch MRR data" },
      { status: 500 }
    );
  }
}
