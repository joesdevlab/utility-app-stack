import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/resend";
import { checkTypedRateLimit, rateLimitResponse, getClientIp } from "@/lib/rate-limit";

interface ContactFormData {
  name: string;
  email: string;
  inquiryType: "general" | "support" | "employer" | "partnership";
  message: string;
}

const inquiryTypeLabels: Record<string, string> = {
  general: "General Inquiry",
  support: "Technical Support",
  employer: "Employer Portal",
  partnership: "Partnership",
};

export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP - 5 contact form submissions per hour
    const clientIp = getClientIp(request.headers);
    const rateLimitResult = checkTypedRateLimit(clientIp, "email");

    if (!rateLimitResult.allowed) {
      return rateLimitResponse(rateLimitResult);
    }

    const body: ContactFormData = await request.json();
    const { name, email, inquiryType, message } = body;

    // Validate required fields
    if (!name || !email || !inquiryType || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Validate message length
    if (message.length > 5000) {
      return NextResponse.json(
        { error: "Message is too long (max 5000 characters)" },
        { status: 400 }
      );
    }

    // Send notification email to support
    const emailResult = await sendEmail({
      to: "support@apprenticelog.nz",
      subject: `[Contact Form] ${inquiryTypeLabels[inquiryType] || "Inquiry"} from ${name}`,
      text: `
New contact form submission:

Name: ${name}
Email: ${email}
Type: ${inquiryTypeLabels[inquiryType] || inquiryType}

Message:
${message}

---
Submitted: ${new Date().toLocaleString("en-NZ", { timeZone: "Pacific/Auckland" })}
IP: ${clientIp}
      `.trim(),
    });

    if (!emailResult.success) {
      console.error("Failed to send contact form email:", emailResult.error);
      // Still return success to user - we don't want to expose internal errors
      // Log for monitoring but don't fail the request
    }

    // Send confirmation email to user
    await sendEmail({
      to: email,
      subject: "We received your message - Apprentice Log",
      text: `
Kia ora ${name},

Thanks for reaching out to Apprentice Log! We've received your message and will get back to you within 24-48 hours.

Your inquiry type: ${inquiryTypeLabels[inquiryType] || inquiryType}

Your message:
"${message}"

If you need immediate assistance, please check our FAQ at https://apprenticelog.nz/#faq

Ngā mihi,
The Apprentice Log Team

---
This is an automated confirmation. Please do not reply to this email.
      `.trim(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send message. Please try again." },
      { status: 500 }
    );
  }
}
