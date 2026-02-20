"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, Cloud, Loader2 } from "lucide-react";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { getPendingEntryCount } from "@/lib/offline-storage";

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();
  const [pendingCount, setPendingCount] = useState(0);
  const [showSyncingIndicator, setShowSyncingIndicator] = useState(false);

  // Load pending count
  useEffect(() => {
    const loadCount = async () => {
      try {
        const count = await getPendingEntryCount();
        setPendingCount(count);
      } catch {
        // IndexedDB not available
      }
    };

    loadCount();

    // Refresh count periodically
    const interval = setInterval(loadCount, 5000);
    return () => clearInterval(interval);
  }, []);

  // Show syncing indicator briefly when coming back online with pending entries
  useEffect(() => {
    if (isOnline && pendingCount > 0) {
      setShowSyncingIndicator(true);
      const timeout = setTimeout(() => setShowSyncingIndicator(false), 3000);
      return () => clearTimeout(timeout);
    }
  }, [isOnline, pendingCount]);

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white py-2 px-4 flex items-center justify-center gap-2 text-sm font-medium safe-area-top"
        >
          <WifiOff className="h-4 w-4" />
          <span>
            You&apos;re offline.
            {pendingCount > 0 && ` ${pendingCount} ${pendingCount === 1 ? 'entry' : 'entries'} saved locally.`}
          </span>
        </motion.div>
      )}

      {/* Brief syncing indicator when back online */}
      {isOnline && showSyncingIndicator && pendingCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-0 left-0 right-0 z-50 bg-blue-500 text-white py-2 px-4 flex items-center justify-center gap-2 text-sm font-medium safe-area-top"
        >
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Back online! Syncing {pendingCount} {pendingCount === 1 ? 'entry' : 'entries'}...</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
