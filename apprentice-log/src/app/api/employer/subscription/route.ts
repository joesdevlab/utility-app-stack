import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { EMPLOYER_PLANS } from "@/lib/employer-stripe";

// GET - Get organization subscription status
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

    // Get user's organization
    const { data: organization } = await supabase
      .from("organizations")
      .select("*")
      .eq("owner_id", user.id)
      .single();

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Get apprentice count
    const { count: apprenticeCount } = await supabase
      .from("organization_members")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", organization.id)
      .eq("status", "active");

    // Determine plan (pro/paid = unlimited, free = 2 max)
    const isPro = organization.plan === "pro" || organization.plan === "paid";
    const maxApprentices = isPro ? -1 : EMPLOYER_PLANS.free.maxApprentices;
    const canAddMore = isPro || (apprenticeCount || 0) < maxApprentices;

    return NextResponse.json({
      plan: isPro ? "pro" : "free",
      status: organization.status || "active",
      apprenticeCount: apprenticeCount || 0,
      maxApprentices,
      canAddMore,
      hasStripeSubscription: !!organization.stripe_subscription_id,
      currentPeriodEnd: organization.current_period_end,
      planDetails: isPro
        ? EMPLOYER_PLANS.pro
        : EMPLOYER_PLANS.free,
    });
  } catch (error) {
    console.error("Employer subscription status error:", error);
    return NextResponse.json(
      { error: "Failed to get subscription status" },
      { status: 500 }
    );
  }
}
