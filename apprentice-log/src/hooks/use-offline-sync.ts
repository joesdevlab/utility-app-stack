"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useOnlineStatus } from "./use-online-status";
import {
  getPendingEntries,
  getPendingEntryCount,
  removePendingEntry,
  updatePendingEntry,
  savePendingEntry,
  type PendingEntry,
} from "@/lib/offline-storage";
import type { LogbookEntry } from "@/types";

const MAX_RETRY_ATTEMPTS = 5;
const SYNC_INTERVAL = 30000; // 30 seconds

interface UseOfflineSyncOptions {
  onSyncSuccess?: (entry: LogbookEntry) => void;
  onSyncError?: (error: string, pendingEntry: PendingEntry) => void;
  submitEntry: (
    entry: Omit<LogbookEntry, "id" | "createdAt">
  ) => Promise<LogbookEntry>;
}

export function useOfflineSync({
  onSyncSuccess,
  onSyncError,
  submitEntry,
}: UseOfflineSyncOptions) {
  const isOnline = useOnlineStatus();
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingEntries, setPendingEntries] = useState<PendingEntry[]>([]);
  const syncingRef = useRef(false);

  // Load pending entries count
  const refreshPendingCount = useCallback(async () => {
    try {
      const count = await getPendingEntryCount();
      setPendingCount(count);
    } catch (error) {
      console.error("Failed to get pending count:", error);
    }
  }, []);

  // Load all pending entries
  const refreshPendingEntries = useCallback(async () => {
    try {
      const entries = await getPendingEntries();
      setPendingEntries(entries);
      setPendingCount(entries.length);
    } catch (error) {
      console.error("Failed to get pending entries:", error);
    }
  }, []);

  // Save entry for offline sync
  const saveOffline = useCallback(
    async (entry: Omit<LogbookEntry, "id" | "createdAt">) => {
      try {
        const id = await savePendingEntry(entry);
        await refreshPendingCount();
        return id;
      } catch (error) {
        console.error("Failed to save offline:", error);
        throw error;
      }
    },
    [refreshPendingCount]
  );

  // Sync a single pending entry
  const syncEntry = useCallback(
    async (pendingEntry: PendingEntry): Promise<boolean> => {
      try {
        // Update attempt count
        await updatePendingEntry(pendingEntry.id, {
          attempts: pendingEntry.attempts + 1,
          lastAttempt: new Date().toISOString(),
        });

        // Try to submit
        const savedEntry = await submitEntry(pendingEntry.entry);

        // Success - remove from pending
        await removePendingEntry(pendingEntry.id);
        onSyncSuccess?.(savedEntry);
        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";

        // Update with error
        await updatePendingEntry(pendingEntry.id, {
          error: errorMessage,
        });

        // Check if max attempts reached
        if (pendingEntry.attempts + 1 >= MAX_RETRY_ATTEMPTS) {
          onSyncError?.(
            `Failed after ${MAX_RETRY_ATTEMPTS} attempts: ${errorMessage}`,
            pendingEntry
          );
        }

        return false;
      }
    },
    [submitEntry, onSyncSuccess, onSyncError]
  );

  // Sync all pending entries
  const syncAll = useCallback(async () => {
    if (syncingRef.current || !isOnline) return;

    syncingRef.current = true;
    setIsSyncing(true);

    try {
      const entries = await getPendingEntries();

      for (const entry of entries) {
        // Skip if max attempts reached
        if (entry.attempts >= MAX_RETRY_ATTEMPTS) continue;

        // Check if still online before each sync
        if (!navigator.onLine) break;

        await syncEntry(entry);
      }
    } catch (error) {
      console.error("Sync all failed:", error);
    } finally {
      syncingRef.current = false;
      setIsSyncing(false);
      await refreshPendingEntries();
    }
  }, [isOnline, syncEntry, refreshPendingEntries]);

  // Remove a failed entry manually
  const removePending = useCallback(
    async (id: string) => {
      try {
        await removePendingEntry(id);
        await refreshPendingEntries();
      } catch (error) {
        console.error("Failed to remove pending entry:", error);
      }
    },
    [refreshPendingEntries]
  );

  // Retry a specific entry
  const retryEntry = useCallback(
    async (id: string) => {
      const entry = pendingEntries.find((e) => e.id === id);
      if (!entry || !isOnline) return;

      setIsSyncing(true);
      try {
        // Reset attempts for manual retry
        await updatePendingEntry(id, { attempts: 0, error: undefined });
        const updatedEntry = { ...entry, attempts: 0, error: undefined };
        await syncEntry(updatedEntry);
      } finally {
        setIsSyncing(false);
        await refreshPendingEntries();
      }
    },
    [pendingEntries, isOnline, syncEntry, refreshPendingEntries]
  );

  // Initial load
  useEffect(() => {
    refreshPendingEntries();
  }, [refreshPendingEntries]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && pendingCount > 0) {
      // Small delay to ensure connection is stable
      const timeout = setTimeout(() => {
        syncAll();
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [isOnline, pendingCount, syncAll]);

  // Periodic sync check
  useEffect(() => {
    if (!isOnline) return;

    const interval = setInterval(() => {
      if (pendingCount > 0) {
        syncAll();
      }
    }, SYNC_INTERVAL);

    return () => clearInterval(interval);
  }, [isOnline, pendingCount, syncAll]);

  return {
    isOnline,
    pendingCount,
    pendingEntries,
    isSyncing,
    saveOffline,
    syncAll,
    removePending,
    retryEntry,
    refreshPendingEntries,
  };
}
