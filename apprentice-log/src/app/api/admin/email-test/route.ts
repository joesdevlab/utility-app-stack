import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/resend";
import React from "react";
import {
  VerificationEmail,
  PasswordResetEmail,
  WelcomeEmail,
  EmployerInvitationEmail,
  WeeklySummaryEmail,
} from "@/emails";

// Admin emails list
const ADMIN_EMAILS = [
  "joe@apprenticelog.nz",
  "joe@laikadynamics.co.nz",
  "joseph.doidge@gmail.com",
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EmailComponent = React.ComponentType<any>;

// Email template definitions with sample data
const EMAIL_TEMPLATES: Record<string, {
  name: string;
  subject: string;
  component: EmailComponent;
  sampleProps: Record<string, unknown>;
}> = {
  verification: {
    name: "Email Verification",
    subject: "Verify your email - Apprentice Log",
    component: VerificationEmail,
    sampleProps: {
      verificationUrl: "https://apprenticelog.nz/auth?token=sample_token&type=signup",
      userEmail: "test@example.com",
      otp: "482915",
    },
  },
  "password-reset": {
    name: "Password Reset",
    subject: "Reset your password - Apprentice Log",
    component: PasswordResetEmail,
    sampleProps: {
      resetUrl: "https://apprenticelog.nz/auth/reset-password?token=sample_token",
      userEmail: "test@example.com",
      otp: "193847",
    },
  },
  welcome: {
    name: "Welcome Email",
    subject: "Welcome to Apprentice Log!",
    component: WelcomeEmail,
    sampleProps: {
      userName: "Test User",
      loginUrl: "https://apprenticelog.nz/app",
    },
  },
  "employer-invitation": {
    name: "Employer Invitation",
    subject: "BuildRight Construction has invited you to join Apprentice Log",
    component: EmployerInvitationEmail,
    sampleProps: {
      inviteUrl: "https://apprenticelog.nz/auth?mode=signup&invite=org_123&email=test@example.com",
      employerName: "BuildRight Construction Ltd",
      apprenticeEmail: "test@example.com",
      message: "Welcome to the team! We're excited to have you join us for your carpentry apprenticeship.",
    },
  },
  "weekly-summary": {
    name: "Weekly Summary",
    subject: "Your weekly summary: 38.5 hours logged this week",
    component: WeeklySummaryEmail,
    sampleProps: {
      userName: "Test User",
      weekStartDate: "20 Jan 2026",
      weekEndDate: "26 Jan 2026",
      stats: {
        totalHours: 38.5,
        entriesCount: 5,
        streak: 12,
        topSkill: "Framing",
      },
      dashboardUrl: "https://apprenticelog.nz/app",
    },
  },
  "weekly-summary-no-activity": {
    name: "Weekly Summary (No Activity)",
    subject: "Your weekly summary: 0 hours logged this week",
    component: WeeklySummaryEmail,
    sampleProps: {
      userName: "Test User",
      weekStartDate: "20 Jan 2026",
      weekEndDate: "26 Jan 2026",
      stats: {
        totalHours: 0,
        entriesCount: 0,
        streak: 0,
      },
      dashboardUrl: "https://apprenticelog.nz/app",
    },
  },
};

// POST - Send a test email
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (!ADMIN_EMAILS.includes(user.email || "")) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { templateId, recipientEmail, customProps } = await request.json();

    if (!templateId) {
      return NextResponse.json({ error: "Template ID is required" }, { status: 400 });
    }

    const template = EMAIL_TEMPLATES[templateId];
    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // Use custom props if provided, otherwise use sample props
    // Update email in props to match recipient
    const props = {
      ...template.sampleProps,
      ...customProps,
    };

    // Update any email fields to match recipient
    if (recipientEmail) {
      if ("userEmail" in props) props.userEmail = recipientEmail;
      if ("apprenticeEmail" in props) props.apprenticeEmail = recipientEmail;
    }

    const targetEmail = recipientEmail || user.email;

    if (!targetEmail) {
      return NextResponse.json({ error: "No recipient email" }, { status: 400 });
    }

    // Send the test email
    const Component = template.component;
    const element = React.createElement(Component, props);
    const result = await sendEmail({
      to: targetEmail,
      subject: `[TEST] ${template.subject}`,
      react: element,
      text: `Test email for: ${template.name}`,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Test email sent to ${targetEmail}`,
      templateName: template.name,
    });
  } catch (error) {
    console.error("Send test email error:", error);
    return NextResponse.json(
      { error: "Failed to send test email" },
      { status: 500 }
    );
  }
}
