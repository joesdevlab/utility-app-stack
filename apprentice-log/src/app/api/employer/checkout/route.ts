import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe, STRIPE_EMPLOYER_PRO_PRICE } from "@/lib/employer-stripe";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { plan } = body;

    // Only "pro" plan is available for checkout
    if (plan !== "pro") {
      return NextResponse.json(
        { error: "Invalid plan. Only 'pro' plan is available for checkout." },
        { status: 400 }
      );
    }

    const priceId = STRIPE_EMPLOYER_PRO_PRICE;

    if (!priceId) {
      return NextResponse.json(
        { error: "Stripe price not configured. Set STRIPE_PRICE_EMPLOYER_PRO env var." },
        { status: 500 }
      );
    }

    // Check if user already owns an organization
    const { data: organization } = await supabase
      .from("organizations")
      .select("*")
      .eq("owner_id", user.id)
      .single();

    if (!organization) {
      return NextResponse.json(
        { error: "You must create an organization first" },
        { status: 400 }
      );
    }

    const stripe = getStripe();

    // Create or get Stripe customer
    let customerId = organization.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          organization_id: organization.id,
          user_id: user.id,
          type: "organization",
        },
      });
      customerId = customer.id;

      // Store customer ID
      await supabase
        .from("organizations")
        .update({ stripe_customer_id: customerId })
        .eq("id", organization.id);
    }

    // Create checkout session for Pro plan ($29/mo)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/employer/billing?success=true`,
      cancel_url: `${appUrl}/employer/billing?canceled=true`,
      metadata: {
        organization_id: organization.id,
        plan: "pro",
        type: "organization",
      },
      subscription_data: {
        metadata: {
          organization_id: organization.id,
          plan: "pro",
          type: "organization",
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Employer checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
