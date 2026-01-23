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
  react: React.ReactElement;
  text?: string;
}) {
  if (!resend) {
    console.error("Resend not configured - email not sent:", { to, subject });
    return { error: "Email service not configured" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: emailConfig.from,
      to: Array.isArray(to) ? to : [to],
      subject,
      react,
      text,
    });

    if (error) {
      console.error("Failed to send email:", error);
      return { error: error.message };
    }

    return { data };
  } catch (err) {
    console.error("Email send error:", err);
    return { error: err instanceof Error ? err.message : "Unknown error" };
  }
}
