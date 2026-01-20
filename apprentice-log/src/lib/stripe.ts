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

export const PLANS = {
  free: {
    name: "Free",
    description: "10 entries per month",
    price: 0,
    entriesPerMonth: 10,
  },
  premium: {
    name: "Premium",
    description: "Unlimited entries",
    priceMonthly: 4.99,
    priceYearly: 39,
    entriesPerMonth: -1, // unlimited
  },
} as const;

// Employer/Organization Plans
export const ORG_PLANS = {
  starter: {
    name: "Starter",
    description: "1-5 apprentices",
    price: 29,
    maxSeats: 5,
  },
  professional: {
    name: "Professional",
    description: "6-20 apprentices",
    price: 79,
    maxSeats: 20,
  },
  enterprise: {
    name: "Enterprise",
    description: "21+ apprentices",
    price: 149,
    maxSeats: 100,
  },
} as const;

export const STRIPE_PRICES = {
  monthly: process.env.STRIPE_PRICE_MONTHLY!,
  yearly: process.env.STRIPE_PRICE_YEARLY!,
};

// Organization plan prices (set in Stripe Dashboard)
export const STRIPE_ORG_PRICES = {
  starter: process.env.STRIPE_PRICE_ORG_STARTER!,
  professional: process.env.STRIPE_PRICE_ORG_PROFESSIONAL!,
  enterprise: process.env.STRIPE_PRICE_ORG_ENTERPRISE!,
};
