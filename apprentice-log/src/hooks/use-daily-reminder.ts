"use client";

import { useState, useEffect, useCallback } from "react";
import {
  requestNotificationPermission,
  scheduleDailyReminder,
  cancelDailyReminder,
} from "@/lib/notifications";

const STORAGE_KEY = "daily-reminder";

interface ReminderPreference {
  enabled: boolean;
  hour: number;
  minute: number;
}

const DEFAULT_PREFERENCE: ReminderPreference = {
  enabled: false,
  hour: 15,   // 3:30 PM default
  minute: 30,
};

function loadPreference(): ReminderPreference {
  if (typeof window === "undefined") return DEFAULT_PREFERENCE;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore
  }
  return DEFAULT_PREFERENCE;
}

function savePreference(pref: ReminderPreference) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pref));
  } catch {
    // ignore
  }
}

export function useDailyReminder() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [hour, setHour] = useState(15);
  const [minute, setMinute] = useState(30);
  const [isLoading, setIsLoading] = useState(false);

  // Load saved preference on mount
  useEffect(() => {
    const pref = loadPreference();
    setIsEnabled(pref.enabled);
    setHour(pref.hour);
    setMinute(pref.minute);
  }, []);

  const toggleReminder = useCallback(async () => {
    setIsLoading(true);
    try {
      if (isEnabled) {
        // Disable
        await cancelDailyReminder();
        const pref = { enabled: false, hour, minute };
        savePreference(pref);
        setIsEnabled(false);
        return { success: true, enabled: false };
      } else {
        // Enable — request permission first
        const granted = await requestNotificationPermission();
        if (!granted) {
          return { success: false, error: "Permission denied" };
        }
        const scheduled = await scheduleDailyReminder(hour, minute);
        const pref = { enabled: true, hour, minute };
        savePreference(pref);
        setIsEnabled(true);
        return { success: true, enabled: true, scheduled };
      }
    } finally {
      setIsLoading(false);
    }
  }, [isEnabled, hour, minute]);

  const setReminderTime = useCallback(
    async (newHour: number, newMinute: number) => {
      setHour(newHour);
      setMinute(newMinute);
      const pref = { enabled: isEnabled, hour: newHour, minute: newMinute };
      savePreference(pref);

      // Reschedule if currently enabled
      if (isEnabled) {
        await cancelDailyReminder();
        await scheduleDailyReminder(newHour, newMinute);
      }
    },
    [isEnabled]
  );

  const reminderTimeFormatted = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

  return {
    isEnabled,
    hour,
    minute,
    reminderTimeFormatted,
    isLoading,
    toggleReminder,
    setReminderTime,
  };
}
