"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { LogbookEntryCard } from "@/components/logbook-entry-card";
import { StatsCard } from "@/components/employer/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Clock,
  FileText,
  Calendar,
  Download,
  User,
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
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/employer/apprentices">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        {data?.apprentice && (
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {getInitials(data.apprentice.full_name, data.apprentice.email)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">
                {data.apprentice.full_name || data.apprentice.email}
              </h1>
              {data.apprentice.full_name && (
                <p className="text-muted-foreground">{data.apprentice.email}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          title="Total Entries"
          value={data?.summary.total_entries || 0}
          icon={<FileText className="h-5 w-5" />}
        />
        <StatsCard
          title="Total Hours"
          value={data?.summary.total_hours || 0}
          icon={<Clock className="h-5 w-5" />}
        />
        <StatsCard
          title="Entries in Range"
          value={data?.entries.length || 0}
          icon={<Calendar className="h-5 w-5" />}
        />
      </div>

      {/* Date Filter */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filter Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={fetchEntries}>
              Apply Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Entries */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Logbook Entries</h2>
          <Button variant="outline" size="sm" disabled>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-40" />
            ))}
          </div>
        ) : data?.entries.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground">
                No entries found for this date range
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {data?.entries.map((entry) => (
              <LogbookEntryCard key={entry.id} entry={toLogbookEntry(entry)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
