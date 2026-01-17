"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Material } from "@/types";

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

      const mappedListings: Material[] = (data || []).map((row) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        category: row.category,
        condition: row.condition,
        quantity: row.quantity || "",
        imageUrl: row.image_url,
        location: {
          latitude: Number(row.latitude),
          longitude: Number(row.longitude),
          suburb: row.suburb,
        },
        postedAt: row.posted_at,
        expiresAt: row.expires_at,
        contactMethod: row.contact_method,
        status: row.status,
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

        const updatedListing: Material = {
          id: data.id,
          title: data.title,
          description: data.description,
          category: data.category,
          condition: data.condition,
          quantity: data.quantity || "",
          imageUrl: data.image_url,
          location: {
            latitude: Number(data.latitude),
            longitude: Number(data.longitude),
            suburb: data.suburb,
          },
          postedAt: data.posted_at,
          expiresAt: data.expires_at,
          contactMethod: data.contact_method,
          status: data.status,
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
