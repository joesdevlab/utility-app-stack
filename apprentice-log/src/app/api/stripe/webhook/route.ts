import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/employer-stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { emitHubEvent } from "@/lib/hub";
import Stripe from "stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();
  const stripe = getStripe();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        // Only handle organization subscriptions (B2B model)
        if (session.metadata?.type === "organization") {
          const organizationId = session.metadata?.organization_id;

          if (organizationId && session.subscription) {
            const subscriptionData = await stripe.subscriptions.retrieve(
              session.subscription as string
            ) as unknown as {
              id: string;
              items: { data: Array<{ price: { id: string } }> };
              current_period_start: number;
              current_period_end: number;
              cancel_at_period_end: boolean;
            };

            // B2B model: Pro plan = unlimited (-1 max_seats for backwards compat)
            await supabase
              .from("organizations")
              .update({
                stripe_subscription_id: subscriptionData.id,
                plan: "pro",
                status: "active",
                max_seats: 999999, // Effectively unlimited
                current_period_start: new Date(subscriptionData.current_period_start * 1000).toISOString(),
                current_period_end: new Date(subscriptionData.current_period_end * 1000).toISOString(),
              })
              .eq("id", organizationId);

            // Emit Hub event — fire-and-forget
            void emitHubEvent("apprenticelog.subscription.changed", {
              stripe_subscription_id: subscriptionData.id,
              status: "active",
              plan: "pro",
              customer_email: session.customer_email || "",
              amount_cents: 2900,
              gst_cents: Math.round(2900 * 3 / 23),
              net_cents: 2900 - Math.round(2900 * 3 / 23),
              currency: "nzd",
            });
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as unknown as {
          id: string;
          customer: string;
          status: string;
          metadata?: { type?: string; organization_id?: string; plan?: string };
          items: { data: Array<{ price: { id: string } }> };
          current_period_start: number;
          current_period_end: number;
          cancel_at_period_end: boolean;
        };
        const customerId = subscription.customer;

        // Only handle organization subscriptions (B2B model)
        if (subscription.metadata?.type === "organization") {
          const { data: existingOrg } = await supabase
            .from("organizations")
            .select("id")
            .eq("stripe_customer_id", customerId)
            .single();

          if (existingOrg) {
            const isActive = subscription.status === "active" || subscription.status === "trialing";

            await supabase
              .from("organizations")
              .update({
                stripe_subscription_id: subscription.id,
                status: isActive ? "active" : subscription.status,
                plan: isActive ? "pro" : "free",
                max_seats: isActive ? 999999 : 2, // Pro = unlimited, Free = 2
                current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              })
              .eq("stripe_customer_id", customerId);

            // Emit Hub event — fire-and-forget
            void emitHubEvent("apprenticelog.subscription.changed", {
              stripe_subscription_id: subscription.id,
              status: subscription.status,
              plan: isActive ? "pro" : "free",
            });
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as {
          customer: string;
          metadata?: { type?: string };
        };
        const customerId = subscription.customer;

        // Only handle organization subscriptions (B2B model)
        if (subscription.metadata?.type === "organization") {
          // Find the org first so we can handle excess members
          const { data: org } = await supabase
            .from("organizations")
            .select("id")
            .eq("stripe_customer_id", customerId)
            .single();

          // Downgrade to free plan (2 apprentice limit)
          await supabase
            .from("organizations")
            .update({
              status: "canceled",
              plan: "free",
              max_seats: 2,
              stripe_subscription_id: null,
            })
            .eq("stripe_customer_id", customerId);

          // Emit Hub event — fire-and-forget
          void emitHubEvent("apprenticelog.subscription.changed", {
            status: "canceled",
            plan: "free",
          });

          // Suspend excess apprentices beyond the free limit (keep the 2 most recently joined)
          if (org) {
            const { data: apprentices } = await supabase
              .from("organization_members")
              .select("id")
              .eq("organization_id", org.id)
              .eq("role", "apprentice")
              .eq("status", "active")
              .order("joined_at", { ascending: false });

            if (apprentices && apprentices.length > 2) {
              const excessIds = apprentices.slice(2).map((a: { id: string }) => a.id);
              await supabase
                .from("organization_members")
                .update({ status: "suspended" })
                .in("id", excessIds);
            }
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        // Check if this is an organization subscription
        const { data: existingOrg } = await supabase
          .from("organizations")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (existingOrg) {
          await supabase
            .from("organizations")
            .update({
              status: "past_due",
            })
            .eq("stripe_customer_id", customerId);

          // Emit Hub event — fire-and-forget
          void emitHubEvent("apprenticelog.subscription.changed", {
            status: "past_due",
            plan: "pro",
          });
        }
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
