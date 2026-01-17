"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { FavoriteMedicine, Medicine } from "@/types";

interface UseFavoritesReturn {
  favorites: FavoriteMedicine[];
  isLoading: boolean;
  addFavorite: (medicineId: string) => Promise<void>;
  removeFavorite: (medicineId: string) => Promise<void>;
  isFavorite: (medicineId: string) => boolean;
  refreshFavorites: () => void;
}

export function useFavorites(userId: string | undefined): UseFavoritesReturn {
  const [favorites, setFavorites] = useState<FavoriteMedicine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const loadFavorites = useCallback(async () => {
    if (!userId || !supabase) {
      setFavorites([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from("bioswap_favorites")
        .select(`
          id,
          medicine_id,
          created_at,
          medicines (
            id,
            barcode,
            name,
            brand_name,
            generic_name,
            active_ingredient,
            strength,
            form,
            pack_size,
            price,
            is_generic,
            is_subsidized,
            subsidy_price,
            manufacturer,
            image_url
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const mappedFavorites: FavoriteMedicine[] = (data || []).map((row: Record<string, unknown>) => {
        const med = row.medicines as Record<string, unknown> | null;
        return {
          id: row.id as string,
          medicineId: row.medicine_id as string,
          createdAt: row.created_at as string,
          medicine: med
            ? {
                id: med.id as string,
                barcode: med.barcode as string,
                name: med.name as string,
                brandName: med.brand_name as string,
                genericName: med.generic_name as string,
                activeIngredient: med.active_ingredient as string,
                strength: med.strength as string,
                form: med.form as string,
                packSize: med.pack_size as number,
                price: med.price as number,
                isGeneric: med.is_generic as boolean,
                isSubsidized: med.is_subsidized as boolean,
                subsidyPrice: med.subsidy_price as number | null,
                manufacturer: med.manufacturer as string,
                imageUrl: med.image_url as string | undefined,
              }
            : undefined,
        };
      });

      setFavorites(mappedFavorites);
    } catch {
      setFavorites([]);
    }

    setIsLoading(false);
  }, [userId, supabase]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const addFavorite = useCallback(
    async (medicineId: string) => {
      if (!userId || !supabase) return;

      try {
        const { error } = await supabase.from("bioswap_favorites").insert({
          user_id: userId,
          medicine_id: medicineId,
        });

        if (error) throw error;

        // Reload to get the medicine data
        loadFavorites();
      } catch {
        // Silently fail
      }
    },
    [userId, supabase, loadFavorites]
  );

  const removeFavorite = useCallback(
    async (medicineId: string) => {
      if (!userId || !supabase) return;

      try {
        const { error } = await supabase
          .from("bioswap_favorites")
          .delete()
          .eq("user_id", userId)
          .eq("medicine_id", medicineId);

        if (error) throw error;

        setFavorites((prev) => prev.filter((f) => f.medicineId !== medicineId));
      } catch {
        // Silently fail
      }
    },
    [userId, supabase]
  );

  const isFavorite = useCallback(
    (medicineId: string) => {
      return favorites.some((f) => f.medicineId === medicineId);
    },
    [favorites]
  );

  return {
    favorites,
    isLoading,
    addFavorite,
    removeFavorite,
    isFavorite,
    refreshFavorites: loadFavorites,
  };
}
