"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ScanHistoryItem, Medicine } from "@/types";

export function useScans(userId: string | undefined) {
  const [scans, setScans] = useState<ScanHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const loadScans = useCallback(async () => {
    if (!userId || !supabase) {
      setScans([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("bioswap_scans")
        .select(`
          id,
          medicine_id,
          barcode,
          scanned_at,
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
        .order("scanned_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      const mappedScans: ScanHistoryItem[] = (data || []).map((row: {
        id: string;
        medicine_id: string;
        barcode: string;
        scanned_at: string;
        medicines: {
          id: string;
          barcode: string;
          name: string;
          brand_name: string;
          generic_name: string;
          active_ingredient: string;
          strength: string;
          form: string;
          pack_size: number;
          price: number;
          is_generic: boolean;
          is_subsidized: boolean;
          subsidy_price: number | null;
          manufacturer: string;
          image_url: string | null;
        } | null;
      }) => {
        const med = row.medicines;
        return {
          id: row.id,
          medicineId: row.medicine_id,
          barcode: row.barcode,
          scannedAt: row.scanned_at,
          medicine: med ? {
            id: med.id,
            barcode: med.barcode,
            name: med.name,
            brandName: med.brand_name,
            genericName: med.generic_name,
            activeIngredient: med.active_ingredient,
            strength: med.strength,
            form: med.form,
            packSize: med.pack_size,
            price: med.price,
            isGeneric: med.is_generic,
            isSubsidized: med.is_subsidized,
            subsidyPrice: med.subsidy_price,
            manufacturer: med.manufacturer,
            imageUrl: med.image_url || undefined,
          } : undefined,
        };
      });

      setScans(mappedScans);
    } catch {
      // Silently fail
    } finally {
      setIsLoading(false);
    }
  }, [userId, supabase]);

  useEffect(() => {
    loadScans();
  }, [loadScans]);

  const addScan = useCallback(
    async (medicineId: string, barcode: string) => {
      if (!userId || !supabase) return null;

      try {
        const { data, error } = await supabase
          .from("bioswap_scans")
          .insert({
            user_id: userId,
            medicine_id: medicineId,
            barcode,
          })
          .select()
          .single();

        if (error) throw error;

        // Refresh to get the medicine details
        await loadScans();
        return data;
      } catch {
        return null;
      }
    },
    [userId, supabase, loadScans]
  );

  const deleteScan = useCallback(
    async (id: string) => {
      if (!userId || !supabase) return;

      try {
        const { error } = await supabase
          .from("bioswap_scans")
          .delete()
          .eq("id", id)
          .eq("user_id", userId);

        if (error) throw error;

        setScans((prev) => prev.filter((s) => s.id !== id));
      } catch {
        // Silently fail
      }
    },
    [userId, supabase]
  );

  const clearScans = useCallback(async () => {
    if (!userId || !supabase) return;

    try {
      const { error } = await supabase
        .from("bioswap_scans")
        .delete()
        .eq("user_id", userId);

      if (error) throw error;

      setScans([]);
    } catch {
      // Silently fail
    }
  }, [userId, supabase]);

  return {
    scans,
    isLoading,
    addScan,
    deleteScan,
    clearScans,
    refresh: loadScans,
  };
}
