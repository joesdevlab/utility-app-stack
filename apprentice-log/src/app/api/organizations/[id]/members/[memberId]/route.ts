import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// PATCH - Update member role
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const { id, memberId } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { role } = body;

    const validRoles = ["admin", "supervisor", "apprentice"];
    if (!role || !validRoles.includes(role)) {
      return NextResponse.json(
        { error: "Valid role is required (admin, supervisor, or apprentice)" },
        { status: 400 }
      );
    }

    // Check if user is owner or admin
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

    let canUpdate = organization.owner_id === user.id;
    if (!canUpdate) {
      const { data: membership } = await supabase
        .from("organization_members")
        .select("role")
        .eq("organization_id", id)
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();

      canUpdate = membership?.role === "admin";
    }

    if (!canUpdate) {
      return NextResponse.json(
        { error: "Only owners and admins can update members" },
        { status: 403 }
      );
    }

    // Get the member to update
    const { data: targetMember } = await supabase
      .from("organization_members")
      .select("*")
      .eq("id", memberId)
      .eq("organization_id", id)
      .single();

    if (!targetMember) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      );
    }

    // Can't change owner's role
    if (targetMember.role === "owner") {
      return NextResponse.json(
        { error: "Cannot change the owner's role" },
        { status: 400 }
      );
    }

    // Update the member
    const { data: updatedMember, error: updateError } = await supabase
      .from("organization_members")
      .update({ role })
      .eq("id", memberId)
      .select()
      .single();

    if (updateError) {
      console.error("Update member error:", updateError);
      return NextResponse.json(
        { error: "Failed to update member" },
        { status: 500 }
      );
    }

    return NextResponse.json({ member: updatedMember });
  } catch (error) {
    console.error("Update member error:", error);
    return NextResponse.json(
      { error: "Failed to update member" },
      { status: 500 }
    );
  }
}

// DELETE - Remove member
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const { id, memberId } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is owner or admin
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

    let canDelete = organization.owner_id === user.id;
    if (!canDelete) {
      const { data: membership } = await supabase
        .from("organization_members")
        .select("role")
        .eq("organization_id", id)
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();

      canDelete = membership?.role === "admin";
    }

    if (!canDelete) {
      return NextResponse.json(
        { error: "Only owners and admins can remove members" },
        { status: 403 }
      );
    }

    // Get the member to remove
    const { data: targetMember } = await supabase
      .from("organization_members")
      .select("*")
      .eq("id", memberId)
      .eq("organization_id", id)
      .single();

    if (!targetMember) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      );
    }

    // Can't remove owner
    if (targetMember.role === "owner") {
      return NextResponse.json(
        { error: "Cannot remove the organization owner" },
        { status: 400 }
      );
    }

    // Soft delete - mark as removed
    const { error: deleteError } = await supabase
      .from("organization_members")
      .update({ status: "removed" })
      .eq("id", memberId);

    if (deleteError) {
      console.error("Remove member error:", deleteError);
      return NextResponse.json(
        { error: "Failed to remove member" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Member removed" });
  } catch (error) {
    console.error("Remove member error:", error);
    return NextResponse.json(
      { error: "Failed to remove member" },
      { status: 500 }
    );
  }
}
