"use client";

import { useEffect, useRef, useCallback } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: TurnstileOptions
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
      getResponse: (widgetId: string) => string | undefined;
    };
    onTurnstileLoad?: () => void;
  }
}

interface TurnstileOptions {
  sitekey: string;
  callback?: (token: string) => void;
  "error-callback"?: (error: unknown) => void;
  "expired-callback"?: () => void;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "compact" | "flexible";
  tabindex?: number;
  action?: string;
  cData?: string;
  appearance?: "always" | "execute" | "interaction-only";
  "response-field"?: boolean;
  "response-field-name"?: string;
}

interface TurnstileProps {
  siteKey?: string;
  onVerify: (token: string) => void;
  onError?: (error: unknown) => void;
  onExpire?: () => void;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "compact" | "flexible";
  action?: string;
  className?: string;
}

export function Turnstile({
  siteKey,
  onVerify,
  onError,
  onExpire,
  theme = "auto",
  size = "normal",
  action,
  className,
}: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const scriptLoadedRef = useRef(false);

  const effectiveSiteKey = siteKey || process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  const renderWidget = useCallback(() => {
    if (!containerRef.current || !window.turnstile || !effectiveSiteKey) return;
    if (widgetIdRef.current) return; // Already rendered

    try {
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: effectiveSiteKey,
        callback: onVerify,
        "error-callback": onError,
        "expired-callback": onExpire,
        theme,
        size,
        action,
      });
    } catch (error) {
      console.error("Turnstile render error:", error);
      onError?.(error);
    }
  }, [effectiveSiteKey, onVerify, onError, onExpire, theme, size, action]);

  useEffect(() => {
    // If Turnstile is not configured, skip rendering
    if (!effectiveSiteKey) {
      console.warn("Turnstile site key not configured - skipping widget");
      return;
    }

    // Check if script is already loaded
    if (window.turnstile) {
      renderWidget();
      return;
    }

    // Check if script tag already exists
    const existingScript = document.querySelector(
      'script[src*="challenges.cloudflare.com/turnstile"]'
    );

    if (existingScript && !scriptLoadedRef.current) {
      // Script exists but not yet loaded, wait for it
      window.onTurnstileLoad = renderWidget;
      return;
    }

    if (!existingScript) {
      // Load script
      const script = document.createElement("script");
      script.src =
        "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onTurnstileLoad";
      script.async = true;
      script.defer = true;

      window.onTurnstileLoad = () => {
        scriptLoadedRef.current = true;
        renderWidget();
      };

      document.head.appendChild(script);
    }

    return () => {
      // Cleanup widget on unmount
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // Widget may already be removed
        }
        widgetIdRef.current = null;
      }
    };
  }, [effectiveSiteKey, renderWidget]);

  // Don't render anything if no site key
  if (!effectiveSiteKey) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ minHeight: size === "compact" ? "65px" : "70px" }}
    />
  );
}

// Hook for manual token retrieval
export function useTurnstile() {
  const reset = useCallback((widgetId: string) => {
    if (window.turnstile) {
      window.turnstile.reset(widgetId);
    }
  }, []);

  const getResponse = useCallback((widgetId: string) => {
    if (window.turnstile) {
      return window.turnstile.getResponse(widgetId);
    }
    return undefined;
  }, []);

  return { reset, getResponse };
}
