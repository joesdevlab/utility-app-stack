import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET - Get apprentices with stats for employer dashboard
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user has access (owner, admin, or supervisor)
    const { data: organization } = await supabase
      .from("organizations")
      .select("owner_id")
      .eq("id", id)
      .single();

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    let hasAccess = organization.owner_id === user.id;
    if (!hasAccess) {
      const { data: membership } = await supabase
        .from("organization_members")
        .select("role")
        .eq("organization_id", id)
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();

      hasAccess = membership?.role && ["owner", "admin", "supervisor"].includes(membership.role);
    }

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // Get all apprentice members with user info in one query
    const { data: apprenticeMembers, error: membersError } = await supabase
      .from("organization_members")
      .select("*")
      .eq("organization_id", id)
      .eq("role", "apprentice")
      .eq("status", "active");

    if (membersError) {
      console.error("Get apprentices error:", membersError);
      return NextResponse.json(
        { error: "Failed to get apprentices" },
        { status: 500 }
      );
    }

    // Get user IDs for batch queries
    const userIds = apprenticeMembers
      .filter(m => m.user_id)
      .map(m => m.user_id);

    // Single aggregated query for all apprentice stats
    let statsMap: Record<string, { entries_count: number; total_hours: number; last_entry_date: string | null }> = {};

    if (userIds.length > 0) {
      // Get aggregated stats for all apprentices in ONE query using raw SQL via RPC
      // Fallback: fetch entries with minimal data and aggregate in JS
      const { data: entriesData } = await supabase
        .from("apprentice_entries")
        .select("user_id, hours, date")
        .in("user_id", userIds)
        .eq("is_deleted", false)
        .order("date", { ascending: false });

      if (entriesData) {
        // Aggregate in memory (still much faster than N queries)
        for (const entry of entriesData) {
          if (!statsMap[entry.user_id]) {
            statsMap[entry.user_id] = {
              entries_count: 0,
              total_hours: 0,
              last_entry_date: entry.date, // First entry is most recent due to order
            };
          }
          statsMap[entry.user_id].entries_count++;
          statsMap[entry.user_id].total_hours += entry.hours || 0;
        }
      }
    }

    // Build response with stats (no N+1 queries)
    const apprenticesWithStats = apprenticeMembers.map((member) => {
      const stats = member.user_id ? statsMap[member.user_id] : null;

      return {
        id: member.user_id || member.id,
        email: member.email,
        full_name: null, // User metadata not available without admin API call - use email instead
        role: member.role,
        joined_at: member.joined_at,
        entries_count: stats?.entries_count || 0,
        total_hours: stats?.total_hours || 0,
        last_entry_date: stats?.last_entry_date || null,
      };
    });

    return NextResponse.json({ apprentices: apprenticesWithStats });
  } catch (error) {
    console.error("Get apprentices error:", error);
    return NextResponse.json(
      { error: "Failed to get apprentices" },
      { status: 500 }
    );
  }
}
