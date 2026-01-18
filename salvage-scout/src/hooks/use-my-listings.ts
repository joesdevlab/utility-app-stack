"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Material, MaterialCategory, MaterialCondition } from "@/types";

interface SalvageListingRow {
  id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  quantity: string | null;
  image_url: string;
  latitude: number;
  longitude: number;
  suburb: string;
  posted_at: string;
  expires_at: string;
  contact_method: string;
  status: string;
  user_id: string;
}

interface UseMyListingsReturn {
  listings: Material[];
  isLoading: boolean;
  updateListing: (id: string, updates: Partial<Material>) => Promise<Material | null>;
  removeListing: (id: string) => Promise<void>;
  refreshListings: () => void;
}

export function useMyListings(userId: string | undefined): UseMyListingsReturn {
  const [listings, setListings] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const loadListings = useCallback(async () => {
    if (!userId || !supabase) {
      setListings([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from("salvage_listings")
        .select("*")
        .eq("user_id", userId)
        .order("posted_at", { ascending: false });

      if (error) throw error;

      const mappedListings: Material[] = ((data || []) as SalvageListingRow[]).map((row) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        category: row.category as MaterialCategory,
        condition: row.condition as MaterialCondition,
        quantity: row.quantity || "",
        imageUrl: row.image_url,
        location: {
          latitude: Number(row.latitude),
          longitude: Number(row.longitude),
          suburb: row.suburb,
        },
        postedAt: row.posted_at,
        expiresAt: row.expires_at,
        contactMethod: row.contact_method as "message" | "call",
        status: row.status as "available" | "pending" | "claimed",
      }));

      setListings(mappedListings);
    } catch {
      setListings([]);
    }

    setIsLoading(false);
  }, [userId, supabase]);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  const updateListing = useCallback(
    async (id: string, updates: Partial<Material>): Promise<Material | null> => {
      if (!userId || !supabase) return null;

      try {
        const { data, error } = await supabase
          .from("salvage_listings")
          .update({
            ...(updates.title && { title: updates.title }),
            ...(updates.description && { description: updates.description }),
            ...(updates.category && { category: updates.category }),
            ...(updates.condition && { condition: updates.condition }),
            ...(updates.quantity !== undefined && { quantity: updates.quantity }),
            ...(updates.status && { status: updates.status }),
            ...(updates.contactMethod && { contact_method: updates.contactMethod }),
          })
          .eq("id", id)
          .eq("user_id", userId)
          .select()
          .single();

        if (error) throw error;

        const row = data as SalvageListingRow;
        const updatedListing: Material = {
          id: row.id,
          title: row.title,
          description: row.description,
          category: row.category as MaterialCategory,
          condition: row.condition as MaterialCondition,
          quantity: row.quantity || "",
          imageUrl: row.image_url,
          location: {
            latitude: Number(row.latitude),
            longitude: Number(row.longitude),
            suburb: row.suburb,
          },
          postedAt: row.posted_at,
          expiresAt: row.expires_at,
          contactMethod: row.contact_method as "message" | "call",
          status: row.status as "available" | "pending" | "claimed",
        };

        setListings((prev) =>
          prev.map((l) => (l.id === id ? updatedListing : l))
        );

        return updatedListing;
      } catch {
        return null;
      }
    },
    [userId, supabase]
  );

  const removeListing = useCallback(
    async (id: string) => {
      if (!userId || !supabase) return;

      try {
        const { error } = await supabase
          .from("salvage_listings")
          .delete()
          .eq("id", id)
          .eq("user_id", userId);

        if (error) throw error;

        setListings((prev) => prev.filter((l) => l.id !== id));
      } catch {
        // Silently fail
      }
    },
    [userId, supabase]
  );

  return {
    listings,
    isLoading,
    updateListing,
    removeListing,
    refreshListings: loadListings,
  };
}
