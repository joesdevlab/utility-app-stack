// Common types used across the application

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Medicine types
export interface Medicine {
  id: string;
  barcode: string;
  name: string;
  brandName: string;
  genericName: string;
  activeIngredient: string;
  strength: string;
  form: string; // tablet, capsule, cream, etc.
  packSize: number;
  price: number;
  isGeneric: boolean;
  isSubsidized: boolean;
  subsidyPrice: number | null; // $5 co-pay if subsidized
  manufacturer: string;
  imageUrl?: string;
}

export interface MedicineComparison {
  scanned: Medicine;
  alternatives: Medicine[];
  savings: number;
  subsidyAvailable: boolean;
}

export interface ScanHistoryItem {
  id: string;
  medicineId: string;
  barcode: string;
  scannedAt: string;
  medicine?: Medicine;
}

export interface FavoriteMedicine {
  id: string;
  medicineId: string;
  createdAt: string;
  medicine?: Medicine;
}

// Supabase Database types - generate these with `npx supabase gen types typescript`
export type Database = {
  public: {
    Tables: {
      medicines: {
        Row: Medicine;
        Insert: Omit<Medicine, "id">;
        Update: Partial<Medicine>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
