"use client";

import { useEffect, useState } from "react";

interface AriaLiveProps {
  message: string;
  politeness?: "polite" | "assertive";
}

/**
 * Component that announces messages to screen readers
 * Use "polite" for non-urgent updates, "assertive" for important alerts
 */
export function AriaLive({ message, politeness = "polite" }: AriaLiveProps) {
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    if (message) {
      // Clear first, then set - ensures screen reader picks up the change
      setAnnouncement("");
      const timer = setTimeout(() => setAnnouncement(message), 100);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  );
}

/**
 * Hook to manage aria-live announcements
 */
export function useAriaAnnounce() {
  const [message, setMessage] = useState("");
  const [politeness, setPoliteness] = useState<"polite" | "assertive">("polite");

  const announce = (text: string, priority: "polite" | "assertive" = "polite") => {
    setPoliteness(priority);
    setMessage("");
    // Small delay to ensure the empty state is registered
    setTimeout(() => setMessage(text), 50);
  };

  return { message, politeness, announce };
}
