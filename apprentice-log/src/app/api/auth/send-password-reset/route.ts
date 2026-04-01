import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/resend";
import { PasswordResetEmail } from "@/emails";
import { checkTypedRateLimit, rateLimitResponse, getClientIp } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP to prevent email spam / brute force
    const clientIp = getClientIp(request.headers);
    const rateLimitResult = checkTypedRateLimit(clientIp, "password-reset");
    if (!rateLimitResult.allowed) {
      return rateLimitResponse(rateLimitResult);
    }

    const { email, token } = await request.json();

    if (!email || !token) {
      return NextResponse.json(
        { error: "Email and token are required" },
        { status: 400 }
      );
    }

    // Build reset URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://apprenticelog.nz";
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
