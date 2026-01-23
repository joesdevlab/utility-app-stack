import { Resend } from "resend";

// Initialize Resend client
const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  console.warn("RESEND_API_KEY is not set - emails will not be sent");
}

export const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Email configuration
export const emailConfig = {
  from: "Apprentice Log <noreply@apprenticelog.co.nz>",
  replyTo: "support@apprenticelog.co.nz",
};

// Send email helper with error handling
export async function sendEmail({
  to,
  subject,
  react,
  text,
}: {
  to: string | string[];
  subject: string;
  react?: React.ReactElement | null;
  text?: string;
}): Promise<{ data?: unknown; error?: string; success: boolean }> {
  if (!resend) {
    console.error("Resend not configured - email not sent:", { to, subject });
    return { error: "Email service not configured", success: false };
  }

  try {
    const toAddresses = Array.isArray(to) ? to : [to];

    // Resend requires either react or text (or html)
    // Use type assertion to handle the union type properly
    let result;

    if (react) {
      result = await resend.emails.send({
        from: emailConfig.from,
        to: toAddresses,
        subject,
        react,
        text,
      });
    } else if (text) {
      result = await resend.emails.send({
        from: emailConfig.from,
        to: toAddresses,
        subject,
        text,
      });
    } else {
      return { error: "Either react or text content is required", success: false };
    }

    const { data, error } = result;

    if (error) {
      console.error("Failed to send email:", error);
      return { error: error.message, success: false };
    }

    return { data, success: true };
  } catch (err) {
    console.error("Email send error:", err);
    return { error: err instanceof Error ? err.message : "Unknown error", success: false };
  }
}
