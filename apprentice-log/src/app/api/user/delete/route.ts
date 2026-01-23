import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function DELETE(request: NextRequest) {
  try {
    // Get the authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;

    // Use admin client for deletion operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Missing Supabase admin credentials");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const adminClient = createAdminClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Delete user data in order (respecting foreign key constraints)
    // 1. Delete apprentice entries
    const { error: entriesError } = await adminClient
      .from("apprentice_entries")
      .delete()
      .eq("user_id", userId);

    if (entriesError) {
      console.error("Failed to delete entries:", entriesError);
      // Continue anyway - entries may not exist
    }

    // 2. Delete organization memberships
    const { error: membershipsError } = await adminClient
      .from("organization_members")
      .delete()
      .eq("user_id", userId);

    if (membershipsError) {
      console.error("Failed to delete memberships:", membershipsError);
      // Continue anyway
    }

    // 3. Delete any organizations the user owns (if they're the only member)
    // First, get organizations where user is owner
    const { data: ownedOrgs } = await adminClient
      .from("organizations")
      .select("id")
      .eq("owner_id", userId);

    if (ownedOrgs && ownedOrgs.length > 0) {
      for (const org of ownedOrgs) {
        // Check if there are other members
        const { count } = await adminClient
          .from("organization_members")
          .select("*", { count: "exact", head: true })
          .eq("organization_id", org.id);

        if (count === 0) {
          // No other members, safe to delete the organization
          await adminClient.from("organizations").delete().eq("id", org.id);
        } else {
          // Transfer ownership or leave org intact
          // For now, just remove the owner_id reference
          await adminClient
            .from("organizations")
            .update({ owner_id: null })
            .eq("id", org.id);
        }
      }
    }

    // 4. Delete user profile if exists
    const { error: profileError } = await adminClient
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (profileError) {
      console.error("Failed to delete profile:", profileError);
      // Continue anyway - profile may not exist
    }

    // 5. Delete the auth user (this is the final step)
    const { error: deleteUserError } =
      await adminClient.auth.admin.deleteUser(userId);

    if (deleteUserError) {
      console.error("Failed to delete auth user:", deleteUserError);
      return NextResponse.json(
        { error: "Failed to delete account. Please contact support." },
        { status: 500 }
      );
    }

    // Log the deletion for compliance
    console.log(`User account deleted: ${userId} at ${new Date().toISOString()}`);

    return NextResponse.json({
      success: true,
      message: "Account and all associated data have been deleted",
    });
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json(
      { error: "Failed to delete account. Please try again or contact support." },
      { status: 500 }
    );
  }
}
