"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Check, X, Mic, Crown, Zap, Loader2
} from "lucide-react";
import { useSubscription } from "@/hooks";
import { useSearchParams } from "next/navigation";
import { MarketingHeader } from "@/components/landing/marketing-header";

export default function PricingPage() {
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">("yearly");
  const [isLoading, setIsLoading] = useState(false);
  const { subscription, createCheckout } = useSubscription();
  const searchParams = useSearchParams();
  const canceled = searchParams.get("canceled");

  const handleUpgrade = async () => {
    try {
      setIsLoading(true);
      await createCheckout(billingInterval);
    } catch (error) {
      console.error("Failed to create checkout:", error);
      setIsLoading(false);
    }
  };

  const plans = [
    {
      name: "Free",
      description: "Perfect for getting started",
      price: "$0",
      interval: "forever",
      features: [
        { text: "10 entries per month", included: true },
        { text: "Voice-to-text transcription", included: true },
        { text: "AI-formatted entries", included: true },
        { text: "BCITO compliant format", included: true },
        { text: "Offline support", included: true },
        { text: "Unlimited entries", included: false },
        { text: "Priority support", included: false },
      ],
      cta: subscription.isPremium ? "Current plan downgrade" : "Current Plan",
      disabled: true,
      current: !subscription.isPremium,
    },
    {
      name: "Premium",
      description: "For serious apprentices",
      price: billingInterval === "monthly" ? "$4.99" : "$39",
      interval: billingInterval === "monthly" ? "/month" : "/year",
      savings: billingInterval === "yearly" ? "Save 35%" : null,
      features: [
        { text: "Unlimited entries", included: true },
        { text: "Voice-to-text transcription", included: true },
        { text: "AI-formatted entries", included: true },
        { text: "BCITO compliant format", included: true },
        { text: "Offline support", included: true },
        { text: "Export to PDF", included: true },
        { text: "Priority support", included: true },
      ],
      cta: subscription.isPremium ? "Current Plan" : "Upgrade Now",
      disabled: subscription.isPremium,
      current: subscription.isPremium,
      highlighted: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <MarketingHeader />

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-12">
        {/* Canceled notice */}
        {canceled && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-center"
          >
            <p className="text-yellow-800">
              Checkout was canceled. You can try again whenever you&apos;re ready.
            </p>
          </motion.div>
        )}

        {/* Hero */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-orange-100 border border-orange-200 rounded-full px-4 py-2 mb-4"
          >
            <Crown className="h-4 w-4 text-orange-600" />
            <span className="text-orange-700 text-sm font-medium">Upgrade to Premium</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4"
          >
            Unlimited entries for your apprenticeship
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            Remove the 10 entry monthly limit and log as much as you need.
            Perfect for busy apprentices working on multiple sites.
          </motion.p>
        </div>

        {/* Billing toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex items-center bg-white border border-gray-200 rounded-full p-1">
            <button
              onClick={() => setBillingInterval("monthly")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                billingInterval === "monthly"
                  ? "bg-orange-500 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval("yearly")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                billingInterval === "yearly"
                  ? "bg-orange-500 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Yearly
              <span className="ml-1.5 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                Save 35%
              </span>
            </button>
          </div>
        </motion.div>

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <Card
                className={`relative h-full ${
                  plan.highlighted
                    ? "border-orange-500 shadow-xl shadow-orange-500/10"
                    : "border-gray-200"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                {plan.current && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
                      Current
                    </span>
                  </div>
                )}

                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    {plan.highlighted ? (
                      <Zap className="h-5 w-5 text-orange-500" />
                    ) : (
                      <Mic className="h-5 w-5 text-gray-500" />
                    )}
                    {plan.name}
                  </CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-500">{plan.interval}</span>
                    {plan.savings && (
                      <span className="ml-2 text-sm text-green-600 font-medium">
                        {plan.savings}
                      </span>
                    )}
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3">
                        {feature.included ? (
                          <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                        ) : (
                          <X className="h-5 w-5 text-gray-300 flex-shrink-0" />
                        )}
                        <span className={feature.included ? "text-gray-700" : "text-gray-400"}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={plan.highlighted && !plan.disabled ? handleUpgrade : undefined}
                    disabled={plan.disabled || isLoading}
                    className={`w-full ${
                      plan.highlighted && !plan.disabled
                        ? "bg-orange-500 hover:bg-orange-600 text-white"
                        : "bg-gray-100 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {isLoading && plan.highlighted ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      plan.cta
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16 text-center"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Questions?</h2>
          <p className="text-gray-600">
            Email us at{" "}
            <a href="mailto:support@apprenticelog.nz" className="text-orange-600 hover:underline">
              support@apprenticelog.nz
            </a>
          </p>
        </motion.div>
      </main>
    </div>
  );
}
