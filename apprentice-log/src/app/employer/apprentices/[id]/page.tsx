"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/components/auth-provider";
import { LogbookEntryCard } from "@/components/logbook-entry-card";
import { StatsCard } from "@/components/employer/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Clock,
  FileText,
  Calendar,
  Download,
  User,
  Filter,
} from "lucide-react";
import Link from "next/link";
import type { LogbookEntry, LogbookTask } from "@/types";

interface ApprenticeInfo {
  id: string;
  email: string;
  full_name: string | null;
}

interface EntryData {
  apprentice: ApprenticeInfo;
  entries: Array<{
    id: string;
    date: string;
    raw_transcript: string | null;
    formatted_entry: string;
    tasks: LogbookTask[] | null;
    hours: number | null;
    total_hours: number | null;
    weather: string | null;
    site_name: string | null;
    supervisor: string | null;
    notes: string | null;
    safety_observations: string | null;
    created_at: string;
  }>;
  total: number;
  summary: {
    total_entries: number;
    total_hours: number;
  };
}

export default function ApprenticeDetailPage() {
  const params = useParams();
  const apprenticeId = params.id as string;
  const { organization } = useAuth();
  const [data, setData] = useState<EntryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  const fetchEntries = useCallback(async () => {
    if (!organization?.id) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        startDate,
        endDate,
      });

      const response = await fetch(
        `/api/organizations/${organization.id}/apprentices/${apprenticeId}/entries?${params}`
      );

      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error("Failed to fetch entries:", error);
    } finally {
      setIsLoading(false);
    }
  }, [organization?.id, apprenticeId, startDate, endDate]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return email[0].toUpperCase();
  };

  // Convert database entry to LogbookEntry format
  const toLogbookEntry = (entry: EntryData["entries"][0]): LogbookEntry => ({
    id: entry.id,
    date: entry.date,
    rawTranscript: entry.raw_transcript || undefined,
    formattedEntry: entry.formatted_entry,
    tasks: entry.tasks || [],
    hours: entry.hours || undefined,
    weather: entry.weather || undefined,
    siteName: entry.site_name || undefined,
    supervisor: entry.supervisor || undefined,
    createdAt: entry.created_at,
    totalHours: entry.total_hours || entry.hours || 0,
    notes: entry.notes || undefined,
    safetyObservations: entry.safety_observations || undefined,
  });

  if (isLoading && !data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <Link href="/employer/apprentices">
          <Button variant="ghost" size="icon" className="rounded-xl hover:bg-orange-50 hover:text-orange-600">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        {data?.apprentice && (
          <div className="flex items-center gap-3">
            <Avatar className="h-14 w-14 ring-2 ring-orange-100">
              <AvatarFallback className="bg-gradient-to-br from-orange-100 to-orange-50 text-orange-600 font-semibold text-lg">
                {getInitials(data.apprentice.full_name, data.apprentice.email)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {data.apprentice.full_name || data.apprentice.email}
              </h1>
              {data.apprentice.full_name && (
                <p className="text-muted-foreground">{data.apprentice.email}</p>
              )}
            </div>
          </div>
        )}
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          title="Total Entries"
          value={data?.summary.total_entries || 0}
          icon={<FileText className="h-5 w-5" />}
          index={0}
        />
        <StatsCard
          title="Total Hours"
          value={data?.summary.total_hours || 0}
          icon={<Clock className="h-5 w-5" />}
          index={1}
        />
        <StatsCard
          title="Entries in Range"
          value={data?.entries.length || 0}
          icon={<Calendar className="h-5 w-5" />}
          index={2}
        />
      </div>

      {/* Date Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="hover:shadow-lg hover:border-orange-200 transition-all">
          <CardHeader className="pb-3 border-b bg-gradient-to-r from-orange-50/50 to-transparent">
            <CardTitle className="flex items-center gap-3 text-base">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center">
                <Filter className="h-4 w-4 text-orange-600" />
              </div>
              <span className="text-gray-900">Filter Entries</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Start Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-500" />
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="pl-10 border-gray-200 focus:border-orange-300 focus:ring-orange-500/20"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">End Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-500" />
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="pl-10 border-gray-200 focus:border-orange-300 focus:ring-orange-500/20"
                  />
                </div>
              </div>
              <Button
                variant="outline"
                onClick={fetchEntries}
                className="border-orange-200 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300"
              >
                Apply Filter
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Entries */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-orange-500" />
            Logbook Entries
          </h2>
          <Button
            variant="outline"
            size="sm"
            disabled
            className="border-orange-200 hover:bg-orange-50 hover:text-orange-600"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        ) : data?.entries.length === 0 ? (
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center mx-auto mb-4">
                <User className="h-8 w-8 text-orange-500" />
              </div>
              <p className="text-muted-foreground">
                No entries found for this date range
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {data?.entries.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <LogbookEntryCard entry={toLogbookEntry(entry)} />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
