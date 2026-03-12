"use client";

/**
 * Register a Background Sync event with the service worker.
 * Falls back silently if Background Sync API is not supported.
 */
export async function registerBackgroundSync(tag: string): Promise<boolean> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;

    // Check if Background Sync API is available
    if ("sync" in registration) {
      await (registration as ServiceWorkerRegistration & { sync: { register: (tag: string) => Promise<void> } }).sync.register(tag);
      return true;
    }
  } catch (error) {
    console.warn("Background Sync registration failed:", error);
  }

  return false;
}

/** Sync tag for pending text entries */
export const SYNC_ENTRIES_TAG = "sync-entries";

/** Sync tag for pending audio recordings */
export const SYNC_AUDIO_TAG = "sync-audio";
