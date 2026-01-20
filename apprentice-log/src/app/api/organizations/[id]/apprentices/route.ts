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

    // Get all apprentice members
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

    // Get stats for each apprentice
    const apprenticesWithStats = await Promise.all(
      apprenticeMembers.map(async (member) => {
        // Get user info
        let userInfo = null;
        if (member.user_id) {
          const { data: userData } = await supabase.auth.admin.getUserById(member.user_id);
          userInfo = userData?.user;
        }

        // Get entry count and total hours
        let entriesCount = 0;
        let totalHours = 0;
        let lastEntryDate = null;

        if (member.user_id) {
          const { count } = await supabase
            .from("apprentice_entries")
            .select("*", { count: "exact", head: true })
            .eq("user_id", member.user_id)
            .eq("is_deleted", false);

          entriesCount = count || 0;

          // Get total hours
          const { data: hoursData } = await supabase
            .from("apprentice_entries")
            .select("hours")
            .eq("user_id", member.user_id)
            .eq("is_deleted", false);

          if (hoursData) {
            totalHours = hoursData.reduce((sum, entry) => sum + (entry.hours || 0), 0);
          }

          // Get last entry date
          const { data: lastEntry } = await supabase
            .from("apprentice_entries")
            .select("date")
            .eq("user_id", member.user_id)
            .eq("is_deleted", false)
            .order("date", { ascending: false })
            .limit(1)
            .single();

          lastEntryDate = lastEntry?.date || null;
        }

        return {
          id: member.user_id || member.id,
          email: userInfo?.email || member.email,
          full_name: userInfo?.user_metadata?.full_name || null,
          role: member.role,
          joined_at: member.joined_at,
          entries_count: entriesCount,
          total_hours: totalHours,
          last_entry_date: lastEntryDate,
        };
      })
    );

    return NextResponse.json({ apprentices: apprenticesWithStats });
  } catch (error) {
    console.error("Get apprentices error:", error);
    return NextResponse.json(
      { error: "Failed to get apprentices" },
      { status: 500 }
    );
  }
}
