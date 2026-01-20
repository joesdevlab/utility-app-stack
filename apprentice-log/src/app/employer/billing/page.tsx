"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { useOrganization } from "@/hooks/use-organization";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CreditCard,
  Check,
  Users,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { ORG_PLANS } from "@/lib/stripe";
import type { OrganizationPlan } from "@/types";

const plans: Array<{
  id: OrganizationPlan;
  name: string;
  price: number;
  seats: string;
  features: string[];
  popular?: boolean;
}> = [
  {
    id: "starter",
    name: "Starter",
    price: 29,
    seats: "1-5 apprentices",
    features: [
      "Up to 5 apprentice seats",
      "Apprentice logbook viewing",
      "Basic reports",
      "Email support",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    price: 79,
    seats: "6-20 apprentices",
    popular: true,
    features: [
      "Up to 20 apprentice seats",
      "Everything in Starter",
      "BCITO compliance reports",
      "CSV & PDF exports",
      "Priority support",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 149,
    seats: "21+ apprentices",
    features: [
      "Up to 100 apprentice seats",
      "Everything in Professional",
      "Custom reporting",
      "API access",
      "Dedicated support",
    ],
  },
];

export default function BillingPage() {
  const searchParams = useSearchParams();
  const { organization, refreshOrganization } = useAuth();
  const { createCheckout, openPortal, isLoading } = useOrganization();
  const [processingPlan, setProcessingPlan] = useState<OrganizationPlan | null>(null);

  // Handle checkout success/cancel
  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast.success("Subscription activated successfully!");
      refreshOrganization();
    } else if (searchParams.get("canceled") === "true") {
      toast.error("Checkout was canceled");
    }
  }, [searchParams, refreshOrganization]);

  const handleSubscribe = async (plan: OrganizationPlan) => {
    setProcessingPlan(plan);
    try {
      await createCheckout(plan);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to start checkout");
    } finally {
      setProcessingPlan(null);
    }
  };

  const handleManageBilling = async () => {
    try {
      await openPortal();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to open billing portal");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      </div>
    );
  }

  const currentPlan = organization?.plan || "starter";
  const hasSubscription = organization?.stripe_subscription_id;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Billing & Plans</h1>
        <p className="text-muted-foreground">
          Manage your subscription and billing information
        </p>
      </div>

      {/* Current Plan */}
      {hasSubscription && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-primary/10 p-3">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-semibold capitalize">{currentPlan}</p>
                  <p className="text-sm text-muted-foreground">
                    {organization?.max_seats || 5} seats • ${ORG_PLANS[currentPlan as keyof typeof ORG_PLANS]?.price || 29}/month
                  </p>
                </div>
              </div>
              <Button variant="outline" onClick={handleManageBilling}>
                Manage Billing
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = currentPlan === plan.id;
          const isUpgrade = plans.findIndex((p) => p.id === plan.id) >
            plans.findIndex((p) => p.id === currentPlan);

          return (
            <Card
              key={plan.id}
              className={`relative ${plan.popular ? "border-primary shadow-lg" : ""} ${
                isCurrentPlan ? "bg-muted/50" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary">Most Popular</Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.seats}</CardDescription>
                <div className="pt-2">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {isCurrentPlan ? (
                  <Button disabled className="w-full">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Current Plan
                  </Button>
                ) : hasSubscription ? (
                  <Button
                    variant={isUpgrade ? "default" : "outline"}
                    className="w-full"
                    onClick={handleManageBilling}
                  >
                    {isUpgrade ? "Upgrade" : "Downgrade"}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    variant={plan.popular ? "default" : "outline"}
                    className="w-full"
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={processingPlan !== null}
                  >
                    {processingPlan === plan.id ? "Processing..." : "Get Started"}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium">Can I change plans at any time?</h4>
            <p className="text-sm text-muted-foreground">
              Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately,
              and we'll prorate your billing.
            </p>
          </div>
          <div>
            <h4 className="font-medium">What happens if I exceed my seat limit?</h4>
            <p className="text-sm text-muted-foreground">
              You won't be able to invite new apprentices until you upgrade your plan or remove
              existing members.
            </p>
          </div>
          <div>
            <h4 className="font-medium">Do you offer annual billing?</h4>
            <p className="text-sm text-muted-foreground">
              Contact us for annual billing options with discounted rates for larger organizations.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
