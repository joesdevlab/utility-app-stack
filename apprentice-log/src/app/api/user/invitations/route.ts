import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET - Get pending invitations for the current user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Find pending invitations for this user's email
    const { data: invitations, error } = await supabase
      .from("organization_members")
      .select(`
        id,
        role,
        status,
        invited_at,
        organization_id,
        organizations (
          id,
          name
        )
      `)
      .eq("email", user.email?.toLowerCase())
      .eq("status", "pending");

    if (error) {
      console.error("Get invitations error:", error);
      return NextResponse.json(
        { error: "Failed to get invitations" },
        { status: 500 }
      );
    }

    return NextResponse.json({ invitations: invitations || [] });
  } catch (error) {
    console.error("Get invitations error:", error);
    return NextResponse.json(
      { error: "Failed to get invitations" },
      { status: 500 }
    );
  }
}

// POST - Accept or decline an invitation
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { invitationId, action } = await request.json();

    if (!invitationId) {
      return NextResponse.json(
        { error: "Invitation ID is required" },
        { status: 400 }
      );
    }

    if (!action || !["accept", "decline"].includes(action)) {
      return NextResponse.json(
        { error: "Action must be 'accept' or 'decline'" },
        { status: 400 }
      );
    }

    // Find the invitation and verify it belongs to this user
    const { data: invitation, error: findError } = await supabase
      .from("organization_members")
      .select("*")
      .eq("id", invitationId)
      .eq("email", user.email?.toLowerCase())
      .eq("status", "pending")
      .single();

    if (findError || !invitation) {
      return NextResponse.json(
        { error: "Invitation not found or already processed" },
        { status: 404 }
      );
    }

    if (action === "accept") {
      // Accept the invitation - link user and activate membership
      const { error: updateError } = await supabase
        .from("organization_members")
        .update({
          user_id: user.id,
          status: "active",
          joined_at: new Date().toISOString(),
        })
        .eq("id", invitationId);

      if (updateError) {
        console.error("Accept invitation error:", updateError);
        return NextResponse.json(
          { error: "Failed to accept invitation" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: "Invitation accepted",
        organizationId: invitation.organization_id,
      });
    } else {
      // Decline the invitation - mark as removed
      const { error: updateError } = await supabase
        .from("organization_members")
        .update({
          status: "removed",
        })
        .eq("id", invitationId);

      if (updateError) {
        console.error("Decline invitation error:", updateError);
        return NextResponse.json(
          { error: "Failed to decline invitation" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: "Invitation declined",
      });
    }
  } catch (error) {
    console.error("Process invitation error:", error);
    return NextResponse.json(
      { error: "Failed to process invitation" },
      { status: 500 }
    );
  }
}
