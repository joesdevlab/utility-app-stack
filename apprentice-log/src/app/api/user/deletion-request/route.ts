import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/resend";
import { checkTypedRateLimit, rateLimitResponse, getClientIp } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP - 3 deletion requests per hour
    const clientIp = getClientIp(request.headers);
    const rateLimitResult = checkTypedRateLimit(clientIp, "email");

    if (!rateLimitResult.allowed) {
      return rateLimitResponse(rateLimitResult);
    }

    const body = await request.json();
    const { email, reason } = body;

    // Validate email
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email address is required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Send notification to support team
    const supportEmailResult = await sendEmail({
      to: "support@apprenticelog.nz",
      subject: `[Account Deletion Request] ${email}`,
      text: `
Account Deletion Request

A user has requested to delete their account.

Email: ${email}
Reason: ${reason || "Not provided"}

---
Submitted: ${new Date().toLocaleString("en-NZ", { timeZone: "Pacific/Auckland" })}
IP: ${clientIp}

Action Required:
1. Verify this email exists in the system
2. Send verification email to confirm identity
3. Process deletion within 30 days per Privacy Policy
      `.trim(),
    });

    if (!supportEmailResult.success) {
      console.error("Failed to send support notification:", supportEmailResult.error);
      // Continue anyway - log for monitoring
    }

    // Send confirmation email to user
    const userEmailResult = await sendEmail({
      to: email,
      subject: "Account Deletion Request Received - Apprentice Log",
      text: `
Kia ora,

We've received your request to delete your Apprentice Log account associated with this email address.

What happens next:
1. Our team will verify your identity
2. You may receive a follow-up email for verification
3. Your account and all data will be permanently deleted within 30 days

If you did NOT request this deletion, please contact us immediately at support@apprenticelog.nz.

If you change your mind, you can cancel this request by replying to this email within 7 days.

Ngā mihi,
The Apprentice Log Team

---
This email was sent because someone requested to delete an account using this email address.
If you didn't make this request, you can safely ignore this email.
      `.trim(),
    });

    if (!userEmailResult.success) {
      console.error("Failed to send user confirmation:", userEmailResult.error);
      // Still return success - the request was logged
    }

    // Log the deletion request for compliance
    console.log(`Account deletion request: ${email} at ${new Date().toISOString()} from IP: ${clientIp}`);

    return NextResponse.json({
      success: true,
      message: "Deletion request submitted successfully",
    });
  } catch (error) {
    console.error("Deletion request error:", error);
    return NextResponse.json(
      { error: "Failed to submit deletion request. Please try again." },
      { status: 500 }
    );
  }
}
