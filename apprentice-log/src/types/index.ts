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

// Logbook Entry Types
export interface LogbookTask {
  description: string;
  hours: number;
  tools: string[];
  skills: string[];
}

export interface LogbookEntry {
  id?: string;
  date: string;
  tasks: LogbookTask[];
  totalHours: number;
  notes: string;
  safetyObservations: string;
  transcript?: string;
  createdAt?: string;
}

// Supabase Database types - generate these with `npx supabase gen types typescript`
// Replace this with your actual generated types
export type Database = {
  public: {
    Tables: {
      logbook_entries: {
        Row: LogbookEntry & { id: string; createdAt: string; user_id: string };
        Insert: Omit<LogbookEntry, "id" | "createdAt"> & { user_id: string };
        Update: Partial<LogbookEntry>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
