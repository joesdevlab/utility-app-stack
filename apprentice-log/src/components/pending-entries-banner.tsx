"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Cloud, CloudOff, Loader2, RefreshCw, Trash2, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { PendingEntry } from "@/lib/offline-storage";

interface PendingEntriesBannerProps {
  pendingCount: number;
  pendingEntries: PendingEntry[];
  isSyncing: boolean;
  isOnline: boolean;
  onSyncAll: () => void;
  onRetryEntry: (id: string) => void;
  onRemoveEntry: (id: string) => void;
}

export function PendingEntriesBanner({
  pendingCount,
  pendingEntries,
  isSyncing,
  isOnline,
  onSyncAll,
  onRetryEntry,
  onRemoveEntry,
}: PendingEntriesBannerProps) {
  const [expanded, setExpanded] = useState(false);

  if (pendingCount === 0) return null;

  const failedEntries = pendingEntries.filter((e) => e.attempts >= 5);
  const pendingToSync = pendingEntries.filter((e) => e.attempts < 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="w-full"
    >
      <Card className={`border-0 shadow-md overflow-hidden ${
        !isOnline
          ? "bg-gradient-to-r from-amber-50 to-orange-50"
          : failedEntries.length > 0
            ? "bg-gradient-to-r from-red-50 to-orange-50"
            : "bg-gradient-to-r from-blue-50 to-cyan-50"
      }`}>
        {/* Header */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full px-4 py-3 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            {!isOnline ? (
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <CloudOff className="h-4 w-4 text-amber-600" />
              </div>
            ) : isSyncing ? (
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
              </div>
            ) : failedEntries.length > 0 ? (
              <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Cloud className="h-4 w-4 text-blue-600" />
              </div>
            )}
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-800">
                {isSyncing
                  ? "Syncing entries..."
                  : !isOnline
                  ? `${pendingCount} ${pendingCount === 1 ? "entry" : "entries"} saved offline`
                  : failedEntries.length > 0
                  ? `${failedEntries.length} ${failedEntries.length === 1 ? "entry" : "entries"} failed to sync`
                  : `${pendingCount} ${pendingCount === 1 ? "entry" : "entries"} pending sync`}
              </p>
              <p className="text-xs text-gray-500">
                {!isOnline
                  ? "Will sync when you're back online"
                  : isSyncing
                  ? "Please wait..."
                  : "Tap to view details"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isOnline && !isSyncing && pendingToSync.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                className="h-8 px-3 text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onSyncAll();
                }}
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1" />
                Sync
              </Button>
            )}
            {expanded ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </button>

        {/* Expanded List */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CardContent className="pt-0 pb-3 px-4 space-y-2 max-h-60 overflow-y-auto">
                {pendingEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className={`flex items-center justify-between p-3 rounded-xl ${
                      entry.attempts >= 5
                        ? "bg-red-100/50 border border-red-200"
                        : "bg-white/60 border border-gray-100"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {entry.entry.tasks[0]?.description || "Untitled entry"}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-500">
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </span>
                        {entry.entry.totalHours && (
                          <span className="text-xs text-orange-600 font-medium">
                            {entry.entry.totalHours}h
                          </span>
                        )}
                        {entry.attempts >= 5 && (
                          <span className="text-xs text-red-600 font-medium">
                            Failed
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      {isOnline && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                          onClick={() => onRetryEntry(entry.id)}
                          disabled={isSyncing}
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-100"
                        onClick={() => onRemoveEntry(entry.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
