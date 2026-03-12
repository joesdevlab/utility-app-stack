import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/employer-stripe";

// GET - Get organization by ID
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

    // Get organization
    const { data: organization, error: orgError } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", id)
      .single();

    if (orgError || !organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Check if user has access
    let role: string | null = null;
    if (organization.owner_id === user.id) {
      role = "owner";
    } else {
      const { data: membership } = await supabase
        .from("organization_members")
        .select("role")
        .eq("organization_id", id)
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();

      if (membership) {
        role = membership.role;
      }
    }

    if (!role) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // Get member count
    const { count: memberCount } = await supabase
      .from("organization_members")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", id)
      .eq("status", "active");

    // Get stats
    const { data: stats } = await supabase
      .from("organization_stats")
      .select("*")
      .eq("organization_id", id)
      .single();

    return NextResponse.json({
      organization: {
        ...organization,
        role,
        member_count: memberCount || 0,
      },
      stats,
    });
  } catch (error) {
    console.error("Get organization error:", error);
    return NextResponse.json(
      { error: "Failed to get organization" },
      { status: 500 }
    );
  }
}

// PATCH - Update organization
export async function PATCH(
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

    // Check if user is the owner
    const { data: organization } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", id)
      .eq("owner_id", user.id)
      .single();

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found or access denied" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name } = body;

    // Only allow updating name for now
    const updates: Record<string, string> = {};
    if (name && typeof name === "string" && name.trim().length >= 2) {
      updates.name = name.trim();
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid updates provided" },
        { status: 400 }
      );
    }

    const { data: updatedOrg, error: updateError } = await supabase
      .from("organizations")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Update organization error:", updateError);
      return NextResponse.json(
        { error: "Failed to update organization" },
        { status: 500 }
      );
    }

    // Get member count
    const { count: memberCount } = await supabase
      .from("organization_members")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", id)
      .eq("status", "active");

    return NextResponse.json({
      organization: {
        ...updatedOrg,
        role: "owner",
        member_count: memberCount || 0,
      },
    });
  } catch (error) {
    console.error("Update organization error:", error);
    return NextResponse.json(
      { error: "Failed to update organization" },
      { status: 500 }
    );
  }
}

// DELETE - Delete organization (owner only)
export async function DELETE(
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

    // Only the owner can delete the organization
    const { data: organization } = await supabase
      .from("organizations")
      .select("id, owner_id, stripe_subscription_id, stripe_customer_id, name")
      .eq("id", id)
      .eq("owner_id", user.id)
      .single();

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found or you are not the owner" },
        { status: 403 }
      );
    }

    // Cancel active Stripe subscription if one exists
    if (organization.stripe_subscription_id) {
      try {
        const stripe = getStripe();
        await stripe.subscriptions.cancel(organization.stripe_subscription_id);
      } catch (stripeError) {
        console.error("Failed to cancel Stripe subscription:", stripeError);
        // Continue with deletion even if Stripe cancellation fails
      }
    }

    // Remove all members
    await supabase
      .from("organization_members")
      .update({ status: "removed" })
      .eq("organization_id", id);

    // Delete the organization
    const { error: deleteError } = await supabase
      .from("organizations")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Delete organization error:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete organization" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: `Organization "${organization.name}" has been deleted`,
    });
  } catch (error) {
    console.error("Delete organization error:", error);
    return NextResponse.json(
      { error: "Failed to delete organization" },
      { status: 500 }
    );
  }
}
