import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/hub/sync/users
 *
 * Exports all ApprenticeLog user data for the Laika Hub to import.
 * Authenticated via X-Api-Key header (matches HUB_API_KEY env var).
 */
export async function GET(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key");
  const expectedKey = process.env.HUB_API_KEY;

  if (!expectedKey || apiKey !== expectedKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();

    const [profilesResult, membershipsResult] = await Promise.all([
      supabase.from("profiles").select("id, email, full_name, avatar_url, created_at"),
      supabase
        .from("organization_members")
        .select("user_id, role, organizations(id, name)")
        .eq("status", "active"),
    ]);

    if (profilesResult.error) throw profilesResult.error;
    if (membershipsResult.error) throw membershipsResult.error;

    const profiles = profilesResult.data;
    const memberships = membershipsResult.data;

    // Resolve emails from auth for profiles missing email
    const profilesMissingEmail = profiles.filter((p) => !p.email);
    let authEmailMap: Record<string, string> = {};

    if (profilesMissingEmail.length > 0) {
      const { data: authData, error: authError } =
        await supabase.auth.admin.listUsers();
      if (authError) throw authError;
      for (const user of authData.users) {
        if (user.email) authEmailMap[user.id] = user.email;
      }
    }

    // Group memberships by user
    const membershipsByUser: Record<
      string,
      Array<{ product_org_id: string; org_name: string; role: string }>
    > = {};
    for (const m of memberships) {
      const org = m.organizations as unknown as { id: string; name: string } | null;
      if (!org) continue;
      if (!membershipsByUser[m.user_id]) membershipsByUser[m.user_id] = [];
      membershipsByUser[m.user_id].push({
        product_org_id: org.id,
        org_name: org.name,
        role: m.role,
      });
    }

    const users = profiles.map((profile) => ({
      product_user_id: profile.id,
      email: profile.email || authEmailMap[profile.id] || null,
      name: profile.full_name || null,
      avatar_url: profile.avatar_url || null,
      status: "active" as const,
      created_at: profile.created_at,
      stripe_customer_id: null,
      orgs: membershipsByUser[profile.id] || [],
    }));

    return NextResponse.json({
      product: "apprenticelog",
      synced_at: new Date().toISOString(),
      users,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    console.error("[Hub Sync Users] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
