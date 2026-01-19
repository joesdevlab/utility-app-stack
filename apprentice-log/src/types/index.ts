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
  rawTranscript?: string;
  formattedEntry: string;
  tasks: LogbookTask[];
  hours?: number;
  weather?: string;
  siteName?: string;
  supervisor?: string;
  createdAt?: string;
  // Legacy fields for backwards compatibility
  totalHours?: number;
  notes?: string;
  safetyObservations?: string;
}

// Supabase Database types
export type Database = {
  public: {
    Tables: {
      apprentice_entries: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          raw_transcript: string | null;
          formatted_entry: string;
          tasks: LogbookTask[] | null;
          hours: number | null;
          total_hours: number | null;
          weather: string | null;
          site_name: string | null;
          supervisor: string | null;
          notes: string | null;
          safety_observations: string | null;
          is_deleted: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          date: string;
          raw_transcript?: string | null;
          formatted_entry?: string;
          tasks?: LogbookTask[] | null;
          hours?: number | null;
          total_hours?: number | null;
          weather?: string | null;
          site_name?: string | null;
          supervisor?: string | null;
          notes?: string | null;
          safety_observations?: string | null;
          is_deleted?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["apprentice_entries"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
