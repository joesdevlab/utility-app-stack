import {
  Button,
  Heading,
  Text,
  Section,
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
  return (
    <BaseLayout preview="Verify your email address for Apprentice Log">
      <Heading style={heading}>Verify your email address</Heading>

      <Text style={paragraph}>
        Kia ora{userEmail ? ` ${userEmail.split("@")[0]}` : ""}!
      </Text>

      <Text style={paragraph}>
        Thanks for signing up for Apprentice Log. To get started recording your
        logbook entries, please verify your email address by clicking the button
        below.
      </Text>

      <Section style={buttonContainer}>
        <Button style={button} href={verificationUrl}>
          Verify Email Address
        </Button>
      </Section>

      {otp && (
        <Section style={otpContainer}>
          <Text style={otpLabel}>Or enter this code:</Text>
          <Text style={otpCode}>{otp}</Text>
        </Section>
      )}

      <Text style={paragraph}>
        This link will expire in 24 hours. If you didn&apos;t create an account
        with Apprentice Log, you can safely ignore this email.
      </Text>

      <Text style={smallText}>
        If the button doesn&apos;t work, copy and paste this link into your
        browser:
      </Text>
      <Text style={linkText}>{verificationUrl}</Text>
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

export default VerificationEmail;
