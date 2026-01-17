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

// Material listing types
export interface Material {
  id: string;
  title: string;
  description: string;
  category: MaterialCategory;
  condition: MaterialCondition;
  quantity: string;
  imageUrl: string;
  location: {
    latitude: number;
    longitude: number;
    suburb: string;
  };
  distance?: number;
  postedAt: string;
  expiresAt: string;
  contactMethod: "message" | "call";
  status: "available" | "pending" | "claimed";
}

export type MaterialCategory =
  | "timber"
  | "roofing"
  | "windows"
  | "doors"
  | "plumbing"
  | "electrical"
  | "concrete"
  | "insulation"
  | "flooring"
  | "fixtures"
  | "landscaping"
  | "other";

export type MaterialCondition = "new" | "good" | "fair" | "salvage";

export interface MaterialAnalysis {
  title: string;
  description: string;
  category: MaterialCategory;
  condition: MaterialCondition;
  suggestedQuantity: string;
  tips: string[];
}

export interface CreateListingData {
  imageFile: File;
  location: {
    latitude: number;
    longitude: number;
    suburb: string;
  };
  contactMethod: "message" | "call";
  expiresInDays: number;
}

export const CATEGORY_LABELS: Record<MaterialCategory, string> = {
  timber: "Timber & Framing",
  roofing: "Roofing",
  windows: "Windows",
  doors: "Doors",
  plumbing: "Plumbing",
  electrical: "Electrical",
  concrete: "Concrete & Masonry",
  insulation: "Insulation",
  flooring: "Flooring",
  fixtures: "Fixtures & Fittings",
  landscaping: "Landscaping",
  other: "Other",
};

export const CONDITION_LABELS: Record<MaterialCondition, string> = {
  new: "New / Unused",
  good: "Good Condition",
  fair: "Fair / Some Wear",
  salvage: "Salvage Only",
};

// Supabase Database types - generate these with `npx supabase gen types typescript`
// Replace this with your actual generated types
export type Database = {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
