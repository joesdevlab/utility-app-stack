import {
  Button,
  Heading,
  Text,
  Section,
  Img,
  Row,
  Column,
} from "@react-email/components";
import * as React from "react";
import { BaseLayout } from "./base-layout";

interface VerificationEmailProps {
  verificationUrl: string;
  userEmail?: string;
  otp?: string;
}

export function VerificationEmail({
  verificationUrl,
  userEmail,
  otp,
}: VerificationEmailProps) {
  const firstName = userEmail ? userEmail.split("@")[0] : "";

  return (
    <BaseLayout preview="Verify your email address for Apprentice Log">
      {/* Hero icon */}
      <Section style={heroSection}>
        <Row>
          <Column align="center">
            <div style={iconWrapper}>
              <Img
                src="https://apprenticelog.nz/email-assets/mail-check.png"
                width="48"
                height="48"
                alt="Verify email"
                style={heroIcon}
              />
            </div>
          </Column>
        </Row>
      </Section>

      <Heading style={heading}>Verify your email address</Heading>

      <Text style={paragraph}>
        Kia ora{firstName ? ` ${firstName}` : ""}!
      </Text>

      <Text style={paragraph}>
        Thanks for signing up for Apprentice Log. You&apos;re just one step away from
        recording your first logbook entry using voice-to-text technology.
      </Text>

      <Text style={paragraph}>
        Click the button below to verify your email address and get started:
      </Text>

      <Section style={buttonContainer}>
        <Button style={button} href={verificationUrl}>
          Verify My Email Address
        </Button>
      </Section>

      {otp && (
        <Section style={otpContainer}>
          <Text style={otpLabel}>Or enter this verification code manually:</Text>
          <Text style={otpCode}>{otp}</Text>
          <Text style={otpHint}>Enter this code in the app when prompted</Text>
        </Section>
      )}

      {/* Info box */}
      <Section style={infoBox}>
        <Row>
          <Column style={infoIconColumn}>
            <Text style={infoIcon}>&#128337;</Text>
          </Column>
          <Column>
            <Text style={infoText}>
              <strong>This link expires in 24 hours.</strong> If you don&apos;t verify
              within this time, you&apos;ll need to request a new verification email.
            </Text>
          </Column>
        </Row>
      </Section>

      <Text style={securityNote}>
        If you didn&apos;t create an account with Apprentice Log, you can safely ignore
        this email. No account will be created without verification.
      </Text>

      <Section style={linkSection}>
        <Text style={smallText}>
          Having trouble with the button? Copy and paste this link into your browser:
        </Text>
        <Text style={linkText}>{verificationUrl}</Text>
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
  infoBg: "#eff6ff",
  infoBorder: "#bfdbfe",
  infoText: "#1e40af",
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

const heroIcon = {
  marginTop: "16px",
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

const infoBox = {
  backgroundColor: colors.infoBg,
  borderRadius: "8px",
  padding: "16px",
  margin: "24px 0",
  borderLeft: `4px solid ${colors.infoBorder}`,
};

const infoIconColumn = {
  width: "40px",
  verticalAlign: "top" as const,
};

const infoIcon = {
  fontSize: "20px",
  margin: "0",
};

const infoText = {
  fontSize: "14px",
  color: colors.infoText,
  margin: "0",
  lineHeight: "22px",
};

const securityNote = {
  fontSize: "14px",
  color: colors.textMuted,
  margin: "24px 0",
  fontStyle: "italic" as const,
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

export default VerificationEmail;
