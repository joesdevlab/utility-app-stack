import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/resend";
import { VerificationEmail, PasswordResetEmail, WelcomeEmail } from "@/emails";
import crypto from "crypto";

/**
 * Supabase Send Email Hook
 *
 * This endpoint receives email sending requests from Supabase Auth
 * and sends branded emails via Resend.
 *
 * Configure in Supabase Dashboard:
 * Authentication > Hooks > Send Email > Enable HTTP
 * URL: https://apprenticelog.nz/api/auth/hook
 *
 * The hook secret should be added to environment variables as:
 * SUPABASE_AUTH_HOOK_SECRET=whsec_xxxxx (the base64 part after v1,whsec_)
 */

// Verify Standard Webhooks signature
function verifyWebhookSignature(
  payload: string,
  webhookId: string,
  webhookTimestamp: string,
  webhookSignature: string
): boolean {
  const secret = process.env.SUPABASE_AUTH_HOOK_SECRET;
  if (!secret) {
    console.warn("SUPABASE_AUTH_HOOK_SECRET not set - skipping verification in development");
    return process.env.NODE_ENV !== "production";
  }

  // Decode the base64 secret
  const secretBytes = Buffer.from(secret, "base64");

  // Create the signed payload: "webhook_id.webhook_timestamp.body"
  const signedPayload = `${webhookId}.${webhookTimestamp}.${payload}`;

  // Calculate expected signature
  const expectedSignature = crypto
    .createHmac("sha256", secretBytes)
    .update(signedPayload)
    .digest("base64");

  // The webhook-signature header contains: v1,<signature>
  // There may be multiple signatures separated by spaces
  const signatures = webhookSignature.split(" ");

  for (const sig of signatures) {
    const [version, signature] = sig.split(",");
    if (version === "v1" && signature) {
      try {
        if (crypto.timingSafeEqual(
          Buffer.from(signature),
          Buffer.from(expectedSignature)
        )) {
          return true;
        }
      } catch {
        // Length mismatch, continue checking other signatures
      }
    }
  }

  return false;
}

// Supabase Send Email Hook payload types
type EmailActionType = "signup" | "recovery" | "invite" | "magiclink" | "email_change" | "reauthentication";

interface SendEmailHookPayload {
  user: {
    id: string;
    email: string;
    phone?: string;
    created_at: string;
    updated_at: string;
    email_confirmed_at?: string;
    phone_confirmed_at?: string;
    user_metadata?: Record<string, unknown>;
    app_metadata?: {
      provider?: string;
      providers?: string[];
      [key: string]: unknown;
    };
    identities?: Array<{
      id: string;
      user_id: string;
      identity_data: Record<string, unknown>;
      provider: string;
      created_at: string;
      updated_at: string;
    }>;
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: EmailActionType;
    site_url: string;
    // For email change - these names are counterintuitive:
    // token_hash_new pairs with CURRENT email, token_hash pairs with NEW email
    token_new?: string;
    token_hash_new?: string;
    new_email?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();

    // Standard Webhooks headers
    const webhookId = request.headers.get("webhook-id") || "";
    const webhookTimestamp = request.headers.get("webhook-timestamp") || "";
    const webhookSignature = request.headers.get("webhook-signature") || "";

    // Verify signature
    if (!verifyWebhookSignature(payload, webhookId, webhookTimestamp, webhookSignature)) {
      console.error("Invalid webhook signature");
      return NextResponse.json(
        { error: { http_code: 401, message: "Invalid signature" } },
        { status: 401 }
      );
    }

    // Check timestamp to prevent replay attacks (5 minute tolerance)
    const timestamp = parseInt(webhookTimestamp, 10);
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - timestamp) > 300) {
      console.error("Webhook timestamp too old");
      return NextResponse.json(
        { error: { http_code: 401, message: "Timestamp too old" } },
        { status: 401 }
      );
    }

    const data: SendEmailHookPayload = JSON.parse(payload);
    const { user, email_data } = data;

    console.log(`Send Email Hook: ${email_data.email_action_type} for ${user.email}`);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://apprenticelog.nz";

    switch (email_data.email_action_type) {
      case "signup": {
        // Email verification for new signups
        const verificationUrl = `${baseUrl}/auth/confirm?token_hash=${email_data.token_hash}&type=signup&redirect_to=${encodeURIComponent(email_data.redirect_to || "/app")}`;

        await sendEmail({
          to: user.email,
          subject: "Verify your email - Apprentice Log",
          react: VerificationEmail({
            verificationUrl,
            userEmail: user.email,
            otp: email_data.token, // Include OTP for manual entry
          }),
          text: `Verify your email address: ${verificationUrl}\n\nOr enter this code: ${email_data.token}`,
        });
        break;
      }

      case "recovery": {
        // Password reset
        const resetUrl = `${baseUrl}/auth/reset-password?token_hash=${email_data.token_hash}&type=recovery`;

        await sendEmail({
          to: user.email,
          subject: "Reset your password - Apprentice Log",
          react: PasswordResetEmail({
            resetUrl,
            userEmail: user.email,
            otp: email_data.token,
          }),
          text: `Reset your password: ${resetUrl}\n\nOr enter this code: ${email_data.token}`,
        });
        break;
      }

      case "invite": {
        // Team invite (for employer portal)
        const inviteUrl = `${baseUrl}/auth/confirm?token_hash=${email_data.token_hash}&type=invite&redirect_to=${encodeURIComponent(email_data.redirect_to || "/app")}`;

        await sendEmail({
          to: user.email,
          subject: "You've been invited to Apprentice Log",
          react: VerificationEmail({
            verificationUrl: inviteUrl,
            userEmail: user.email,
            otp: email_data.token,
          }),
          text: `Accept your invitation: ${inviteUrl}\n\nOr enter this code: ${email_data.token}`,
        });
        break;
      }

      case "magiclink": {
        // Magic link login
        const magicLinkUrl = `${baseUrl}/auth/confirm?token_hash=${email_data.token_hash}&type=magiclink&redirect_to=${encodeURIComponent(email_data.redirect_to || "/app")}`;

        await sendEmail({
          to: user.email,
          subject: "Sign in to Apprentice Log",
          react: VerificationEmail({
            verificationUrl: magicLinkUrl,
            userEmail: user.email,
            otp: email_data.token,
          }),
          text: `Sign in to your account: ${magicLinkUrl}\n\nOr enter this code: ${email_data.token}`,
        });
        break;
      }

      case "email_change": {
        // Email change verification
        // Note: token_hash is for NEW email, token_hash_new is for CURRENT email
        const confirmUrl = `${baseUrl}/auth/confirm?token_hash=${email_data.token_hash}&type=email_change&redirect_to=${encodeURIComponent(email_data.redirect_to || "/app")}`;

        await sendEmail({
          to: email_data.new_email || user.email,
          subject: "Confirm your new email - Apprentice Log",
          react: VerificationEmail({
            verificationUrl: confirmUrl,
            userEmail: email_data.new_email || user.email,
            otp: email_data.token,
          }),
          text: `Confirm your email change: ${confirmUrl}\n\nOr enter this code: ${email_data.token}`,
        });
        break;
      }

      case "reauthentication": {
        // Reauthentication for sensitive actions
        await sendEmail({
          to: user.email,
          subject: "Confirm your action - Apprentice Log",
          react: VerificationEmail({
            verificationUrl: "#", // No link for reauth, just OTP
            userEmail: user.email,
            otp: email_data.token,
          }),
          text: `Your verification code is: ${email_data.token}`,
        });
        break;
      }

      default:
        console.log(`Unhandled email action type: ${email_data.email_action_type}`);
    }

    // Return empty JSON with 200 status for success
    return NextResponse.json({});
  } catch (error) {
    console.error("Send Email Hook error:", error);
    return NextResponse.json(
      { error: { http_code: 500, message: "Email sending failed" } },
      { status: 500 }
    );
  }
}
