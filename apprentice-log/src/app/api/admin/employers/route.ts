import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Admin emails list
const ADMIN_EMAILS = [
  "joe@apprenticelog.nz",
  "joe@laikadynamics.co.nz",
  "joseph.doidge@gmail.com",
];

// GET - List all organizations with details
export async function GET() {
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

    // Get all organizations with owner info
    const { data: organizations, error: orgError } = await supabase
      .from("organizations")
      .select(`
        id,
        name,
        slug,
        owner_id,
        stripe_customer_id,
        stripe_subscription_id,
        plan,
        status,
        max_seats,
        current_period_start,
        current_period_end,
        created_at,
        updated_at
      `)
      .order("created_at", { ascending: false });

    if (orgError) throw orgError;

    // Get organization IDs
    const orgIds = (organizations || []).map(o => o.id);
    const ownerIds = [...new Set((organizations || []).map(o => o.owner_id))];

    // Batch query: Get owner profiles
    const { data: ownerProfiles } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, email")
      .in("id", ownerIds);

    const ownerMap: Record<string, { name: string; email: string }> = {};
    (ownerProfiles || []).forEach(p => {
      ownerMap[p.id] = {
        name: [p.first_name, p.last_name].filter(Boolean).join(" ") || "Unknown",
        email: p.email || "",
      };
    });

    // Batch query: Get member counts per org
    const { data: memberCounts } = await supabase
      .from("organization_members")
      .select("organization_id, role, status")
      .in("organization_id", orgIds);

    // Calculate stats per org
    const memberStatsMap: Record<string, {
      totalMembers: number;
      activeApprentices: number;
      pendingInvites: number;
    }> = {};

    (memberCounts || []).forEach(m => {
      if (!memberStatsMap[m.organization_id]) {
        memberStatsMap[m.organization_id] = {
          totalMembers: 0,
          activeApprentices: 0,
          pendingInvites: 0,
        };
      }
      if (m.status === "active") {
        memberStatsMap[m.organization_id].totalMembers++;
        if (m.role === "apprentice") {
          memberStatsMap[m.organization_id].activeApprentices++;
        }
      } else if (m.status === "pending") {
        memberStatsMap[m.organization_id].pendingInvites++;
      }
    });

    // Batch query: Get entry counts per org (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: entryCounts } = await supabase
      .from("logbook_entries")
      .select("organization_id")
      .in("organization_id", orgIds)
      .gte("created_at", thirtyDaysAgo.toISOString());

    const entryCountMap: Record<string, number> = {};
    (entryCounts || []).forEach(e => {
      entryCountMap[e.organization_id] = (entryCountMap[e.organization_id] || 0) + 1;
    });

    // Build response
    const employers = (organizations || []).map(org => ({
      id: org.id,
      name: org.name,
      slug: org.slug,
      owner: ownerMap[org.owner_id] || { name: "Unknown", email: "" },
      ownerId: org.owner_id,
      plan: org.plan,
      status: org.status,
      maxSeats: org.max_seats,
      stripeCustomerId: org.stripe_customer_id,
      stripeSubscriptionId: org.stripe_subscription_id,
      currentPeriodStart: org.current_period_start,
      currentPeriodEnd: org.current_period_end,
      stats: {
        totalMembers: memberStatsMap[org.id]?.totalMembers || 0,
        activeApprentices: memberStatsMap[org.id]?.activeApprentices || 0,
        pendingInvites: memberStatsMap[org.id]?.pendingInvites || 0,
        entriesLast30Days: entryCountMap[org.id] || 0,
      },
      createdAt: org.created_at,
      updatedAt: org.updated_at,
    }));

    return NextResponse.json({
      employers,
      total: employers.length,
    });
  } catch (error) {
    console.error("Admin employers list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch employers" },
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (!ADMIN_EMAILS.includes(user.email || "")) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { name, ownerEmail, plan, maxSeats } = await request.json();

    if (!name || !ownerEmail) {
      return NextResponse.json(
        { error: "Name and owner email are required" },
        { status: 400 }
      );
    }

    // Look up the owner by email
    const { data: ownerProfile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", ownerEmail.toLowerCase())
      .single();

    if (profileError || !ownerProfile) {
      return NextResponse.json(
        { error: "User not found with that email" },
        { status: 404 }
      );
    }

    // Check if user already owns an organization
    const { data: existingOrg } = await supabase
      .from("organizations")
      .select("id")
      .eq("owner_id", ownerProfile.id)
      .single();

    if (existingOrg) {
      return NextResponse.json(
        { error: "User already owns an organization" },
        { status: 400 }
      );
    }

    // Generate slug from name
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    // Check for existing slug and make unique
    let slug = baseSlug || "org";
    let counter = 0;
    while (true) {
      const { data: existingSlug } = await supabase
        .from("organizations")
        .select("id")
        .eq("slug", slug)
        .single();

      if (!existingSlug) break;
      counter++;
      slug = `${baseSlug}-${counter}`;
    }

    // Create the organization
    const { data: newOrg, error: createError } = await supabase
      .from("organizations")
      .insert({
        name,
        slug,
        owner_id: ownerProfile.id,
        plan: plan || "free",
        status: "active",
        max_seats: maxSeats || (plan === "pro" ? 999 : 2),
      })
      .select()
      .single();

    if (createError) throw createError;

    // Add owner as a member
    await supabase
      .from("organization_members")
      .insert({
        organization_id: newOrg.id,
        user_id: ownerProfile.id,
        email: ownerEmail.toLowerCase(),
        role: "owner",
        status: "active",
        joined_at: new Date().toISOString(),
      });

    return NextResponse.json({
      success: true,
      employer: {
        id: newOrg.id,
        name: newOrg.name,
        slug: newOrg.slug,
        plan: newOrg.plan,
        status: newOrg.status,
      },
    });
  } catch (error) {
    console.error("Admin create employer error:", error);
    return NextResponse.json(
      { error: "Failed to create employer" },
      { status: 500 }
    );
  }
}
