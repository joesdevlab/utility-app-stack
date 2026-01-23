import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/resend";
import { VerificationEmail } from "@/emails";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { email, token } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Build verification URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://apprenticelog.nz";
    const verificationUrl = token
      ? `${baseUrl}/auth?token=${token}&type=signup`
      : `${baseUrl}/auth`;

    // Send verification email
    const result = await sendEmail({
      to: email,
      subject: "Verify your email - Apprentice Log",
      react: VerificationEmail({
        verificationUrl,
        userEmail: email,
      }),
      text: `Verify your email address by clicking this link: ${verificationUrl}`,
    });

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Send verification email error:", error);
    return NextResponse.json(
      { error: "Failed to send verification email" },
      { status: 500 }
    );
  }
}
