"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Material } from "@/types";
import { calculateDistance } from "./use-location";

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

interface UseListingsReturn {
  listings: Material[];
  isLoading: boolean;
  addListing: (listing: Omit<Material, "id" | "postedAt">, imageData: string) => Promise<Material | null>;
  removeListing: (id: string) => Promise<void>;
  refreshListings: () => void;
}

export function useListings(
  userLocation?: { latitude: number; longitude: number } | null
): UseListingsReturn {
  const [listings, setListings] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const loadListings = useCallback(async () => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from("salvage_listings")
        .select("*")
        .eq("status", "available")
        .gt("expires_at", new Date().toISOString())
        .order("posted_at", { ascending: false });

      if (error) throw error;

      let mappedListings: Material[] = ((data || []) as SalvageListingRow[]).map((row) => ({
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

      // Calculate distances if user location is available
      if (userLocation) {
        mappedListings = mappedListings.map((listing) => ({
          ...listing,
          distance: calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            listing.location.latitude,
            listing.location.longitude
          ),
        }));

        // Sort by distance
        mappedListings.sort((a, b) =>
          (a.distance ?? Infinity) - (b.distance ?? Infinity)
        );
      }

      setListings(mappedListings);
    } catch {
      // On error, show empty state
      setListings([]);
    }

    setIsLoading(false);
  }, [userLocation, supabase]);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  const uploadImage = async (imageData: string, userId: string): Promise<string | null> => {
    if (!supabase) return null;

    try {
      // Convert base64 to blob
      const base64Data = imageData.split(",")[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "image/jpeg" });

      // Generate unique filename
      const filename = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;

      const { error } = await supabase.storage
        .from("listing-images")
        .upload(filename, blob, {
          contentType: "image/jpeg",
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("listing-images")
        .getPublicUrl(filename);

      return urlData.publicUrl;
    } catch {
      return null;
    }
  };

  const addListing = useCallback(
    async (listing: Omit<Material, "id" | "postedAt">, imageData: string): Promise<Material | null> => {
      if (!supabase) return null;

      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        // Upload image first
        const imageUrl = await uploadImage(imageData, user.id);
        if (!imageUrl) {
          return null;
        }

        const { data, error } = await supabase
          .from("salvage_listings")
          .insert({
            user_id: user.id,
            title: listing.title,
            description: listing.description,
            category: listing.category,
            condition: listing.condition,
            quantity: listing.quantity,
            image_url: imageUrl,
            latitude: listing.location.latitude,
            longitude: listing.location.longitude,
            suburb: listing.location.suburb,
            contact_method: listing.contactMethod,
            status: listing.status,
            expires_at: listing.expiresAt,
          })
          .select()
          .single();

        if (error) throw error;

        const newListing: Material = {
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

        setListings((prev) => [newListing, ...prev]);
        return newListing;
      } catch {
        return null;
      }
    },
    [supabase]
  );

  const removeListing = useCallback(
    async (id: string) => {
      if (!supabase) return;

      try {
        const { error } = await supabase
          .from("salvage_listings")
          .delete()
          .eq("id", id);

        if (error) throw error;

        setListings((prev) => prev.filter((l) => l.id !== id));
      } catch {
        // Silently fail - listing remains in UI
      }
    },
    [supabase]
  );

  return {
    listings,
    isLoading,
    addListing,
    removeListing,
    refreshListings: loadListings,
  };
}
