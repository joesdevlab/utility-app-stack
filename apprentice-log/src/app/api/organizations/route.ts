import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET - Get user's organization(s)
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user owns an organization
    const { data: ownedOrg } = await supabase
      .from("organizations")
      .select("*")
      .eq("owner_id", user.id)
      .single();

    if (ownedOrg) {
      // Get member count
      const { count: memberCount } = await supabase
        .from("organization_members")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", ownedOrg.id)
        .eq("status", "active");

      // Get stats
      const { data: stats } = await supabase
        .from("organization_stats")
        .select("*")
        .eq("organization_id", ownedOrg.id)
        .single();

      return NextResponse.json({
        organization: {
          ...ownedOrg,
          role: "owner",
          member_count: memberCount || 0,
        },
        stats,
      });
    }

    // Check if user is a member of an organization
    const { data: membership } = await supabase
      .from("organization_members")
      .select(`
        *,
        organization:organizations(*)
      `)
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    if (membership && membership.organization) {
      const org = membership.organization as {
        id: string;
        name: string;
        slug: string;
        owner_id: string;
        stripe_customer_id: string | null;
        stripe_subscription_id: string | null;
        plan: string;
        status: string;
        max_seats: number;
        current_period_start: string | null;
        current_period_end: string | null;
        created_at: string;
        updated_at: string;
      };

      // Get member count
      const { count: memberCount } = await supabase
        .from("organization_members")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", org.id)
        .eq("status", "active");

      // Get stats if admin/owner/supervisor
      let stats = null;
      if (membership.role !== "apprentice") {
        const { data: orgStats } = await supabase
          .from("organization_stats")
          .select("*")
          .eq("organization_id", org.id)
          .single();
        stats = orgStats;
      }

      return NextResponse.json({
        organization: {
          ...org,
          role: membership.role,
          member_count: memberCount || 0,
        },
        stats,
      });
    }

    // No organization found
    return NextResponse.json(
      { error: "No organization found" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Get organization error:", error);
    return NextResponse.json(
      { error: "Failed to get organization" },
      { status: 500 }
    );
  }
}

// POST - Create a new organization
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

    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Organization name must be at least 2 characters" },
        { status: 400 }
      );
    }

    // Check if user already owns an organization
    const { data: existingOrg } = await supabase
      .from("organizations")
      .select("id")
      .eq("owner_id", user.id)
      .single();

    if (existingOrg) {
      return NextResponse.json(
        { error: "You already own an organization" },
        { status: 400 }
      );
    }

    // Generate slug
    const { data: slugData, error: slugError } = await supabase
      .rpc("generate_org_slug", { org_name: name.trim() });

    if (slugError) {
      console.error("Slug generation error:", slugError);
      return NextResponse.json(
        { error: "Failed to generate organization slug" },
        { status: 500 }
      );
    }

    // Create organization
    const { data: organization, error: createError } = await supabase
      .from("organizations")
      .insert({
        name: name.trim(),
        slug: slugData,
        owner_id: user.id,
        plan: "starter",
        status: "active",
        max_seats: 5,
      })
      .select()
      .single();

    if (createError) {
      console.error("Create organization error:", createError);
      return NextResponse.json(
        { error: "Failed to create organization" },
        { status: 500 }
      );
    }

    // Add owner as a member with 'owner' role
    await supabase
      .from("organization_members")
      .insert({
        organization_id: organization.id,
        user_id: user.id,
        email: user.email!,
        role: "owner",
        status: "active",
        joined_at: new Date().toISOString(),
      });

    return NextResponse.json({
      organization: {
        ...organization,
        role: "owner",
        member_count: 1,
      },
    });
  } catch (error) {
    console.error("Create organization error:", error);
    return NextResponse.json(
      { error: "Failed to create organization" },
      { status: 500 }
    );
  }
}
