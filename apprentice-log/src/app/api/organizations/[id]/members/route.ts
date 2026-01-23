import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { EMPLOYER_PLANS } from "@/lib/employer-stripe";

// GET - Get organization members
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

    // Check if user has access to this organization
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

    // Check if user is owner or active member
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

    // Get all members (email is already stored in organization_members)
    const { data: members, error: membersError } = await supabase
      .from("organization_members")
      .select("*")
      .eq("organization_id", id)
      .neq("status", "removed")
      .order("created_at", { ascending: false });

    if (membersError) {
      console.error("Get members error:", membersError);
      return NextResponse.json(
        { error: "Failed to get members" },
        { status: 500 }
      );
    }

    // Map members to include user info from stored data (no N+1 Auth API calls)
    const membersWithUsers = members.map((member) => ({
      ...member,
      user: member.user_id ? {
        id: member.user_id,
        email: member.email,
        full_name: null, // Could be stored in members table if needed
      } : null,
    }));

    return NextResponse.json({ members: membersWithUsers });
  } catch (error) {
    console.error("Get members error:", error);
    return NextResponse.json(
      { error: "Failed to get members" },
      { status: 500 }
    );
  }
}

// POST - Invite a new member
export async function POST(
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

    const body = await request.json();
    const { email, role } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

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
      .select("owner_id, plan, stripe_subscription_id")
      .eq("id", id)
      .single();

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    let canInvite = organization.owner_id === user.id;
    if (!canInvite) {
      const { data: membership } = await supabase
        .from("organization_members")
        .select("role")
        .eq("organization_id", id)
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();

      canInvite = membership?.role === "admin";
    }

    if (!canInvite) {
      return NextResponse.json(
        { error: "Only owners and admins can invite members" },
        { status: 403 }
      );
    }

    // Check apprentice limit based on B2B plan
    // Pro/Paid plan = unlimited, Free plan = 2 apprentices max
    const isPro = organization.plan === "pro" || organization.plan === "paid";

    if (!isPro && role === "apprentice") {
      // Count active apprentices only (not admins/supervisors)
      const { count: apprenticeCount } = await supabase
        .from("organization_members")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", id)
        .eq("role", "apprentice")
        .eq("status", "active");

      const maxApprentices = EMPLOYER_PLANS.free.maxApprentices;
      if ((apprenticeCount || 0) >= maxApprentices) {
        return NextResponse.json(
          {
            error: "Free plan limited to 2 apprentices. Upgrade to Pro for unlimited apprentices.",
            code: "APPRENTICE_LIMIT_REACHED"
          },
          { status: 400 }
        );
      }
    }

    // Check if email is already a member
    const { data: existingMember } = await supabase
      .from("organization_members")
      .select("id, status")
      .eq("organization_id", id)
      .eq("email", email.toLowerCase())
      .single();

    if (existingMember) {
      if (existingMember.status === "active") {
        return NextResponse.json(
          { error: "This email is already a member of this organization" },
          { status: 400 }
        );
      }
      // Reactivate removed member or resend pending invite
      const { error: updateError } = await supabase
        .from("organization_members")
        .update({
          role,
          status: "pending",
          invited_at: new Date().toISOString(),
        })
        .eq("id", existingMember.id);

      if (updateError) {
        console.error("Update member error:", updateError);
        return NextResponse.json(
          { error: "Failed to invite member" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: "Invitation sent",
        member: { ...existingMember, role, status: "pending" },
      });
    }

    // Check if user with this email exists
    const { data: users } = await supabase.auth.admin.listUsers();
    const existingUser = users?.users?.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );

    // Create invitation
    const { data: member, error: inviteError } = await supabase
      .from("organization_members")
      .insert({
        organization_id: id,
        user_id: existingUser?.id || null,
        email: email.toLowerCase(),
        role,
        status: existingUser ? "active" : "pending",
        joined_at: existingUser ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (inviteError) {
      console.error("Invite member error:", inviteError);
      return NextResponse.json(
        { error: "Failed to invite member" },
        { status: 500 }
      );
    }

    // TODO: Send invitation email for pending members

    return NextResponse.json({
      message: existingUser ? "Member added" : "Invitation sent",
      member,
    });
  } catch (error) {
    console.error("Invite member error:", error);
    return NextResponse.json(
      { error: "Failed to invite member" },
      { status: 500 }
    );
  }
}
