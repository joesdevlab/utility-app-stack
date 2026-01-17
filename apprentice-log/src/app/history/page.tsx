"use client";

import { useAuth } from "@/components/auth-provider";
import { AuthForm } from "@/components/auth-form";
import { AppShell } from "@/components/app-shell";
import { useEntries } from "@/hooks";
import { LogbookEntryCard } from "@/components/logbook-entry-card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Clock, Trash2, Mic, Loader2 } from "lucide-react";
import Link from "next/link";

export default function HistoryPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { entries, isLoading, removeEntry, clearEntries } = useEntries(user?.id);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        </div>
      </AppShell>
    );
  }

  if (entries.length === 0) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
              <Clock className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No entries yet</h2>
            <p className="text-muted-foreground mb-6 max-w-xs">
              Record your first day to see it appear here
            </p>
            <Link href="/">
              <Button className="bg-blue-500 hover:bg-blue-600">
                <Mic className="h-4 w-4 mr-2" />
                Record Entry
              </Button>
            </Link>
          </motion.div>
        </div>
      </AppShell>
    );
  }

  // Group entries by week
  const groupedEntries = entries.reduce((acc, entry) => {
    const date = new Date(entry.date);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const weekKey = weekStart.toISOString().split("T")[0];

    if (!acc[weekKey]) {
      acc[weekKey] = [];
    }
    acc[weekKey].push(entry);
    return acc;
  }, {} as Record<string, typeof entries>);

  return (
    <AppShell>
      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">Your Entries</h2>
            <p className="text-sm text-muted-foreground">
              {entries.length} {entries.length === 1 ? "entry" : "entries"} recorded
            </p>
          </div>
          {entries.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => {
                if (confirm("Clear all entries? This cannot be undone.")) {
                  clearEntries();
                }
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="space-y-6">
          {Object.entries(groupedEntries).map(([weekKey, weekEntries], groupIndex) => {
            const weekStart = new Date(weekKey);
            const weekLabel = weekStart.toLocaleDateString("en-NZ", {
              month: "short",
              day: "numeric",
            });

            return (
              <div key={weekKey}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs font-medium text-muted-foreground px-2">
                    Week of {weekLabel}
                  </span>
                  <div className="h-px flex-1 bg-border" />
                </div>

                <div className="space-y-4">
                  {weekEntries.map((entry, index) => (
                    <motion.div
                      key={entry.id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (groupIndex * weekEntries.length + index) * 0.05 }}
                    >
                      <div className="relative">
                        <LogbookEntryCard entry={entry} />
                        {entry.id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => {
                              if (confirm("Delete this entry?")) {
                                removeEntry(entry.id!);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
