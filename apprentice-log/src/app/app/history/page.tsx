"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { AuthForm } from "@/components/auth-form";
import { AppShell } from "@/components/app-shell";
import { useEntries } from "@/hooks";
import { LogbookEntryCard } from "@/components/logbook-entry-card";
import { EntryEditSheet } from "@/components/entry-edit-sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Trash2, Pencil, Mic, Loader2, Search, X, ChevronLeft, ChevronRight, Calendar, Filter, FileText } from "lucide-react";
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50/30 to-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  if (isLoading) {
    return (
      <AppShell>
        <div className="px-4 py-6 space-y-4">
          {/* Skeleton header */}
          <div className="animate-pulse">
            <div className="h-6 w-32 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-24 bg-gray-100 rounded" />
          </div>
          {/* Skeleton search */}
          <div className="h-11 bg-gray-100 rounded-xl animate-pulse" />
          {/* Skeleton cards */}
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-5 w-32 bg-gray-200 rounded mb-3" />
                <div className="h-4 w-full bg-gray-100 rounded mb-2" />
                <div className="h-4 w-3/4 bg-gray-100 rounded" />
              </CardContent>
            </Card>
          ))}
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
            <div className="relative mb-6">
              <div className="absolute inset-0 rounded-full bg-orange-500/20 blur-xl" />
              <div className="relative w-24 h-24 rounded-full overflow-hidden shadow-lg">
                <img src="/Logo-v1-128-128.png" alt="Apprentice Log" className="w-full h-full object-cover" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No entries yet</h2>
            <p className="text-muted-foreground mb-8 max-w-xs">
              Start logging your apprenticeship journey by recording your first entry
            </p>
            <Link href="/app">
              <Button className="h-12 px-6 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/25">
                <Mic className="h-4 w-4 mr-2" />
                Record Your First Entry
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
      <div className="px-4 py-4">
        {/* Header with stats */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
              <FileText className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Your Entries</h2>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-0 font-medium">
                  {entries.length} {entries.length === 1 ? "entry" : "entries"}
                </Badge>
                {entries.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {entries.reduce((sum, e) => sum + (e.totalHours || 0), 0)}h total
                  </span>
                )}
              </div>
            </div>
          </div>
          {entries.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-gray-400 hover:text-destructive hover:bg-red-50"
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
          <div className="space-y-3 mb-5">
            {/* Search */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search tasks, tools, skills..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-9 pr-9 h-11 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-orange-300 focus:ring-orange-200"
                />
                <AnimatePresence>
                  {searchQuery && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-400 hover:text-gray-600"
                        onClick={() => setSearchQuery("")}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <Button
                variant={hasActiveFilters ? "default" : "outline"}
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
                className={`h-11 w-11 rounded-xl ${
                  hasActiveFilters
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-md shadow-orange-500/25"
                    : "border-gray-200 hover:border-orange-300 hover:bg-orange-50"
                }`}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            {/* Date Range Picker */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-orange-100 flex items-center justify-center">
                        <Calendar className="h-3.5 w-3.5 text-orange-600" />
                      </div>
                      <span className="text-sm font-semibold text-gray-700">Date Range</span>
                      {hasActiveFilters && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-auto h-7 text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-100"
                          onClick={clearDateFilters}
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                          From
                        </label>
                        <Input
                          type="date"
                          value={startDate}
                          onChange={(e) => {
                            setStartDate(e.target.value);
                            setCurrentPage(1);
                          }}
                          className="text-sm h-10 rounded-lg border-orange-200 bg-white focus:border-orange-400"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                          To
                        </label>
                        <Input
                          type="date"
                          value={endDate}
                          onChange={(e) => {
                            setEndDate(e.target.value);
                            setCurrentPage(1);
                          }}
                          className="text-sm h-10 rounded-lg border-orange-200 bg-white focus:border-orange-400"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Search Results Info */}
        {searchQuery && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-0">
              {filteredEntries.length} {filteredEntries.length === 1 ? "result" : "results"} for "{searchQuery}"
            </Badge>
          </motion.div>
        )}

        {/* No search results */}
        {searchQuery && filteredEntries.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">No matches found</h3>
            <p className="text-sm text-muted-foreground mb-4">Try a different search term</p>
            <Button
              variant="outline"
              className="rounded-xl border-orange-200 text-orange-600 hover:bg-orange-50"
              onClick={() => setSearchQuery("")}
            >
              Clear search
            </Button>
          </motion.div>
        )}

        <div className="space-y-5">
          {Object.entries(groupedEntries).map(([weekKey, weekEntries], groupIndex) => {
            const weekStart = new Date(weekKey);
            const weekLabel = weekStart.toLocaleDateString("en-NZ", {
              month: "short",
              day: "numeric",
            });
            const weekHours = weekEntries.reduce((sum, e) => sum + (e.totalHours || 0), 0);

            return (
              <motion.div
                key={weekKey}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: groupIndex * 0.1 }}
              >
                {/* Week Header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-orange-200 to-transparent" />
                  <div className="flex items-center gap-2 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 px-3 py-1.5 rounded-full">
                    <Calendar className="h-3.5 w-3.5 text-orange-500" />
                    <span className="text-xs font-semibold text-orange-700">
                      Week of {weekLabel}
                    </span>
                    <span className="text-xs text-orange-500">
                      {weekHours}h
                    </span>
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-orange-200 to-transparent" />
                </div>

                <div className="space-y-3">
                  {weekEntries.map((entry, index) => (
                    <motion.div
                      key={entry.id || index}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <div className="relative group">
                        <LogbookEntryCard entry={entry} />
                        {entry.id && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute top-3 right-14 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 bg-white/90 backdrop-blur-sm border-gray-200 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600"
                              onClick={() => handleEditEntry(entry)}
                              aria-label="Edit entry"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 bg-white/90 backdrop-blur-sm border-gray-200 hover:border-red-300 hover:bg-red-50 hover:text-destructive"
                              onClick={() => {
                                if (confirm("Delete this entry?")) {
                                  removeEntry(entry.id!);
                                }
                              }}
                              aria-label="Delete entry"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 mt-8 pb-4"
          >
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-xl border-gray-200 hover:border-orange-300 hover:bg-orange-50 disabled:opacity-40"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1 bg-gray-100 rounded-xl px-4 py-2">
              <span className="text-sm font-semibold text-gray-900">{currentPage}</span>
              <span className="text-sm text-muted-foreground">of</span>
              <span className="text-sm font-semibold text-gray-900">{totalPages}</span>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-xl border-gray-200 hover:border-orange-300 hover:bg-orange-50 disabled:opacity-40"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </motion.div>
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
