import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Admin emails list
const ADMIN_EMAILS = [
  "joe@apprenticelog.nz",
  "joe@laikadynamics.co.nz",
  "joseph.doidge@gmail.com",
];

// GET - Get single organization with full details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (!ADMIN_EMAILS.includes(user.email || "")) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { id } = await params;

    // Get organization
    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", id)
      .single();

    if (orgError || !org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    // Get owner profile
    const { data: ownerProfile } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, email")
      .eq("id", org.owner_id)
      .single();

    // Get all members
    const { data: members } = await supabase
      .from("organization_members")
      .select(`
        id,
        user_id,
        email,
        role,
        status,
        invited_at,
        joined_at,
        created_at
      `)
      .eq("organization_id", id)
      .order("created_at", { ascending: false });

    // Get member profiles
    const memberUserIds = (members || [])
      .filter(m => m.user_id)
      .map(m => m.user_id);

    const { data: memberProfiles } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, email")
      .in("id", memberUserIds);

    const profileMap: Record<string, { name: string; email: string }> = {};
    (memberProfiles || []).forEach(p => {
      profileMap[p.id] = {
        name: [p.first_name, p.last_name].filter(Boolean).join(" ") || "Unknown",
        email: p.email || "",
      };
    });

    // Get entry stats
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count: entriesLast30Days } = await supabase
      .from("logbook_entries")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", id)
      .gte("created_at", thirtyDaysAgo.toISOString());

    const { count: totalEntries } = await supabase
      .from("logbook_entries")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", id);

    // Build response
    const employer = {
      id: org.id,
      name: org.name,
      slug: org.slug,
      owner: ownerProfile ? {
        id: ownerProfile.id,
        name: [ownerProfile.first_name, ownerProfile.last_name].filter(Boolean).join(" ") || "Unknown",
        email: ownerProfile.email || "",
      } : null,
      plan: org.plan,
      status: org.status,
      maxSeats: org.max_seats,
      stripeCustomerId: org.stripe_customer_id,
      stripeSubscriptionId: org.stripe_subscription_id,
      currentPeriodStart: org.current_period_start,
      currentPeriodEnd: org.current_period_end,
      members: (members || []).map(m => ({
        id: m.id,
        userId: m.user_id,
        email: m.email,
        name: m.user_id ? profileMap[m.user_id]?.name || "Unknown" : null,
        role: m.role,
        status: m.status,
        invitedAt: m.invited_at,
        joinedAt: m.joined_at,
      })),
      stats: {
        totalMembers: (members || []).filter(m => m.status === "active").length,
        activeApprentices: (members || []).filter(m => m.status === "active" && m.role === "apprentice").length,
        pendingInvites: (members || []).filter(m => m.status === "pending").length,
        totalEntries: totalEntries || 0,
        entriesLast30Days: entriesLast30Days || 0,
      },
      createdAt: org.created_at,
      updatedAt: org.updated_at,
    };

    return NextResponse.json({ employer });
  } catch (error) {
    console.error("Admin get employer error:", error);
    return NextResponse.json(
      { error: "Failed to fetch employer" },
      { status: 500 }
    );
  }
}

// PUT - Update organization
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (!ADMIN_EMAILS.includes(user.email || "")) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    const updates = await request.json();

    // Validate organization exists
    const { data: existingOrg, error: findError } = await supabase
      .from("organizations")
      .select("id")
      .eq("id", id)
      .single();

    if (findError || !existingOrg) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    // Build update object with allowed fields
    const allowedUpdates: Record<string, unknown> = {};

    if (updates.name !== undefined) {
      allowedUpdates.name = updates.name;
    }
    if (updates.plan !== undefined) {
      allowedUpdates.plan = updates.plan;
    }
    if (updates.status !== undefined) {
      allowedUpdates.status = updates.status;
    }
    if (updates.maxSeats !== undefined) {
      allowedUpdates.max_seats = updates.maxSeats;
    }

    if (Object.keys(allowedUpdates).length === 0) {
      return NextResponse.json({ error: "No valid updates provided" }, { status: 400 });
    }

    // Perform update
    const { data: updatedOrg, error: updateError } = await supabase
      .from("organizations")
      .update(allowedUpdates)
      .eq("id", id)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      employer: {
        id: updatedOrg.id,
        name: updatedOrg.name,
        slug: updatedOrg.slug,
        plan: updatedOrg.plan,
        status: updatedOrg.status,
        maxSeats: updatedOrg.max_seats,
      },
    });
  } catch (error) {
    console.error("Admin update employer error:", error);
    return NextResponse.json(
      { error: "Failed to update employer" },
      { status: 500 }
    );
  }
}

// DELETE - Delete organization (soft delete - sets status to 'canceled')
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (!ADMIN_EMAILS.includes(user.email || "")) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { id } = await params;

    // Check if hard delete is requested
    const { searchParams } = new URL(request.url);
    const hardDelete = searchParams.get("hard") === "true";

    // Validate organization exists
    const { data: existingOrg, error: findError } = await supabase
      .from("organizations")
      .select("id, name, status")
      .eq("id", id)
      .single();

    if (findError || !existingOrg) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    if (hardDelete) {
      // Hard delete - removes all data
      // First remove all members
      await supabase
        .from("organization_members")
        .delete()
        .eq("organization_id", id);

      // Then delete the organization
      const { error: deleteError } = await supabase
        .from("organizations")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;

      return NextResponse.json({
        success: true,
        message: `Organization "${existingOrg.name}" permanently deleted`,
        deleted: true,
      });
    } else {
      // Soft delete - just mark as canceled
      const { error: updateError } = await supabase
        .from("organizations")
        .update({ status: "canceled" })
        .eq("id", id);

      if (updateError) throw updateError;

      return NextResponse.json({
        success: true,
        message: `Organization "${existingOrg.name}" canceled`,
        canceled: true,
      });
    }
  } catch (error) {
    console.error("Admin delete employer error:", error);
    return NextResponse.json(
      { error: "Failed to delete employer" },
      { status: 500 }
    );
  }
}
