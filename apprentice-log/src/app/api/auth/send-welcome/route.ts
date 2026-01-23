import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/resend";
import { WelcomeEmail } from "@/emails";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://apprenticelog.nz";
    const loginUrl = `${baseUrl}/app`;

    // Get user's name from metadata if available
    const userName = user.user_metadata?.full_name ||
                     user.user_metadata?.name ||
                     user.email?.split("@")[0];

    // Send welcome email
    const result = await sendEmail({
      to: user.email!,
      subject: "Welcome to Apprentice Log!",
      react: WelcomeEmail({
        userName,
        loginUrl,
      }),
      text: `Welcome to Apprentice Log! Start logging your hours at ${loginUrl}`,
    });

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Send welcome email error:", error);
    return NextResponse.json(
      { error: "Failed to send welcome email" },
      { status: 500 }
    );
  }
}
