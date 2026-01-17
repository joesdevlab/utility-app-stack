"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { AuthForm } from "@/components/auth-form";
import { AppShell } from "@/components/app-shell";
import { useEntries } from "@/hooks";
import { LogbookEntryCard } from "@/components/logbook-entry-card";
import { EntryEditSheet } from "@/components/entry-edit-sheet";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Clock, Trash2, Pencil, Mic, Loader2, Search, X, ChevronLeft, ChevronRight, Calendar, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Link from "next/link";
import type { LogbookEntry } from "@/types";

export default function HistoryPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { entries, isLoading, removeEntry, updateEntry, clearEntries } = useEntries(user?.id);
  const [editingEntry, setEditingEntry] = useState<LogbookEntry | null>(null);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const ENTRIES_PER_PAGE = 20;

  const handleEditEntry = (entry: LogbookEntry) => {
    setEditingEntry(entry);
    setEditSheetOpen(true);
  };

  const handleSaveEntry = async (id: string, updates: Partial<LogbookEntry>) => {
    const result = await updateEntry(id, updates);
    return result;
  };

  // Filter entries based on search query and date range
  const filteredEntries = entries.filter((entry) => {
    // Date range filter
    if (startDate && entry.date < startDate) return false;
    if (endDate && entry.date > endDate) return false;

    // Text search filter
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();

    // Search in tasks
    const taskMatch = entry.tasks?.some(
      (task) =>
        task.description.toLowerCase().includes(query) ||
        task.tools.some((t) => t.toLowerCase().includes(query)) ||
        task.skills.some((s) => s.toLowerCase().includes(query))
    );

    // Search in other fields
    const noteMatch = entry.notes?.toLowerCase().includes(query);
    const safetyMatch = entry.safetyObservations?.toLowerCase().includes(query);
    const siteMatch = entry.siteName?.toLowerCase().includes(query);
    const supervisorMatch = entry.supervisor?.toLowerCase().includes(query);
    const dateMatch = entry.date.includes(query);

    return taskMatch || noteMatch || safetyMatch || siteMatch || supervisorMatch || dateMatch;
  });

  const hasActiveFilters = startDate || endDate;

  const clearDateFilters = () => {
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredEntries.length / ENTRIES_PER_PAGE);
  const startIndex = (currentPage - 1) * ENTRIES_PER_PAGE;
  const paginatedEntries = filteredEntries.slice(startIndex, startIndex + ENTRIES_PER_PAGE);

  // Reset to page 1 when search changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

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

  // Group paginated entries by week
  const groupedEntries = paginatedEntries.reduce((acc, entry) => {
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
        <div className="flex items-center justify-between mb-4">
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
              aria-label="Clear all entries"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Search and Filters */}
        {entries.length > 0 && (
          <div className="space-y-3 mb-6">
            {/* Search */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks, tools, skills..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-9 pr-9"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <Button
                variant={hasActiveFilters ? "default" : "outline"}
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
                className={hasActiveFilters ? "bg-blue-500 hover:bg-blue-600" : ""}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            {/* Date Range Picker */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-muted/50 rounded-lg p-3 space-y-3"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Date Range</span>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-auto h-7 text-xs"
                      onClick={clearDateFilters}
                    >
                      Clear
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">
                      From
                    </label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">
                      To
                    </label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => {
                        setEndDate(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="text-sm"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Search Results Info */}
        {searchQuery && (
          <p className="text-sm text-muted-foreground mb-4">
            {filteredEntries.length} {filteredEntries.length === 1 ? "result" : "results"} for &quot;{searchQuery}&quot;
          </p>
        )}

        {/* No search results */}
        {searchQuery && filteredEntries.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No entries match your search</p>
            <Button
              variant="link"
              className="mt-2 text-blue-500"
              onClick={() => setSearchQuery("")}
            >
              Clear search
            </Button>
          </div>
        )}

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
                          <div className="absolute top-2 right-2 flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-blue-500"
                              onClick={() => handleEditEntry(entry)}
                              aria-label="Edit entry"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => {
                                if (confirm("Delete this entry?")) {
                                  removeEntry(entry.id!);
                                }
                              }}
                              aria-label="Delete entry"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8 pb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground px-3">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <EntryEditSheet
        entry={editingEntry}
        open={editSheetOpen}
        onOpenChange={setEditSheetOpen}
        onSave={handleSaveEntry}
      />
    </AppShell>
  );
}
