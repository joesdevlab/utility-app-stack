"use client";

import { useState, useEffect, useCallback } from "react";
import type { LogbookEntry } from "@/types";

const STORAGE_KEY = "apprentice-log-entries";

export function useEntries() {
  const [entries, setEntries] = useState<LogbookEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load entries from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setEntries(JSON.parse(stored));
      } catch {
        console.error("Failed to parse stored entries");
      }
    }
    setIsLoaded(true);
  }, []);

  // Save entries to localStorage when they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    }
  }, [entries, isLoaded]);

  const addEntry = useCallback((entry: LogbookEntry) => {
    const newEntry = {
      ...entry,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setEntries((prev) => [newEntry, ...prev]);
    return newEntry;
  }, []);

  const removeEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const clearEntries = useCallback(() => {
    setEntries([]);
  }, []);

  return {
    entries,
    isLoaded,
    addEntry,
    removeEntry,
    clearEntries,
  };
}
