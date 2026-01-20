import { NextRequest, NextResponse } from "next/server";
import { stripe, STRIPE_PRICES } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the price type from request body
    const { priceType } = await request.json();

    if (!priceType || !["monthly", "yearly"].includes(priceType)) {
      return NextResponse.json(
        { error: "Invalid price type" },
        { status: 400 }
      );
    }

    const priceId = priceType === "monthly" ? STRIPE_PRICES.monthly : STRIPE_PRICES.yearly;

    // Check if user already has a Stripe customer ID
    const adminSupabase = createAdminClient();
    const { data: subscription } = await adminSupabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    let customerId = subscription?.stripe_customer_id;

    // Create a new customer if needed
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });
      customerId = customer.id;

      // Store the customer ID
      await adminSupabase
        .from("subscriptions")
        .upsert({
          user_id: user.id,
          stripe_customer_id: customerId,
          status: "free",
          plan: "free",
        });
    }

    // Create checkout session
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
      success_url: `${appUrl}/settings?success=true`,
      cancel_url: `${appUrl}/pricing?canceled=true`,
      metadata: {
        supabase_user_id: user.id,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
