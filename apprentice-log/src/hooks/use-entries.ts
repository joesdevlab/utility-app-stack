"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { LogbookEntry } from "@/types";

export function useEntries(userId: string | undefined) {
  const [entries, setEntries] = useState<LogbookEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  // Load entries from Supabase (excluding soft-deleted)
  const loadEntries = useCallback(async () => {
    if (!userId || !supabase) {
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
        .eq("is_deleted", false)
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
        // Legacy fields
        totalHours: row.total_hours,
        notes: row.notes,
        safetyObservations: row.safety_observations,
      }));

      setEntries(mappedEntries);
    } catch (error) {
      console.error("Failed to load entries:", error);
      // UI shows empty state on error
    } finally {
      setIsLoading(false);
    }
  }, [userId, supabase]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const addEntry = useCallback(
    async (entry: Omit<LogbookEntry, "id" | "createdAt">) => {
      if (!userId || !supabase) return null;

      try {
        // Calculate total hours from tasks if not provided
        const totalHours = entry.totalHours ?? entry.tasks?.reduce((sum, task) => sum + (task.hours || 0), 0) ?? 0;

        const { data, error } = await supabase
          .from("apprentice_entries")
          .insert({
            user_id: userId,
            date: entry.date,
            raw_transcript: entry.rawTranscript,
            formatted_entry: entry.formattedEntry || "",
            tasks: entry.tasks,
            hours: entry.hours ?? totalHours,
            weather: entry.weather,
            site_name: entry.siteName,
            supervisor: entry.supervisor,
            // Legacy fields
            total_hours: totalHours,
            notes: entry.notes,
            safety_observations: entry.safetyObservations,
            is_deleted: false,
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
          totalHours: data.total_hours,
          notes: data.notes,
          safetyObservations: data.safety_observations,
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

  // Update an existing entry
  const updateEntry = useCallback(
    async (id: string, updates: Partial<Omit<LogbookEntry, "id" | "createdAt">>) => {
      if (!userId || !supabase) return null;

      try {
        // Calculate total hours from tasks if tasks are being updated
        const totalHours = updates.tasks
          ? updates.tasks.reduce((sum, task) => sum + (task.hours || 0), 0)
          : undefined;

        const { data, error } = await supabase
          .from("apprentice_entries")
          .update({
            ...(updates.date && { date: updates.date }),
            ...(updates.rawTranscript !== undefined && { raw_transcript: updates.rawTranscript }),
            ...(updates.formattedEntry !== undefined && { formatted_entry: updates.formattedEntry }),
            ...(updates.tasks && { tasks: updates.tasks }),
            ...(updates.hours !== undefined && { hours: updates.hours }),
            ...(updates.weather !== undefined && { weather: updates.weather }),
            ...(updates.siteName !== undefined && { site_name: updates.siteName }),
            ...(updates.supervisor !== undefined && { supervisor: updates.supervisor }),
            ...(updates.notes !== undefined && { notes: updates.notes }),
            ...(updates.safetyObservations !== undefined && { safety_observations: updates.safetyObservations }),
            ...(totalHours !== undefined && { total_hours: totalHours }),
          })
          .eq("id", id)
          .eq("user_id", userId)
          .select()
          .single();

        if (error) throw error;

        const updatedEntry: LogbookEntry = {
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
          totalHours: data.total_hours,
          notes: data.notes,
          safetyObservations: data.safety_observations,
        };

        setEntries((prev) =>
          prev.map((e) => (e.id === id ? updatedEntry : e))
        );

        return updatedEntry;
      } catch (error) {
        console.error("Failed to update entry:", error);
        return null;
      }
    },
    [userId, supabase]
  );

  // Soft delete - marks entry as deleted but keeps the data
  const removeEntry = useCallback(
    async (id: string) => {
      if (!userId || !supabase) return;

      try {
        const { error } = await supabase
          .from("apprentice_entries")
          .update({ is_deleted: true })
          .eq("id", id)
          .eq("user_id", userId);

        if (error) throw error;

        setEntries((prev) => prev.filter((e) => e.id !== id));
      } catch (error) {
        console.error("Failed to remove entry:", error);
        // Entry remains in UI on error
      }
    },
    [userId, supabase]
  );

  // Restore a soft-deleted entry
  const restoreEntry = useCallback(
    async (id: string) => {
      if (!userId || !supabase) return;

      try {
        const { error } = await supabase
          .from("apprentice_entries")
          .update({ is_deleted: false })
          .eq("id", id)
          .eq("user_id", userId);

        if (error) throw error;

        // Refresh to get the restored entry
        await loadEntries();
      } catch (error) {
        console.error("Failed to restore entry:", error);
      }
    },
    [userId, supabase, loadEntries]
  );

  // Soft delete all entries
  const clearEntries = useCallback(async () => {
    if (!userId || !supabase) return;

    try {
      const { error } = await supabase
        .from("apprentice_entries")
        .update({ is_deleted: true })
        .eq("user_id", userId)
        .eq("is_deleted", false);

      if (error) throw error;

      setEntries([]);
    } catch (error) {
      console.error("Failed to clear entries:", error);
    }
  }, [userId, supabase]);

  // Permanently delete all soft-deleted entries
  const clearDeletedEntries = useCallback(async () => {
    if (!userId || !supabase) return;

    try {
      const { error } = await supabase
        .from("apprentice_entries")
        .delete()
        .eq("user_id", userId)
        .eq("is_deleted", true);

      if (error) throw error;
    } catch (error) {
      console.error("Failed to clear deleted entries:", error);
    }
  }, [userId, supabase]);

  return {
    entries,
    isLoading,
    addEntry,
    updateEntry,
    removeEntry,
    restoreEntry,
    clearEntries,
    clearDeletedEntries,
    refresh: loadEntries,
  };
}
