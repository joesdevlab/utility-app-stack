import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Admin emails list
const ADMIN_EMAILS = [
  "joe@apprenticelog.nz",
  "joe@laikadynamics.co.nz",
  "joseph.doidge@gmail.com",
];

// POST - Add a member to organization
export async function POST(
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

    const { id: orgId } = await params;
    const { email, role = "apprentice" } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check organization exists
    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("id, name")
      .eq("id", orgId)
      .single();

    if (orgError || !org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    // Check if member already exists
    const { data: existingMember } = await supabase
      .from("organization_members")
      .select("id, status")
      .eq("organization_id", orgId)
      .eq("email", email.toLowerCase())
      .single();

    if (existingMember) {
      return NextResponse.json(
        { error: "Member already exists in this organization" },
        { status: 400 }
      );
    }

    // Check if user exists
    const { data: userProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email.toLowerCase())
      .single();

    // Add member
    const { data: newMember, error: memberError } = await supabase
      .from("organization_members")
      .insert({
        organization_id: orgId,
        user_id: userProfile?.id || null,
        email: email.toLowerCase(),
        role,
        status: userProfile ? "active" : "pending",
        joined_at: userProfile ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (memberError) throw memberError;

    return NextResponse.json({
      success: true,
      member: {
        id: newMember.id,
        email: newMember.email,
        role: newMember.role,
        status: newMember.status,
      },
    });
  } catch (error) {
    console.error("Admin add member error:", error);
    return NextResponse.json(
      { error: "Failed to add member" },
      { status: 500 }
    );
  }
}

// DELETE - Remove a member from organization
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

    const { id: orgId } = await params;
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get("memberId");

    if (!memberId) {
      return NextResponse.json({ error: "Member ID is required" }, { status: 400 });
    }

    // Check member exists and isn't the owner
    const { data: member, error: memberError } = await supabase
      .from("organization_members")
      .select("id, role, email")
      .eq("id", memberId)
      .eq("organization_id", orgId)
      .single();

    if (memberError || !member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    if (member.role === "owner") {
      return NextResponse.json(
        { error: "Cannot remove organization owner" },
        { status: 400 }
      );
    }

    // Delete member
    const { error: deleteError } = await supabase
      .from("organization_members")
      .delete()
      .eq("id", memberId);

    if (deleteError) throw deleteError;

    return NextResponse.json({
      success: true,
      message: `Member ${member.email} removed`,
    });
  } catch (error) {
    console.error("Admin remove member error:", error);
    return NextResponse.json(
      { error: "Failed to remove member" },
      { status: 500 }
    );
  }
}

// PATCH - Update member role or status
export async function PATCH(
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

    const { id: orgId } = await params;
    const { memberId, role, status } = await request.json();

    if (!memberId) {
      return NextResponse.json({ error: "Member ID is required" }, { status: 400 });
    }

    // Check member exists
    const { data: member, error: memberError } = await supabase
      .from("organization_members")
      .select("id, role")
      .eq("id", memberId)
      .eq("organization_id", orgId)
      .single();

    if (memberError || !member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Don't allow changing owner role
    if (member.role === "owner" && role && role !== "owner") {
      return NextResponse.json(
        { error: "Cannot change owner role" },
        { status: 400 }
      );
    }

    // Build updates
    const updates: Record<string, unknown> = {};
    if (role) updates.role = role;
    if (status) {
      updates.status = status;
      if (status === "active" && !member.role) {
        updates.joined_at = new Date().toISOString();
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No updates provided" }, { status: 400 });
    }

    // Update member
    const { data: updatedMember, error: updateError } = await supabase
      .from("organization_members")
      .update(updates)
      .eq("id", memberId)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      member: {
        id: updatedMember.id,
        email: updatedMember.email,
        role: updatedMember.role,
        status: updatedMember.status,
      },
    });
  } catch (error) {
    console.error("Admin update member error:", error);
    return NextResponse.json(
      { error: "Failed to update member" },
      { status: 500 }
    );
  }
}
