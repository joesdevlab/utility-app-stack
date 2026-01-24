/**
 * Analytics Event Tracking System
 *
 * Tracks key user actions for understanding user behavior and improving GTM metrics.
 * Uses Plausible Analytics (privacy-focused, GDPR-compliant).
 *
 * Event Categories:
 * - Acquisition: signup, login, landing_page_view
 * - Activation: first_entry, profile_complete, org_created
 * - Engagement: entry_created, entry_edited, voice_recorded
 * - Retention: daily_active, weekly_active, entry_streak
 * - Referral: share_clicked, invite_sent, referral_signup
 * - Revenue: checkout_started, subscription_created, upgrade_clicked
 * - Churn: exit_survey, account_deleted, subscription_canceled
 */

declare global {
  interface Window {
    plausible?: (
      eventName: string,
      options?: { props?: Record<string, string | number | boolean> }
    ) => void;
  }
}

// Event names (keep consistent for analytics)
export const ANALYTICS_EVENTS = {
  // Acquisition
  SIGNUP_STARTED: "Signup Started",
  SIGNUP_COMPLETED: "Signup Completed",
  LOGIN_SUCCESS: "Login Success",
  LOGIN_FAILED: "Login Failed",

  // Activation
  FIRST_ENTRY_CREATED: "First Entry Created",
  PROFILE_COMPLETED: "Profile Completed",
  ORG_CREATED: "Organization Created",
  APPRENTICE_INVITED: "Apprentice Invited",

  // Engagement
  ENTRY_CREATED: "Entry Created",
  ENTRY_EDITED: "Entry Edited",
  ENTRY_DELETED: "Entry Deleted",
  VOICE_RECORDED: "Voice Recorded",
  PHOTO_ADDED: "Photo Added",
  EXPORT_DOWNLOADED: "Export Downloaded",

  // Feature Usage
  MFA_ENABLED: "MFA Enabled",
  MFA_DISABLED: "MFA Disabled",
  OFFLINE_ENTRY_SYNCED: "Offline Entry Synced",

  // Navigation
  PAGE_VIEW: "Page View",
  LANDING_CTA_CLICKED: "Landing CTA Clicked",
  PRICING_VIEWED: "Pricing Viewed",
  EMPLOYER_PORTAL_ACCESSED: "Employer Portal Accessed",

  // Retention
  DAILY_ACTIVE: "Daily Active",
  ENTRY_STREAK: "Entry Streak",

  // Referral
  SHARE_CLICKED: "Share Clicked",
  INVITE_SENT: "Invite Sent",
  REFERRAL_LINK_COPIED: "Referral Link Copied",

  // Revenue
  CHECKOUT_STARTED: "Checkout Started",
  CHECKOUT_COMPLETED: "Checkout Completed",
  UPGRADE_CLICKED: "Upgrade Clicked",
  BILLING_PORTAL_OPENED: "Billing Portal Opened",

  // Churn
  EXIT_SURVEY_SUBMITTED: "Exit Survey Submitted",
  ACCOUNT_DELETION_STARTED: "Account Deletion Started",
  ACCOUNT_DELETED: "Account Deleted",
  SUBSCRIPTION_CANCELED: "Subscription Canceled",

  // Errors
  ERROR_OCCURRED: "Error Occurred",
  API_ERROR: "API Error",
} as const;

type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

interface EventProps {
  [key: string]: string | number | boolean;
}

/**
 * Track an analytics event
 *
 * @param eventName - Name of the event to track
 * @param props - Optional properties to include with the event
 */
export function trackEvent(eventName: AnalyticsEvent | string, props?: EventProps) {
  // Only track in browser
  if (typeof window === "undefined") return;

  // Log in development
  if (process.env.NODE_ENV === "development") {
    console.log(`[Analytics] ${eventName}`, props || "");
  }

  // Send to Plausible if available
  if (window.plausible) {
    window.plausible(eventName, props ? { props } : undefined);
  }
}

/**
 * Track a page view (for SPA navigation)
 */
export function trackPageView(path: string, props?: EventProps) {
  trackEvent(ANALYTICS_EVENTS.PAGE_VIEW, { path, ...props });
}

/**
 * Track user signup
 */
export function trackSignup(method: "email" | "google" | "apple" = "email") {
  trackEvent(ANALYTICS_EVENTS.SIGNUP_COMPLETED, { method });
}

/**
 * Track user login
 */
export function trackLogin(method: "email" | "google" | "apple" = "email", mfaUsed = false) {
  trackEvent(ANALYTICS_EVENTS.LOGIN_SUCCESS, { method, mfa: mfaUsed });
}

/**
 * Track entry creation with context
 */
export function trackEntryCreated(options: {
  isFirst?: boolean;
  hasVoice?: boolean;
  hasPhoto?: boolean;
  trade?: string;
  hours?: number;
}) {
  if (options.isFirst) {
    trackEvent(ANALYTICS_EVENTS.FIRST_ENTRY_CREATED);
  }
  trackEvent(ANALYTICS_EVENTS.ENTRY_CREATED, {
    hasVoice: options.hasVoice || false,
    hasPhoto: options.hasPhoto || false,
    ...(options.trade && { trade: options.trade }),
    ...(options.hours && { hours: options.hours }),
  });
}

/**
 * Track checkout flow
 */
export function trackCheckout(
  step: "started" | "completed",
  plan: string,
  price?: number
) {
  const event =
    step === "started"
      ? ANALYTICS_EVENTS.CHECKOUT_STARTED
      : ANALYTICS_EVENTS.CHECKOUT_COMPLETED;

  trackEvent(event, {
    plan,
    ...(price !== undefined && { price }),
  });
}

/**
 * Track feature engagement
 */
export function trackFeatureUsed(feature: string, props?: EventProps) {
  trackEvent(`Feature: ${feature}`, props);
}

/**
 * Track errors for monitoring
 */
export function trackError(
  errorType: string,
  errorMessage: string,
  context?: string
) {
  trackEvent(ANALYTICS_EVENTS.ERROR_OCCURRED, {
    type: errorType,
    message: errorMessage.slice(0, 100), // Truncate long messages
    ...(context && { context }),
  });
}

/**
 * Track CTA clicks on landing page
 */
export function trackCTAClicked(
  ctaName: string,
  location: "hero" | "pricing" | "footer" | "nav" | "modal"
) {
  trackEvent(ANALYTICS_EVENTS.LANDING_CTA_CLICKED, {
    cta: ctaName,
    location,
  });
}

/**
 * Track share/referral actions
 */
export function trackShare(
  method: "link" | "email" | "whatsapp" | "copy",
  context?: string
) {
  trackEvent(ANALYTICS_EVENTS.SHARE_CLICKED, {
    method,
    ...(context && { context }),
  });
}
