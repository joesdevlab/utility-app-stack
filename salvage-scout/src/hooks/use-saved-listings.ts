"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Material } from "@/types";

interface SavedListing {
  id: string;
  listingId: string;
  createdAt: string;
  listing?: Material;
}

interface UseSavedListingsReturn {
  savedListings: SavedListing[];
  isLoading: boolean;
  saveListing: (listingId: string) => Promise<void>;
  unsaveListing: (listingId: string) => Promise<void>;
  isSaved: (listingId: string) => boolean;
  refreshSavedListings: () => void;
}

export function useSavedListings(userId: string | undefined): UseSavedListingsReturn {
  const [savedListings, setSavedListings] = useState<SavedListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const loadSavedListings = useCallback(async () => {
    if (!userId || !supabase) {
      setSavedListings([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from("salvage_saved_listings")
        .select(`
          id,
          listing_id,
          created_at,
          salvage_listings (
            id,
            title,
            description,
            category,
            condition,
            quantity,
            image_url,
            latitude,
            longitude,
            suburb,
            posted_at,
            expires_at,
            contact_method,
            status
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const mapped: SavedListing[] = (data || []).map((row: Record<string, unknown>) => {
        const listing = row.salvage_listings as Record<string, unknown> | null;
        return {
          id: row.id as string,
          listingId: row.listing_id as string,
          createdAt: row.created_at as string,
          listing: listing
            ? {
                id: listing.id as string,
                title: listing.title as string,
                description: listing.description as string,
                category: listing.category as Material["category"],
                condition: listing.condition as Material["condition"],
                quantity: (listing.quantity as string) || "",
                imageUrl: listing.image_url as string | undefined,
                location: {
                  latitude: Number(listing.latitude),
                  longitude: Number(listing.longitude),
                  suburb: listing.suburb as string,
                },
                postedAt: listing.posted_at as string,
                expiresAt: listing.expires_at as string,
                contactMethod: listing.contact_method as Material["contactMethod"],
                status: listing.status as Material["status"],
              }
            : undefined,
        };
      });

      setSavedListings(mapped);
    } catch {
      setSavedListings([]);
    }

    setIsLoading(false);
  }, [userId, supabase]);

  useEffect(() => {
    loadSavedListings();
  }, [loadSavedListings]);

  const saveListing = useCallback(
    async (listingId: string) => {
      if (!userId || !supabase) return;

      try {
        const { error } = await supabase.from("salvage_saved_listings").insert({
          user_id: userId,
          listing_id: listingId,
        });

        if (error) throw error;

        // Reload to get the listing data
        loadSavedListings();
      } catch {
        // Silently fail
      }
    },
    [userId, supabase, loadSavedListings]
  );

  const unsaveListing = useCallback(
    async (listingId: string) => {
      if (!userId || !supabase) return;

      try {
        const { error } = await supabase
          .from("salvage_saved_listings")
          .delete()
          .eq("user_id", userId)
          .eq("listing_id", listingId);

        if (error) throw error;

        setSavedListings((prev) => prev.filter((s) => s.listingId !== listingId));
      } catch {
        // Silently fail
      }
    },
    [userId, supabase]
  );

  const isSaved = useCallback(
    (listingId: string) => {
      return savedListings.some((s) => s.listingId === listingId);
    },
    [savedListings]
  );

  return {
    savedListings,
    isLoading,
    saveListing,
    unsaveListing,
    isSaved,
    refreshSavedListings: loadSavedListings,
  };
}
