"use client";

import Script from "next/script";

/**
 * Analytics component using Plausible (self-hosted via Laika Dynamics)
 * Privacy-focused analytics that doesn't require cookies or GDPR consent
 */
export function Analytics() {
  return (
    <>
      <Script
        async
        src="https://analytics.laikadynamics.com/js/pa-VUu0hpVfVrtOLummGeoWt.js"
        strategy="afterInteractive"
      />
      <Script
        id="plausible-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)};
            plausible.init=plausible.init||function(i){plausible.o=i||{}};
            plausible.init();
          `,
        }}
      />
    </>
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
