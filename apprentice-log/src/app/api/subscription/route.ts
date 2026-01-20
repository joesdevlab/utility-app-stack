import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PLANS } from "@/lib/stripe";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get subscription status
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .single();

    // Get entry count for this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: entriesThisMonth } = await supabase
      .from("apprentice_entries")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_deleted", false)
      .gte("date", startOfMonth.toISOString().split("T")[0]);

    const plan = subscription?.plan || "free";
    const status = subscription?.status || "free";
    const isPremium = plan === "premium" && (status === "active" || status === "trialing");

    const entriesRemaining = isPremium
      ? -1 // unlimited
      : Math.max(0, PLANS.free.entriesPerMonth - (entriesThisMonth || 0));

    const canCreateEntry = isPremium || entriesRemaining > 0;

    return NextResponse.json({
      plan,
      status,
      isPremium,
      entriesThisMonth: entriesThisMonth || 0,
      entriesRemaining,
      entriesLimit: isPremium ? -1 : PLANS.free.entriesPerMonth,
      canCreateEntry,
      currentPeriodEnd: subscription?.current_period_end,
      cancelAtPeriodEnd: subscription?.cancel_at_period_end,
    });
  } catch (error) {
    console.error("Subscription status error:", error);
    return NextResponse.json(
      { error: "Failed to get subscription status" },
      { status: 500 }
    );
  }
}
