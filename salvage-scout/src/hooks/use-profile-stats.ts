"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export interface ProfileStats {
  totalListings: number;
  activeListings: number;
  pendingListings: number;
  claimedListings: number;
  savedListings: number;
  memberSince: string;
}

export function useProfileStats(userId: string | undefined) {
  const [stats, setStats] = useState<ProfileStats>({
    totalListings: 0,
    activeListings: 0,
    pendingListings: 0,
    claimedListings: 0,
    savedListings: 0,
    memberSince: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const loadStats = useCallback(async () => {
    if (!supabase || !userId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      // Fetch user's listings grouped by status
      const { data: listings, error: listingsError } = await supabase
        .from("salvage_listings")
        .select("id, status")
        .eq("user_id", userId);

      if (listingsError) throw listingsError;

      // Fetch saved listings count
      const { count: savedCount, error: savedError } = await supabase
        .from("salvage_saved_listings")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      if (savedError) throw savedError;

      // Fetch user creation date
      const { data: userData } = await supabase.auth.getUser();
      const memberSince = userData?.user?.created_at || "";

      // Calculate stats
      const allListings = listings || [];
      const active = allListings.filter((l) => l.status === "available").length;
      const pending = allListings.filter((l) => l.status === "pending").length;
      const claimed = allListings.filter((l) => l.status === "claimed").length;

      setStats({
        totalListings: allListings.length,
        activeListings: active,
        pendingListings: pending,
        claimedListings: claimed,
        savedListings: savedCount || 0,
        memberSince,
      });
    } catch {
      // Leave stats at zero on error
    }

    setIsLoading(false);
  }, [userId, supabase]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return { stats, isLoading, refresh: loadStats };
}
