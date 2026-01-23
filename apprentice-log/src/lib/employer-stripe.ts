import Stripe from "stripe";

// Lazy initialization to avoid build-time errors
let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-12-15.clover",
      typescript: true,
    });
  }
  return stripeInstance;
}

// For backwards compatibility
export const stripe = {
  get customers() { return getStripe().customers; },
  get subscriptions() { return getStripe().subscriptions; },
  get checkout() { return getStripe().checkout; },
  get billingPortal() { return getStripe().billingPortal; },
  get webhooks() { return getStripe().webhooks; },
};

// Simplified B2B Employer Plans
// Apprentice app is 100% FREE
// Employers pay for portal access
export const EMPLOYER_PLANS = {
  free: {
    name: "Free",
    description: "Up to 2 apprentices",
    price: 0,
    maxApprentices: 2,
  },
  pro: {
    name: "Pro",
    description: "Unlimited apprentices",
    price: 29,
    maxApprentices: -1, // unlimited
  },
} as const;

// Stripe price ID for Pro plan (create in Stripe Dashboard)
export const STRIPE_EMPLOYER_PRO_PRICE = process.env.STRIPE_PRICE_EMPLOYER_PRO!;
