import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/referrals
 * Get the current user's referral code and stats
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get or create referral code
    const { data: codeResult, error: codeError } = await supabase.rpc(
      "get_or_create_referral_code",
      { user_uuid: user.id }
    );

    if (codeError) {
      console.error("Error getting referral code:", codeError);
      // Fallback: try to generate a simple code
      const fallbackCode = user.id.substring(0, 8).toUpperCase();
      return NextResponse.json({
        code: fallbackCode,
        referralLink: `https://apprenticelog.nz/?ref=${fallbackCode}`,
        stats: { total: 0, successful: 0, pending: 0 },
      });
    }

    // Get referral stats
    const { data: referrals } = await supabase
      .from("referrals")
      .select("status")
      .eq("referrer_id", user.id);

    const stats = {
      total: referrals?.length || 0,
      successful: referrals?.filter(r => r.status === "converted" || r.status === "activated").length || 0,
      pending: referrals?.filter(r => r.status === "pending" || r.status === "signed_up").length || 0,
    };

    // Get rewards
    const { data: rewards } = await supabase
      .from("referral_rewards")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "awarded");

    return NextResponse.json({
      code: codeResult,
      referralLink: `https://apprenticelog.nz/?ref=${codeResult}`,
      stats,
      rewards: rewards || [],
    });
  } catch (error) {
    console.error("Referrals API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch referral data" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/referrals
 * Track a referral signup (called when user signs up with a referral code)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { referralCode, referredEmail } = body;

    if (!referralCode) {
      return NextResponse.json(
        { error: "Referral code is required" },
        { status: 400 }
      );
    }

    // Find the referral code
    const { data: codeData, error: codeError } = await supabase
      .from("referral_codes")
      .select("user_id")
      .eq("code", referralCode.toUpperCase())
      .single();

    if (codeError || !codeData) {
      return NextResponse.json(
        { error: "Invalid referral code" },
        { status: 400 }
      );
    }

    // Create referral record
    const { data: referral, error: insertError } = await supabase
      .from("referrals")
      .insert({
        referrer_id: codeData.user_id,
        referral_code: referralCode.toUpperCase(),
        referred_email: referredEmail,
        status: "pending",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating referral:", insertError);
      return NextResponse.json(
        { error: "Failed to track referral" },
        { status: 500 }
      );
    }

    // Update referral code stats
    await supabase
      .from("referral_codes")
      .update({
        total_referrals: supabase.rpc("increment", { x: 1 }),
      })
      .eq("code", referralCode.toUpperCase());

    return NextResponse.json({
      success: true,
      referralId: referral.id,
    });
  } catch (error) {
    console.error("Referral tracking error:", error);
    return NextResponse.json(
      { error: "Failed to track referral" },
      { status: 500 }
    );
  }
}
