import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateRecoveryCodes, hashRecoveryCode, verifyRecoveryCode } from "@/lib/mfa-recovery";

// GET - Get recovery codes status (how many remaining)
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

    // Get recovery codes from user metadata
    const recoveryCodes = user.user_metadata?.mfa_recovery_codes as string[] || [];
    const usedCodes = user.user_metadata?.mfa_recovery_codes_used as number[] || [];

    return NextResponse.json({
      total: recoveryCodes.length,
      remaining: recoveryCodes.length - usedCodes.length,
      hasRecoveryCodes: recoveryCodes.length > 0,
    });
  } catch (error) {
    console.error("Get recovery codes error:", error);
    return NextResponse.json(
      { error: "Failed to get recovery codes status" },
      { status: 500 }
    );
  }
}

// POST - Generate new recovery codes
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

    // Generate new recovery codes
    const plainCodes = generateRecoveryCodes(10);
    const hashedCodes = plainCodes.map(hashRecoveryCode);

    // Store hashed codes in user metadata using admin client
    const adminSupabase = createAdminClient();
    const { error: updateError } = await adminSupabase.auth.admin.updateUserById(
      user.id,
      {
        user_metadata: {
          ...user.user_metadata,
          mfa_recovery_codes: hashedCodes,
          mfa_recovery_codes_used: [],
          mfa_recovery_codes_generated_at: new Date().toISOString(),
        },
      }
    );

    if (updateError) {
      console.error("Failed to store recovery codes:", updateError);
      return NextResponse.json(
        { error: "Failed to generate recovery codes" },
        { status: 500 }
      );
    }

    // Return plain codes to user (only time they'll see them!)
    return NextResponse.json({
      codes: plainCodes,
      message: "Save these codes in a secure place. You won't be able to see them again!",
    });
  } catch (error) {
    console.error("Generate recovery codes error:", error);
    return NextResponse.json(
      { error: "Failed to generate recovery codes" },
      { status: 500 }
    );
  }
}

// PUT - Use a recovery code to verify MFA
export async function PUT(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: "Recovery code is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get stored recovery codes
    const hashedCodes = user.user_metadata?.mfa_recovery_codes as string[] || [];
    const usedIndices = user.user_metadata?.mfa_recovery_codes_used as number[] || [];

    if (hashedCodes.length === 0) {
      return NextResponse.json(
        { error: "No recovery codes configured" },
        { status: 400 }
      );
    }

    // Verify the code
    const { valid, usedIndex } = verifyRecoveryCode(code, hashedCodes);

    if (!valid) {
      return NextResponse.json(
        { error: "Invalid recovery code" },
        { status: 400 }
      );
    }

    // Check if code was already used
    if (usedIndices.includes(usedIndex)) {
      return NextResponse.json(
        { error: "This recovery code has already been used" },
        { status: 400 }
      );
    }

    // Mark code as used
    const adminSupabase = createAdminClient();
    const { error: updateError } = await adminSupabase.auth.admin.updateUserById(
      user.id,
      {
        user_metadata: {
          ...user.user_metadata,
          mfa_recovery_codes_used: [...usedIndices, usedIndex],
        },
      }
    );

    if (updateError) {
      console.error("Failed to mark recovery code as used:", updateError);
    }

    const remaining = hashedCodes.length - usedIndices.length - 1;

    return NextResponse.json({
      success: true,
      remaining,
      message: remaining <= 2
        ? `Warning: Only ${remaining} recovery codes remaining. Consider generating new ones.`
        : undefined,
    });
  } catch (error) {
    console.error("Verify recovery code error:", error);
    return NextResponse.json(
      { error: "Failed to verify recovery code" },
      { status: 500 }
    );
  }
}
