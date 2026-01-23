// Common types used across the application

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

// Organization Types (B2B Employer Portal)
export type OrganizationRole = 'owner' | 'admin' | 'supervisor' | 'apprentice';
export type OrganizationPlan = 'starter' | 'professional' | 'enterprise';
export type OrganizationStatus = 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';
export type MemberStatus = 'pending' | 'active' | 'removed';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: OrganizationPlan;
  status: OrganizationStatus;
  max_seats: number;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string | null;
  email: string;
  role: OrganizationRole;
  status: MemberStatus;
  invited_at: string;
  joined_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  user?: {
    id: string;
    email: string;
    full_name?: string;
  };
}

export interface OrganizationWithRole extends Organization {
  role: OrganizationRole;
  member_count: number;
}

export interface OrganizationStats {
  organization_id: string;
  name: string;
  slug: string;
  plan: OrganizationPlan;
  status: OrganizationStatus;
  max_seats: number;
  member_count: number;
  entries_this_week: number;
  hours_this_week: number;
  entries_this_month: number;
  hours_this_month: number;
}

export interface ApprenticeWithStats {
  id: string;
  email: string;
  full_name: string | null;
  role: OrganizationRole;
  joined_at: string | null;
  entries_count: number;
  total_hours: number;
  last_entry_date: string | null;
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
  // Photos - array of Supabase Storage paths
  photos?: string[];
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
          photos: string[] | null;
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
          photos?: string[] | null;
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
