"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

export function PWAUpdate() {
  const hasShownToast = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    const handleControllerChange = () => {
      // Prevent showing multiple toasts
      if (hasShownToast.current) return;
      hasShownToast.current = true;

      toast.info("Update Available", {
        description: "A new version of Bio-Swap is ready.",
        duration: Infinity,
        action: {
          label: "Refresh",
          onClick: () => {
            window.location.reload();
          },
        },
      });
    };

    // Listen for new service worker taking control
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      handleControllerChange
    );

    // Also check for waiting service worker on mount
    navigator.serviceWorker.ready.then((registration) => {
      if (registration.waiting) {
        handleControllerChange();
      }

      // Listen for new service worker installing
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener("statechange", () => {
          if (
            newWorker.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            handleControllerChange();
          }
        });
      });
    });

    return () => {
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        handleControllerChange
      );
    };
  }, []);

  return null;
}
