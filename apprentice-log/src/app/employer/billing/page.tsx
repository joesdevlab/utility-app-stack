"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";
import { ORG_PLANS } from "@/lib/stripe";
import { cn } from "@/lib/utils";
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
            <Skeleton key={i} className="h-96 rounded-xl" />
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
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Billing & Plans</h1>
        <p className="text-muted-foreground">
          Manage your subscription and billing information
        </p>
      </motion.div>

      {/* Current Plan */}
      {hasSubscription && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="hover:shadow-lg hover:border-orange-200 transition-all">
            <CardHeader className="pb-3 border-b bg-gradient-to-r from-orange-50/50 to-transparent">
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-md shadow-orange-500/20">
                  <CreditCard className="h-5 w-5 text-white" />
                </div>
                <span className="text-gray-900">Current Plan</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-gradient-to-br from-orange-100 to-orange-50 p-3">
                    <Users className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900 capitalize">{currentPlan}</p>
                    <p className="text-sm text-muted-foreground">
                      {organization?.max_seats || 5} seats • ${ORG_PLANS[currentPlan as keyof typeof ORG_PLANS]?.price || 29}/month
                    </p>
                  </div>
                </div>
                <Button variant="outline" onClick={handleManageBilling} className="border-orange-200 hover:bg-orange-50 hover:text-orange-600">
                  Manage Billing
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan, index) => {
          const isCurrentPlan = currentPlan === plan.id;
          const isUpgrade = plans.findIndex((p) => p.id === plan.id) >
            plans.findIndex((p) => p.id === currentPlan);

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
            >
              <Card
                className={cn(
                  "relative h-full transition-all",
                  plan.popular
                    ? "border-orange-500 shadow-lg shadow-orange-500/10"
                    : "hover:border-orange-200 hover:shadow-lg",
                  isCurrentPlan && "bg-orange-50/30"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md">Most Popular</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-gray-900">{plan.name}</CardTitle>
                  <CardDescription>{plan.seats}</CardDescription>
                  <div className="pt-2">
                    <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5 shrink-0">
                          <Check className="h-3 w-3 text-green-600" />
                        </div>
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {isCurrentPlan ? (
                    <Button disabled className="w-full bg-orange-100 text-orange-700 hover:bg-orange-100">
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Current Plan
                    </Button>
                  ) : hasSubscription ? (
                    <Button
                      variant={isUpgrade ? "default" : "outline"}
                      className={cn(
                        "w-full",
                        isUpgrade
                          ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md shadow-orange-500/20"
                          : "border-orange-200 hover:bg-orange-50 hover:text-orange-600"
                      )}
                      onClick={handleManageBilling}
                    >
                      {isUpgrade ? "Upgrade" : "Downgrade"}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      variant={plan.popular ? "default" : "outline"}
                      className={cn(
                        "w-full",
                        plan.popular
                          ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md shadow-orange-500/20"
                          : "border-orange-200 hover:bg-orange-50 hover:text-orange-600"
                      )}
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={processingPlan !== null}
                    >
                      {processingPlan === plan.id ? "Processing..." : "Get Started"}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* FAQ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="border-b bg-gradient-to-r from-orange-50/50 to-transparent">
            <CardTitle className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center">
                <HelpCircle className="h-4 w-4 text-orange-600" />
              </div>
              <span className="text-gray-900">Frequently Asked Questions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="p-4 rounded-xl bg-gray-50/50">
              <h4 className="font-medium text-gray-900">Can I change plans at any time?</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately,
                and we'll prorate your billing.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50/50">
              <h4 className="font-medium text-gray-900">What happens if I exceed my seat limit?</h4>
              <p className="text-sm text-muted-foreground mt-1">
                You won't be able to invite new apprentices until you upgrade your plan or remove
                existing members.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50/50">
              <h4 className="font-medium text-gray-900">Do you offer annual billing?</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Contact us for annual billing options with discounted rates for larger organizations.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
