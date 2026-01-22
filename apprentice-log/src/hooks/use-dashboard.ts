"use client";

import useSWR, { mutate, preload } from "swr";
import type {
  OrganizationWithRole,
  OrganizationStats,
  ApprenticeWithStats,
} from "@/types";

// Cache key for the dashboard
const DASHBOARD_CACHE_KEY = "/api/employer/dashboard";
const LOCAL_STORAGE_KEY = "employer-dashboard-cache";
const CACHE_MAX_AGE = 5 * 60 * 1000; // 5 minutes

interface DashboardData {
  organization: OrganizationWithRole | null;
  stats: OrganizationStats | null;
  apprentices: ApprenticeWithStats[];
  timestamp?: number;
}

interface UseDashboardReturn {
  organization: OrganizationWithRole | null;
  stats: OrganizationStats | null;
  apprentices: ApprenticeWithStats[];
  isLoading: boolean;
  isValidating: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// Fetcher function
const fetcher = async (url: string): Promise<DashboardData> => {
  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 401 || response.status === 404) {
      return { organization: null, stats: null, apprentices: [] };
    }
    throw new Error("Failed to fetch dashboard data");
  }

  const data = await response.json();
  return {
    organization: data.organization,
    stats: data.stats,
    apprentices: data.apprentices || [],
    timestamp: Date.now(),
  };
};

// Get cached data from localStorage
function getLocalStorageCache(): DashboardData | null {
  if (typeof window === "undefined") return null;

  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!cached) return null;

    const data = JSON.parse(cached) as DashboardData;

    // Check if cache is still valid (within max age)
    if (data.timestamp && Date.now() - data.timestamp < CACHE_MAX_AGE) {
      return data;
    }

    return data; // Return stale data anyway - SWR will revalidate
  } catch {
    return null;
  }
}

// Save data to localStorage
function setLocalStorageCache(data: DashboardData): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify({ ...data, timestamp: Date.now() })
    );
  } catch {
    // localStorage might be full or disabled
  }
}

// Clear the cache (useful for logout)
export function clearDashboardCache(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    mutate(DASHBOARD_CACHE_KEY, undefined, false);
  } catch {
    // Ignore errors
  }
}

// Prefetch dashboard data (call this on employer layout mount or link hover)
export function prefetchDashboard(): void {
  preload(DASHBOARD_CACHE_KEY, fetcher);
}

// Main hook with SWR + localStorage persistence
export function useDashboard(): UseDashboardReturn {
  // Get initial data from localStorage for instant render
  const localCache = getLocalStorageCache();

  const { data, error, isLoading, isValidating, mutate: refetchMutate } = useSWR<DashboardData>(
    DASHBOARD_CACHE_KEY,
    fetcher,
    {
      // Use localStorage cache as fallback for instant initial render
      fallbackData: localCache || undefined,

      // Revalidate in background even if we have cache
      revalidateOnFocus: true,
      revalidateOnReconnect: true,

      // Keep previous data while revalidating (no flicker)
      keepPreviousData: true,

      // Dedupe requests within 2 seconds
      dedupingInterval: 2000,

      // Retry on error
      errorRetryCount: 2,

      // Cache data and persist to localStorage on success
      onSuccess: (data) => {
        setLocalStorageCache(data);
      },
    }
  );

  const refetch = async () => {
    await refetchMutate();
  };

  return {
    organization: data?.organization || null,
    stats: data?.stats || null,
    apprentices: data?.apprentices || [],
    isLoading: isLoading && !localCache, // Only show loading if no cache
    isValidating,
    error: error || null,
    refetch,
  };
}

// Hook for just checking if data is cached (for prefetch decisions)
export function hasDashboardCache(): boolean {
  return getLocalStorageCache() !== null;
}
