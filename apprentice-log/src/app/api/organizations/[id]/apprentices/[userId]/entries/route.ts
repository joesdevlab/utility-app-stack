import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET - Get entries for a specific apprentice
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const { id, userId } = await params;
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

    // Verify the apprentice is part of this organization
    const { data: apprenticeMembership } = await supabase
      .from("organization_members")
      .select("*")
      .eq("organization_id", id)
      .eq("user_id", userId)
      .eq("status", "active")
      .single();

    if (!apprenticeMembership) {
      return NextResponse.json(
        { error: "Apprentice not found in this organization" },
        { status: 404 }
      );
    }

    // Get query params for filtering
    const url = new URL(request.url);
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const limit = parseInt(url.searchParams.get("limit") || "50", 10);
    const offset = parseInt(url.searchParams.get("offset") || "0", 10);

    // Build query
    let query = supabase
      .from("apprentice_entries")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .eq("is_deleted", false)
      .order("date", { ascending: false })
      .range(offset, offset + limit - 1);

    if (startDate) {
      query = query.gte("date", startDate);
    }
    if (endDate) {
      query = query.lte("date", endDate);
    }

    const { data: entries, count, error: entriesError } = await query;

    if (entriesError) {
      console.error("Get entries error:", entriesError);
      return NextResponse.json(
        { error: "Failed to get entries" },
        { status: 500 }
      );
    }

    // Get apprentice info
    const { data: userData } = await supabase.auth.admin.getUserById(userId);
    const apprenticeInfo = {
      id: userId,
      email: userData?.user?.email || apprenticeMembership.email,
      full_name: userData?.user?.user_metadata?.full_name || null,
    };

    // Calculate summary stats
    const totalHours = entries?.reduce((sum, entry) => sum + (entry.hours || 0), 0) || 0;

    return NextResponse.json({
      apprentice: apprenticeInfo,
      entries: entries || [],
      total: count || 0,
      limit,
      offset,
      summary: {
        total_entries: count || 0,
        total_hours: totalHours,
      },
    });
  } catch (error) {
    console.error("Get apprentice entries error:", error);
    return NextResponse.json(
      { error: "Failed to get entries" },
      { status: 500 }
    );
  }
}
