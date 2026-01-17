"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { LogbookEntry } from "@/types";

export function useEntries(userId: string | undefined) {
  const [entries, setEntries] = useState<LogbookEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  // Load entries from Supabase
  const loadEntries = useCallback(async () => {
    if (!userId) {
      setEntries([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("apprentice_entries")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false });

      if (error) throw error;

      // Map database fields to LogbookEntry type
      const mappedEntries: LogbookEntry[] = (data || []).map((row) => ({
        id: row.id,
        date: row.date,
        rawTranscript: row.raw_transcript,
        formattedEntry: row.formatted_entry,
        tasks: row.tasks || [],
        hours: row.hours,
        weather: row.weather,
        siteName: row.site_name,
        supervisor: row.supervisor,
        createdAt: row.created_at,
      }));

      setEntries(mappedEntries);
    } catch (error) {
      console.error("Failed to load entries:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, supabase]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const addEntry = useCallback(
    async (entry: Omit<LogbookEntry, "id" | "createdAt">) => {
      if (!userId) return null;

      try {
        const { data, error } = await supabase
          .from("apprentice_entries")
          .insert({
            user_id: userId,
            date: entry.date,
            raw_transcript: entry.rawTranscript,
            formatted_entry: entry.formattedEntry,
            tasks: entry.tasks,
            hours: entry.hours,
            weather: entry.weather,
            site_name: entry.siteName,
            supervisor: entry.supervisor,
          })
          .select()
          .single();

        if (error) throw error;

        const newEntry: LogbookEntry = {
          id: data.id,
          date: data.date,
          rawTranscript: data.raw_transcript,
          formattedEntry: data.formatted_entry,
          tasks: data.tasks || [],
          hours: data.hours,
          weather: data.weather,
          siteName: data.site_name,
          supervisor: data.supervisor,
          createdAt: data.created_at,
        };

        setEntries((prev) => [newEntry, ...prev]);
        return newEntry;
      } catch (error) {
        console.error("Failed to add entry:", error);
        return null;
      }
    },
    [userId, supabase]
  );

  const removeEntry = useCallback(
    async (id: string) => {
      if (!userId) return;

      try {
        const { error } = await supabase
          .from("apprentice_entries")
          .delete()
          .eq("id", id)
          .eq("user_id", userId);

        if (error) throw error;

        setEntries((prev) => prev.filter((e) => e.id !== id));
      } catch (error) {
        console.error("Failed to remove entry:", error);
      }
    },
    [userId, supabase]
  );

  const clearEntries = useCallback(async () => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from("apprentice_entries")
        .delete()
        .eq("user_id", userId);

      if (error) throw error;

      setEntries([]);
    } catch (error) {
      console.error("Failed to clear entries:", error);
    }
  }, [userId, supabase]);

  return {
    entries,
    isLoading,
    addEntry,
    removeEntry,
    clearEntries,
    refresh: loadEntries,
  };
}
