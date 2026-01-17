"use client";

import Script from "next/script";

/**
 * Analytics component using Plausible
 * Privacy-focused analytics that doesn't require cookies or GDPR consent
 *
 * To enable:
 * 1. Sign up at https://plausible.io
 * 2. Add your domain
 * 3. Set NEXT_PUBLIC_PLAUSIBLE_DOMAIN in environment variables
 *
 * Optional: Self-host Plausible and set NEXT_PUBLIC_PLAUSIBLE_HOST
 */
export function Analytics() {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  const host = process.env.NEXT_PUBLIC_PLAUSIBLE_HOST || "https://plausible.io";

  // Don't render anything if analytics is not configured
  if (!domain) {
    return null;
  }

  return (
    <Script
      defer
      data-domain={domain}
      src={`${host}/js/script.js`}
      strategy="afterInteractive"
    />
  );
}

/**
 * Track custom events in Plausible
 * Usage: trackEvent('Signup', { plan: 'premium' })
 */
export function trackEvent(
  eventName: string,
  props?: Record<string, string | number | boolean>
) {
  if (typeof window !== "undefined" && "plausible" in window) {
    (window as { plausible: (name: string, options?: { props: Record<string, string | number | boolean> }) => void }).plausible(eventName, props ? { props } : undefined);
  }
}
