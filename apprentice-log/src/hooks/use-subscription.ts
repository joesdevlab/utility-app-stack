import { useState, useEffect, useCallback } from "react";

export interface SubscriptionStatus {
  plan: "free" | "premium";
  status: "free" | "active" | "canceled" | "past_due" | "trialing" | "incomplete";
  isPremium: boolean;
  entriesThisMonth: number;
  entriesRemaining: number;
  entriesLimit: number;
  canCreateEntry: boolean;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}

const defaultStatus: SubscriptionStatus = {
  plan: "free",
  status: "free",
  isPremium: false,
  entriesThisMonth: 0,
  entriesRemaining: 10,
  entriesLimit: 10,
  canCreateEntry: true,
};

export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionStatus>(defaultStatus);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/subscription");

      if (!response.ok) {
        if (response.status === 401) {
          // Not authenticated, use default
          setSubscription(defaultStatus);
          return;
        }
        throw new Error("Failed to fetch subscription");
      }

      const data = await response.json();
      setSubscription(data);
    } catch (err) {
      console.error("Subscription fetch error:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setSubscription(defaultStatus);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const createCheckout = useCallback(async (priceType: "monthly" | "yearly") => {
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceType }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout");
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (err) {
      console.error("Checkout error:", err);
      throw err;
    }
  }, []);

  const openPortal = useCallback(async () => {
    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to open portal");
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (err) {
      console.error("Portal error:", err);
      throw err;
    }
  }, []);

  return {
    subscription,
    isLoading,
    error,
    refetch: fetchSubscription,
    createCheckout,
    openPortal,
  };
}
