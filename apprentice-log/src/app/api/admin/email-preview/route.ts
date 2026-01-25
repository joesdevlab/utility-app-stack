import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { render } from "@react-email/render";
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

// Email template definitions with sample data
const EMAIL_TEMPLATES = {
  verification: {
    name: "Email Verification",
    description: "Sent when a new user signs up to verify their email address",
    component: VerificationEmail,
    sampleProps: {
      verificationUrl: "https://apprenticelog.nz/auth?token=sample_token&type=signup",
      userEmail: "apprentice@example.com",
      otp: "482915",
    },
  },
  "password-reset": {
    name: "Password Reset",
    description: "Sent when a user requests to reset their password",
    component: PasswordResetEmail,
    sampleProps: {
      resetUrl: "https://apprenticelog.nz/auth/reset-password?token=sample_token",
      userEmail: "apprentice@example.com",
      otp: "193847",
    },
  },
  welcome: {
    name: "Welcome Email",
    description: "Sent after a user verifies their email and completes signup",
    component: WelcomeEmail,
    sampleProps: {
      userName: "Jake",
      loginUrl: "https://apprenticelog.nz/app",
    },
  },
  "employer-invitation": {
    name: "Employer Invitation",
    description: "Sent when an employer invites an apprentice to join their organization",
    component: EmployerInvitationEmail,
    sampleProps: {
      inviteUrl: "https://apprenticelog.nz/auth?mode=signup&invite=org_123&email=apprentice@example.com",
      employerName: "BuildRight Construction Ltd",
      apprenticeEmail: "apprentice@example.com",
      message: "Welcome to the team! We're excited to have you join us for your carpentry apprenticeship.",
    },
  },
  "weekly-summary": {
    name: "Weekly Summary",
    description: "Weekly digest email showing apprentice progress and statistics",
    component: WeeklySummaryEmail,
    sampleProps: {
      userName: "Jake",
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
    description: "Weekly digest when the apprentice had no entries that week",
    component: WeeklySummaryEmail,
    sampleProps: {
      userName: "Jake",
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

export type EmailTemplateKey = keyof typeof EMAIL_TEMPLATES;

// GET - List all templates or preview a specific one
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get("template");

    // If no template specified, return list of templates
    if (!templateId) {
      const templates = Object.entries(EMAIL_TEMPLATES).map(([id, template]) => ({
        id,
        name: template.name,
        description: template.description,
      }));
      return NextResponse.json({ templates });
    }

    // Get specific template preview
    const template = EMAIL_TEMPLATES[templateId as EmailTemplateKey];
    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // Render the email to HTML
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Component = template.component as React.ComponentType<any>;
    const element = React.createElement(Component, template.sampleProps);
    const html = await render(element);

    return NextResponse.json({
      id: templateId,
      name: template.name,
      description: template.description,
      sampleProps: template.sampleProps,
      html,
    });
  } catch (error) {
    console.error("Email preview error:", error);
    return NextResponse.json(
      { error: "Failed to generate preview" },
      { status: 500 }
    );
  }
}
