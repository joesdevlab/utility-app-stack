import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export interface ExitSurveyData {
  reason: string;
  details?: string;
  wouldRecommend: boolean | null;
  feedback?: string;
}

// Exit survey reasons for churn analysis
export const EXIT_REASONS = [
  { id: "not_using", label: "I'm not using it anymore" },
  { id: "too_expensive", label: "Too expensive for my needs" },
  { id: "missing_features", label: "Missing features I need" },
  { id: "hard_to_use", label: "Too difficult to use" },
  { id: "switched_competitor", label: "Switched to another solution" },
  { id: "employer_change", label: "Changed employers" },
  { id: "finished_apprenticeship", label: "Finished my apprenticeship" },
  { id: "privacy_concerns", label: "Privacy or security concerns" },
  { id: "other", label: "Other reason" },
] as const;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: ExitSurveyData = await request.json();

    // Validate required fields
    if (!body.reason) {
      return NextResponse.json(
        { error: "Reason is required" },
        { status: 400 }
      );
    }

    // Save exit survey to database
    const { error: insertError } = await supabase
      .from("exit_surveys")
      .insert({
        user_id: user.id,
        user_email: user.email,
        reason: body.reason,
        details: body.details || null,
        would_recommend: body.wouldRecommend,
        feedback: body.feedback || null,
        created_at: new Date().toISOString(),
      });

    if (insertError) {
      // Table might not exist yet, log but don't fail
      console.error("Failed to save exit survey:", insertError);
      // Still return success - we don't want to block deletion
      return NextResponse.json({ success: true, saved: false });
    }

    console.log(
      `Exit survey recorded for user ${user.id}: ${body.reason}`
    );

    return NextResponse.json({ success: true, saved: true });
  } catch (error) {
    console.error("Exit survey error:", error);
    // Don't fail the deletion flow
    return NextResponse.json({ success: true, saved: false });
  }
}
