"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/components/auth-provider";
import { AuthForm } from "@/components/auth-form";
import { AppShell } from "@/components/app-shell";
import { useEntries } from "@/hooks";
import { LogbookEntryCard } from "@/components/logbook-entry-card";
import { EntryEditSheet } from "@/components/entry-edit-sheet";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";
import { EntryListItem, ViewModeToggle } from "@/components/entry-list-item";
import { LogoSpinner, AnimatedLogo } from "@/components/animated-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Trash2,
  Pencil,
  Mic,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Filter,
  FileText,
  TrendingUp,
  Target,
  Flame,
  Plus,
  Sparkles,
} from "lucide-react";
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
  const [viewMode, setViewMode] = useState<"list" | "card">("list");
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<LogbookEntry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const ENTRIES_PER_PAGE = 20;

  // Calculate stats
  const stats = useMemo(() => {
    const totalHours = entries.reduce((sum, e) => sum + (e.totalHours || 0), 0);
    const totalEntries = entries.length;

    // Calculate streak (consecutive days with entries)
    const sortedDates = [...new Set(entries.map(e => e.date))].sort().reverse();
    let streak = 0;
    const today = new Date().toISOString().split("T")[0];
    let checkDate = today;

    for (const date of sortedDates) {
      if (date === checkDate || date === getPreviousDay(checkDate)) {
        streak++;
        checkDate = date;
      } else {
        break;
      }
    }

    // This week's hours
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekStartStr = weekStart.toISOString().split("T")[0];
    const thisWeekHours = entries
      .filter(e => e.date >= weekStartStr)
      .reduce((sum, e) => sum + (e.totalHours || 0), 0);

    return { totalHours, totalEntries, streak, thisWeekHours };
  }, [entries]);

  // Load view mode preference from localStorage
  useEffect(() => {
    const savedViewMode = localStorage.getItem("history-view-mode");
    if (savedViewMode === "list" || savedViewMode === "card") {
      setViewMode(savedViewMode);
    }
  }, []);

  // Save view mode preference
  const handleViewModeChange = (mode: "list" | "card") => {
    setViewMode(mode);
    localStorage.setItem("history-view-mode", mode);
  };

  const handleEditEntry = (entry: LogbookEntry) => {
    setEditingEntry(entry);
    setEditSheetOpen(true);
  };

  const handleSaveEntry = async (id: string, updates: Partial<LogbookEntry>) => {
    const result = await updateEntry(id, updates);
    return result;
  };

  const handleDeleteClick = (entry: LogbookEntry) => {
    setEntryToDelete(entry);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!entryToDelete?.id) return;
    setIsDeleting(true);
    try {
      await removeEntry(entryToDelete.id);
      toast.success("Entry deleted");
      setDeleteDialogOpen(false);
      setEntryToDelete(null);
    } catch {
      toast.error("Failed to delete entry");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmDeleteAll = async () => {
    setIsDeleting(true);
    try {
      await clearEntries();
      toast.success("All entries cleared");
      setDeleteAllDialogOpen(false);
    } catch {
      toast.error("Failed to clear entries");
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleEntryExpansion = (entryId: string) => {
    setExpandedEntryId((prev) => (prev === entryId ? null : entryId));
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
        <LogoSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  if (isLoading) {
    return (
      <AppShell>
        <div className="px-4 py-6 space-y-6">
          {/* Skeleton stats */}
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 animate-pulse" />
            ))}
          </div>
          {/* Skeleton search */}
          <div className="h-12 bg-gray-100 rounded-2xl animate-pulse" />
          {/* Skeleton entries */}
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </AppShell>
    );
  }

  if (entries.length === 0) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center px-4 py-12 text-center min-h-[70vh]">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center max-w-sm"
          >
            {/* Animated empty state illustration */}
            <div className="relative mb-8">
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-400/20 to-amber-400/20 blur-2xl"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <div className="relative">
                <AnimatedLogo size="xl" isLoading={false} showGlow={false} />
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Your Journey Starts Here
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Start building your apprenticeship portfolio by recording your daily work,
                skills learned, and tools used.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="w-full space-y-3"
            >
              <Link href="/app" className="block">
                <Button className="w-full h-14 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-xl shadow-orange-500/25 text-base font-semibold">
                  <Mic className="h-5 w-5 mr-2" />
                  Record Your First Entry
                </Button>
              </Link>

              <div className="flex items-center gap-3 pt-4">
                <div className="h-px flex-1 bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">QUICK TIPS</span>
                <div className="h-px flex-1 bg-gray-200" />
              </div>

              <div className="grid grid-cols-1 gap-2 text-left">
                {[
                  { icon: "🎤", text: "Speak naturally about your day" },
                  { icon: "🛠️", text: "Mention tools and skills used" },
                  { icon: "⏱️", text: "Include hours for each task" },
                ].map((tip, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                    className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3"
                  >
                    <span className="text-lg">{tip.icon}</span>
                    <span className="text-sm text-gray-600">{tip.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
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
      <div className="px-4 py-4 pb-24">
        {/* Stats Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="grid grid-cols-2 gap-3">
            {/* Total Hours Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 p-4 text-white shadow-lg shadow-orange-500/25"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <Clock className="h-5 w-5 mb-2 opacity-80" />
              <p className="text-2xl font-bold">{stats.totalHours}h</p>
              <p className="text-xs opacity-80">Total Hours</p>
            </motion.div>

            {/* This Week Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-4 text-white shadow-lg shadow-blue-500/25"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <TrendingUp className="h-5 w-5 mb-2 opacity-80" />
              <p className="text-2xl font-bold">{stats.thisWeekHours}h</p>
              <p className="text-xs opacity-80">This Week</p>
            </motion.div>

            {/* Entries Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-4 text-white shadow-lg shadow-emerald-500/25"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <FileText className="h-5 w-5 mb-2 opacity-80" />
              <p className="text-2xl font-bold">{stats.totalEntries}</p>
              <p className="text-xs opacity-80">Entries</p>
            </motion.div>

            {/* Streak Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 p-4 text-white shadow-lg shadow-amber-500/25"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <Flame className="h-5 w-5 mb-2 opacity-80" />
              <p className="text-2xl font-bold">{stats.streak}</p>
              <p className="text-xs opacity-80">Day Streak</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Header Row */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Your Logbook</h2>
            <p className="text-sm text-muted-foreground">
              {filteredEntries.length === entries.length
                ? `${entries.length} entries`
                : `${filteredEntries.length} of ${entries.length} entries`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ViewModeToggle viewMode={viewMode} onViewModeChange={handleViewModeChange} />
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-gray-400 hover:text-destructive hover:bg-red-50"
              onClick={() => setDeleteAllDialogOpen(true)}
              aria-label="Clear all entries"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-3 mb-5">
          {/* Search */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search entries..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 pr-10 h-12 rounded-2xl border-gray-200 bg-gray-50/80 focus:bg-white focus:border-orange-300 focus:ring-orange-200 text-base"
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
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 text-gray-400 hover:text-gray-600"
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
              className={`h-12 w-12 rounded-2xl ${
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
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-orange-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">Filter by Date</span>
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
                        className="text-sm h-11 rounded-xl border-orange-200 bg-white focus:border-orange-400"
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
                        className="text-sm h-11 rounded-xl border-orange-200 bg-white focus:border-orange-400"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Search Results Info */}
        {searchQuery && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-gray-600">
                Found <span className="font-semibold text-gray-900">{filteredEntries.length}</span> {filteredEntries.length === 1 ? "entry" : "entries"} matching "{searchQuery}"
              </span>
            </div>
          </motion.div>
        )}

        {/* No search results */}
        {searchQuery && filteredEntries.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center mx-auto mb-4 shadow-inner">
              <Search className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">No matches found</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
              Try searching for different keywords like task names, tools, or dates
            </p>
            <Button
              variant="outline"
              className="rounded-xl border-orange-200 text-orange-600 hover:bg-orange-50"
              onClick={() => setSearchQuery("")}
            >
              Clear search
            </Button>
          </motion.div>
        )}

        {/* Entries List */}
        <div className="space-y-6">
          {Object.entries(groupedEntries).map(([weekKey, weekEntries], groupIndex) => {
            const weekStart = new Date(weekKey);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);
            const weekLabel = `${weekStart.toLocaleDateString("en-NZ", { month: "short", day: "numeric" })} - ${weekEnd.toLocaleDateString("en-NZ", { month: "short", day: "numeric" })}`;
            const weekHours = weekEntries.reduce((sum, e) => sum + (e.totalHours || 0), 0);

            return (
              <motion.div
                key={weekKey}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIndex * 0.05 }}
              >
                {/* Week Header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-2 bg-white border border-gray-200 shadow-sm px-3 py-2 rounded-xl">
                    <Calendar className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-semibold text-gray-700">{weekLabel}</span>
                    <Badge className="bg-orange-100 text-orange-700 border-0 text-xs font-semibold">
                      {weekHours}h
                    </Badge>
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent" />
                </div>

                <div className={viewMode === "list" ? "space-y-2" : "space-y-3"}>
                  {weekEntries.map((entry, index) => (
                    <motion.div
                      key={entry.id || index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                    >
                      {viewMode === "list" ? (
                        <EntryListItem
                          entry={entry}
                          isExpanded={expandedEntryId === entry.id}
                          onToggleExpand={() => entry.id && toggleEntryExpansion(entry.id)}
                          onEdit={handleEditEntry}
                          onDelete={(entryId) => {
                            const entryToDelete = entries.find((e) => e.id === entryId);
                            if (entryToDelete) handleDeleteClick(entryToDelete);
                          }}
                        />
                      ) : (
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
                                onClick={() => handleDeleteClick(entry)}
                                aria-label="Delete entry"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </motion.div>
                          )}
                        </div>
                      )}
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
            className="flex items-center justify-center gap-3 mt-8"
          >
            <Button
              variant="outline"
              size="icon"
              className="h-11 w-11 rounded-xl border-gray-200 hover:border-orange-300 hover:bg-orange-50 disabled:opacity-40"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl px-5 py-2.5 shadow-sm">
              <span className="text-sm font-bold text-gray-900">{currentPage}</span>
              <span className="text-sm text-gray-400 mx-1">/</span>
              <span className="text-sm font-bold text-gray-900">{totalPages}</span>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-11 w-11 rounded-xl border-gray-200 hover:border-orange-300 hover:bg-orange-50 disabled:opacity-40"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </motion.div>
        )}
      </div>

      {/* Floating Action Button */}
      <Link href="/app">
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-24 right-4 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-xl shadow-orange-500/30 flex items-center justify-center"
        >
          <Plus className="h-6 w-6" />
        </motion.button>
      </Link>

      <EntryEditSheet
        entry={editingEntry}
        open={editSheetOpen}
        onOpenChange={setEditSheetOpen}
        onSave={handleSaveEntry}
      />

      {/* Delete Single Entry Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Delete Entry?"
        description="This will permanently delete this entry. This action cannot be undone."
        isLoading={isDeleting}
        variant="single"
        entryPreview={
          entryToDelete
            ? {
                date: new Date(entryToDelete.date).toLocaleDateString("en-NZ", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                }),
                hours: entryToDelete.totalHours,
                siteName: entryToDelete.siteName,
              }
            : undefined
        }
      />

      {/* Delete All Entries Dialog */}
      <DeleteConfirmationDialog
        open={deleteAllDialogOpen}
        onOpenChange={setDeleteAllDialogOpen}
        onConfirm={handleConfirmDeleteAll}
        title="Clear All Entries?"
        description={`This will permanently delete all ${entries.length} entries from your logbook.`}
        confirmText="Clear All"
        isLoading={isDeleting}
        variant="all"
      />
    </AppShell>
  );
}

// Helper function
function getPreviousDay(dateStr: string): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() - 1);
  return date.toISOString().split("T")[0];
}
