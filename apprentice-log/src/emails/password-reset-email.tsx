import {
  Button,
  Heading,
  Text,
  Section,
  Row,
  Column,
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
  const firstName = userEmail ? userEmail.split("@")[0] : "";

  return (
    <BaseLayout preview="Reset your Apprentice Log password">
      {/* Hero icon */}
      <Section style={heroSection}>
        <Row>
          <Column align="center">
            <div style={iconWrapper}>
              <Text style={lockIcon}>&#128274;</Text>
            </div>
          </Column>
        </Row>
      </Section>

      <Heading style={heading}>Reset your password</Heading>

      <Text style={paragraph}>
        Kia ora{firstName ? ` ${firstName}` : ""}!
      </Text>

      <Text style={paragraph}>
        We received a request to reset the password for your Apprentice Log account
        associated with <strong>{userEmail || "this email"}</strong>.
      </Text>

      <Text style={paragraph}>
        Click the button below to create a new password:
      </Text>

      <Section style={buttonContainer}>
        <Button style={button} href={resetUrl}>
          Reset My Password
        </Button>
      </Section>

      {otp && (
        <Section style={otpContainer}>
          <Text style={otpLabel}>Or enter this reset code manually:</Text>
          <Text style={otpCode}>{otp}</Text>
          <Text style={otpHint}>Enter this code in the app when prompted</Text>
        </Section>
      )}

      {/* Time warning */}
      <Section style={warningBox}>
        <Row>
          <Column style={warningIconColumn}>
            <Text style={warningIcon}>&#9202;</Text>
          </Column>
          <Column>
            <Text style={warningText}>
              <strong>This link expires in 1 hour.</strong> After that, you&apos;ll need
              to request a new password reset link.
            </Text>
          </Column>
        </Row>
      </Section>

      {/* Security warning */}
      <Section style={securityBox}>
        <Text style={securityTitle}>&#128737; Didn&apos;t request this?</Text>
        <Text style={securityText}>
          If you didn&apos;t request a password reset, someone may have entered your email
          address by mistake. You can safely ignore this email and your password will
          remain unchanged.
        </Text>
        <Text style={securityText}>
          For extra security, we recommend enabling two-factor authentication (2FA)
          in your account settings.
        </Text>
      </Section>

      <Section style={linkSection}>
        <Text style={smallText}>
          Having trouble with the button? Copy and paste this link into your browser:
        </Text>
        <Text style={linkText}>{resetUrl}</Text>
      </Section>
    </BaseLayout>
  );
}

// Brand Colors
const colors = {
  primary: "#f97316",
  primaryLight: "#fff7ed",
  text: "#1f2937",
  textMuted: "#6b7280",
  textLight: "#9ca3af",
  border: "#e5e7eb",
  warningBg: "#fef3c7",
  warningBorder: "#fbbf24",
  warningText: "#92400e",
  securityBg: "#fef2f2",
  securityBorder: "#fecaca",
  securityText: "#991b1b",
};

// Styles
const heroSection = {
  textAlign: "center" as const,
  marginBottom: "24px",
};

const iconWrapper = {
  backgroundColor: colors.primaryLight,
  borderRadius: "50%",
  width: "80px",
  height: "80px",
  display: "inline-block",
  lineHeight: "80px",
  textAlign: "center" as const,
};

const lockIcon = {
  fontSize: "36px",
  margin: "0",
  lineHeight: "80px",
};

const heading = {
  fontSize: "28px",
  fontWeight: "700",
  color: colors.text,
  margin: "0 0 24px",
  textAlign: "center" as const,
  letterSpacing: "-0.5px",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "28px",
  color: colors.text,
  margin: "0 0 16px",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: colors.primary,
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "16px 40px",
  boxShadow: "0 4px 12px rgba(249, 115, 22, 0.3)",
};

const otpContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
  padding: "24px",
  backgroundColor: "#f8fafc",
  borderRadius: "12px",
  border: "2px dashed #e2e8f0",
};

const otpLabel = {
  fontSize: "14px",
  color: colors.textMuted,
  margin: "0 0 12px",
  fontWeight: "500",
};

const otpCode = {
  fontSize: "36px",
  fontWeight: "700",
  color: colors.text,
  letterSpacing: "8px",
  margin: "0 0 8px",
  fontFamily: "'Courier New', monospace",
};

const otpHint = {
  fontSize: "12px",
  color: colors.textLight,
  margin: "0",
};

const warningBox = {
  backgroundColor: colors.warningBg,
  borderRadius: "8px",
  padding: "16px",
  margin: "24px 0",
  borderLeft: `4px solid ${colors.warningBorder}`,
};

const warningIconColumn = {
  width: "40px",
  verticalAlign: "top" as const,
};

const warningIcon = {
  fontSize: "20px",
  margin: "0",
};

const warningText = {
  fontSize: "14px",
  color: colors.warningText,
  margin: "0",
  lineHeight: "22px",
};

const securityBox = {
  backgroundColor: colors.securityBg,
  borderRadius: "8px",
  padding: "20px",
  margin: "24px 0",
  borderLeft: `4px solid ${colors.securityBorder}`,
};

const securityTitle = {
  fontSize: "15px",
  fontWeight: "600",
  color: colors.securityText,
  margin: "0 0 12px",
};

const securityText = {
  fontSize: "14px",
  color: colors.securityText,
  margin: "0 0 8px",
  lineHeight: "22px",
};

const linkSection = {
  marginTop: "32px",
  paddingTop: "24px",
  borderTop: `1px solid ${colors.border}`,
};

const smallText = {
  fontSize: "13px",
  color: colors.textLight,
  margin: "0 0 8px",
};

const linkText = {
  fontSize: "12px",
  color: colors.primary,
  wordBreak: "break-all" as const,
  margin: "0",
  backgroundColor: "#f8fafc",
  padding: "12px",
  borderRadius: "6px",
  display: "block",
};

export default PasswordResetEmail;
