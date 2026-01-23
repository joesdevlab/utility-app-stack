import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/resend";
import { PasswordResetEmail } from "@/emails";

export async function POST(request: NextRequest) {
  try {
    const { email, token } = await request.json();

    if (!email || !token) {
      return NextResponse.json(
        { error: "Email and token are required" },
        { status: 400 }
      );
    }

    // Build reset URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://apprentice-log.vercel.app";
    const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`;

    // Send password reset email
    const result = await sendEmail({
      to: email,
      subject: "Reset your password - Apprentice Log",
      react: PasswordResetEmail({
        resetUrl,
        userEmail: email,
      }),
      text: `Reset your password by clicking this link: ${resetUrl}`,
    });

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Send password reset email error:", error);
    return NextResponse.json(
      { error: "Failed to send password reset email" },
      { status: 500 }
    );
  }
}
