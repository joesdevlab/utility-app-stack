"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useOnlineStatus } from "./use-online-status";
import {
  getPendingEntries,
  getPendingEntryCount,
  removePendingEntry,
  updatePendingEntry,
  savePendingEntry,
  savePendingAudio,
  getPendingAudioCount,
  getPendingAudio,
  removePendingAudio,
  updatePendingAudio,
  type PendingEntry,
  type PendingAudio,
} from "@/lib/offline-storage";
import {
  registerBackgroundSync,
  SYNC_AUDIO_TAG,
} from "@/lib/background-sync";
import type { LogbookEntry } from "@/types";

const MAX_RETRY_ATTEMPTS = 5;
const SYNC_INTERVAL = 30000; // 30 seconds

interface UseOfflineSyncOptions {
  onSyncSuccess?: (entry: LogbookEntry) => void;
  onSyncError?: (error: string, pendingEntry: PendingEntry) => void;
  onAudioProcessed?: (entry: LogbookEntry) => void;
  submitEntry: (
    entry: Omit<LogbookEntry, "id" | "createdAt">
  ) => Promise<LogbookEntry>;
}

export function useOfflineSync({
  onSyncSuccess,
  onSyncError,
  onAudioProcessed,
  submitEntry,
}: UseOfflineSyncOptions) {
  const isOnline = useOnlineStatus();
  const [pendingCount, setPendingCount] = useState(0);
  const [pendingAudioCount, setPendingAudioCount] = useState(0);
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

  // Load pending audio count
  const refreshPendingAudioCount = useCallback(async () => {
    try {
      const count = await getPendingAudioCount();
      setPendingAudioCount(count);
    } catch (error) {
      console.error("Failed to get pending audio count:", error);
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

  // Refresh all counts
  const refreshAll = useCallback(async () => {
    await Promise.all([refreshPendingEntries(), refreshPendingAudioCount()]);
  }, [refreshPendingEntries, refreshPendingAudioCount]);

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

  // Save audio blob for offline processing
  const saveOfflineAudio = useCallback(
    async (audioBlob: Blob, userId?: string) => {
      try {
        const id = await savePendingAudio(audioBlob, userId);
        await refreshPendingAudioCount();

        // Register background sync to process when online
        await registerBackgroundSync(SYNC_AUDIO_TAG);

        return id;
      } catch (error) {
        console.error("Failed to save offline audio:", error);
        throw error;
      }
    },
    [refreshPendingAudioCount]
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

  // Process a single pending audio entry (client-side fallback)
  const processAudioEntry = useCallback(
    async (audioEntry: PendingAudio): Promise<boolean> => {
      try {
        await updatePendingAudio(audioEntry.id, {
          attempts: audioEntry.attempts + 1,
          lastAttempt: new Date().toISOString(),
        });

        // Transcribe
        const formData = new FormData();
        formData.append("audio", audioEntry.audioBlob, "recording.webm");

        const transcribeRes = await fetch("/api/transcribe", {
          method: "POST",
          body: formData,
          credentials: "include",
        });

        if (!transcribeRes.ok) throw new Error(`Transcription failed: ${transcribeRes.status}`);
        const { text } = await transcribeRes.json();

        // Format
        const formatRes = await fetch("/api/format-entry", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transcript: text }),
          credentials: "include",
        });

        if (!formatRes.ok) throw new Error(`Format failed: ${formatRes.status}`);
        const logbookEntry = await formatRes.json();
        logbookEntry.rawTranscript = text;
        if (!logbookEntry.formattedEntry) logbookEntry.formattedEntry = "";

        // Submit to Supabase
        const savedEntry = await submitEntry(logbookEntry);
        await removePendingAudio(audioEntry.id);
        onAudioProcessed?.(savedEntry);
        return true;
      } catch (error) {
        const msg = error instanceof Error ? error.message : "Unknown error";
        console.error("Audio processing failed:", msg);
        await updatePendingAudio(audioEntry.id, { error: msg });
        return false;
      }
    },
    [submitEntry, onAudioProcessed]
  );

  // Sync all pending entries and audio
  const syncAll = useCallback(async () => {
    if (syncingRef.current || !isOnline) return;

    syncingRef.current = true;
    setIsSyncing(true);

    try {
      // Sync text entries
      const entries = await getPendingEntries();
      for (const entry of entries) {
        if (entry.attempts >= MAX_RETRY_ATTEMPTS) continue;
        if (!navigator.onLine) break;
        await syncEntry(entry);
      }

      // Sync audio entries (client-side fallback if SW background sync didn't run)
      const audioEntries = await getPendingAudio();
      for (const audioEntry of audioEntries) {
        if (audioEntry.attempts >= MAX_RETRY_ATTEMPTS) continue;
        if (!navigator.onLine) break;
        await processAudioEntry(audioEntry);
      }
    } catch (error) {
      console.error("Sync all failed:", error);
    } finally {
      syncingRef.current = false;
      setIsSyncing(false);
      await refreshAll();
    }
  }, [isOnline, syncEntry, processAudioEntry, refreshAll]);

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
    refreshAll();
  }, [refreshAll]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && (pendingCount > 0 || pendingAudioCount > 0)) {
      // Small delay to ensure connection is stable
      const timeout = setTimeout(() => {
        syncAll();
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [isOnline, pendingCount, pendingAudioCount, syncAll]);

  // Periodic sync check
  useEffect(() => {
    if (!isOnline) return;

    const interval = setInterval(() => {
      if (pendingCount > 0 || pendingAudioCount > 0) {
        syncAll();
      }
    }, SYNC_INTERVAL);

    return () => clearInterval(interval);
  }, [isOnline, pendingCount, pendingAudioCount, syncAll]);

  const totalPendingCount = pendingCount + pendingAudioCount;

  return {
    isOnline,
    pendingCount,
    pendingAudioCount,
    totalPendingCount,
    pendingEntries,
    isSyncing,
    saveOffline,
    saveOfflineAudio,
    syncAll,
    removePending,
    retryEntry,
    refreshPendingEntries,
  };
}
