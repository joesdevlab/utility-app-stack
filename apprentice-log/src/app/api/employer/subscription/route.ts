import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ORG_PLANS } from "@/lib/stripe";

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

    // Get member count
    const { count: memberCount } = await supabase
      .from("organization_members")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", organization.id)
      .eq("status", "active");

    const plan = organization.plan as keyof typeof ORG_PLANS;
    const planDetails = ORG_PLANS[plan] || ORG_PLANS.starter;

    return NextResponse.json({
      plan: organization.plan,
      status: organization.status,
      maxSeats: organization.max_seats,
      currentSeats: memberCount || 0,
      seatsRemaining: Math.max(0, (organization.max_seats || 5) - (memberCount || 0)),
      currentPeriodEnd: organization.current_period_end,
      currentPeriodStart: organization.current_period_start,
      hasStripeSubscription: !!organization.stripe_subscription_id,
      planDetails: {
        name: planDetails.name,
        description: planDetails.description,
        price: planDetails.price,
      },
    });
  } catch (error) {
    console.error("Employer subscription status error:", error);
    return NextResponse.json(
      { error: "Failed to get subscription status" },
      { status: 500 }
    );
  }
}
