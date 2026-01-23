import {
  Button,
  Heading,
  Text,
  Section,
} from "@react-email/components";
import * as React from "react";
import { BaseLayout } from "./base-layout";

interface PasswordResetEmailProps {
  resetUrl: string;
  userEmail?: string;
  otp?: string;
}

export function PasswordResetEmail({
  resetUrl,
  userEmail,
  otp,
}: PasswordResetEmailProps) {
  return (
    <BaseLayout preview="Reset your Apprentice Log password">
      <Heading style={heading}>Reset your password</Heading>

      <Text style={paragraph}>
        Kia ora{userEmail ? ` ${userEmail.split("@")[0]}` : ""}!
      </Text>

      <Text style={paragraph}>
        We received a request to reset the password for your Apprentice Log
        account. Click the button below to choose a new password.
      </Text>

      <Section style={buttonContainer}>
        <Button style={button} href={resetUrl}>
          Reset Password
        </Button>
      </Section>

      {otp && (
        <Section style={otpContainer}>
          <Text style={otpLabel}>Or enter this code:</Text>
          <Text style={otpCode}>{otp}</Text>
        </Section>
      )}

      <Text style={paragraph}>
        This link will expire in 1 hour. If you didn&apos;t request a password
        reset, you can safely ignore this email. Your password will remain
        unchanged.
      </Text>

      <Section style={securityTip}>
        <Text style={securityTipTitle}>Security tip</Text>
        <Text style={securityTipText}>
          If you didn&apos;t request this password reset, someone may be trying
          to access your account. Consider enabling two-factor authentication
          (2FA) for extra security.
        </Text>
      </Section>

      <Text style={smallText}>
        If the button doesn&apos;t work, copy and paste this link into your
        browser:
      </Text>
      <Text style={linkText}>{resetUrl}</Text>
    </BaseLayout>
  );
}

// Styles
const heading = {
  fontSize: "24px",
  fontWeight: "700",
  color: "#1a1a1a",
  margin: "0 0 24px",
  textAlign: "center" as const,
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#404040",
  margin: "0 0 16px",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#f97316",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 32px",
};

const securityTip = {
  backgroundColor: "#fef3c7",
  borderRadius: "8px",
  padding: "16px",
  margin: "24px 0",
};

const securityTipTitle = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#92400e",
  margin: "0 0 8px",
};

const securityTipText = {
  fontSize: "14px",
  color: "#92400e",
  margin: "0",
  lineHeight: "22px",
};

const smallText = {
  fontSize: "13px",
  color: "#8898aa",
  margin: "24px 0 8px",
};

const linkText = {
  fontSize: "12px",
  color: "#f97316",
  wordBreak: "break-all" as const,
  margin: "0",
};

const otpContainer = {
  textAlign: "center" as const,
  margin: "24px 0",
  padding: "20px",
  backgroundColor: "#f8fafc",
  borderRadius: "8px",
  border: "1px dashed #e2e8f0",
};

const otpLabel = {
  fontSize: "14px",
  color: "#64748b",
  margin: "0 0 8px",
};

const otpCode = {
  fontSize: "32px",
  fontWeight: "700",
  color: "#1a1a1a",
  letterSpacing: "4px",
  margin: "0",
  fontFamily: "monospace",
};

export default PasswordResetEmail;
