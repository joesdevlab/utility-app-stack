import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import Stripe from "stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.supabase_user_id;

        if (userId && session.subscription) {
          // Get subscription details - use any to handle Stripe API version differences
          const subscriptionData = await stripe.subscriptions.retrieve(
            session.subscription as string
          ) as unknown as {
            id: string;
            items: { data: Array<{ price: { id: string } }> };
            current_period_start: number;
            current_period_end: number;
            cancel_at_period_end: boolean;
          };

          await supabase
            .from("subscriptions")
            .upsert({
              user_id: userId,
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: subscriptionData.id,
              stripe_price_id: subscriptionData.items.data[0].price.id,
              status: "active",
              plan: "premium",
              current_period_start: new Date(subscriptionData.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscriptionData.current_period_end * 1000).toISOString(),
              cancel_at_period_end: subscriptionData.cancel_at_period_end,
            });
        }
        break;
      }

      case "customer.subscription.updated": {
        // Cast to handle Stripe API version differences
        const subscription = event.data.object as unknown as {
          id: string;
          customer: string;
          status: string;
          items: { data: Array<{ price: { id: string } }> };
          current_period_start: number;
          current_period_end: number;
          cancel_at_period_end: boolean;
        };
        const customerId = subscription.customer;

        // Find user by customer ID
        const { data: existingSub } = await supabase
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (existingSub) {
          const status = subscription.status === "active" || subscription.status === "trialing"
            ? "active"
            : subscription.status;

          await supabase
            .from("subscriptions")
            .update({
              stripe_subscription_id: subscription.id,
              stripe_price_id: subscription.items.data[0].price.id,
              status: status,
              plan: status === "active" ? "premium" : "free",
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end,
            })
            .eq("stripe_customer_id", customerId);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as { customer: string };
        const customerId = subscription.customer;

        await supabase
          .from("subscriptions")
          .update({
            status: "canceled",
            plan: "free",
            stripe_subscription_id: null,
            stripe_price_id: null,
          })
          .eq("stripe_customer_id", customerId);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        await supabase
          .from("subscriptions")
          .update({
            status: "past_due",
          })
          .eq("stripe_customer_id", customerId);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
