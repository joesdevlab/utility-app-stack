import {
  Button,
  Heading,
  Text,
  Section,
  Hr,
} from "@react-email/components";
import * as React from "react";
import { BaseLayout } from "./base-layout";

interface WelcomeEmailProps {
  userName?: string;
  loginUrl?: string;
}

export function WelcomeEmail({
  userName,
  loginUrl = "https://apprenticelog.nz/app",
}: WelcomeEmailProps) {
  return (
    <BaseLayout preview="Welcome to Apprentice Log - Let's get started!">
      <Heading style={heading}>Welcome to Apprentice Log!</Heading>

      <Text style={paragraph}>
        Kia ora{userName ? ` ${userName}` : ""}!
      </Text>

      <Text style={paragraph}>
        Your email has been verified and your account is ready to go. You&apos;re
        now part of a growing community of Kiwi trade apprentices who are
        transforming how they track their hours and skills.
      </Text>

      <Section style={buttonContainer}>
        <Button style={button} href={loginUrl}>
          Start Logging Your Hours
        </Button>
      </Section>

      <Hr style={divider} />

      <Heading as="h2" style={subheading}>
        Quick Start Guide
      </Heading>

      <Section style={tipSection}>
        <Text style={tipNumber}>1</Text>
        <Text style={tipText}>
          <strong>Record your day</strong> - Tap the microphone and describe
          what you worked on today. Our AI will format it for you.
        </Text>
      </Section>

      <Section style={tipSection}>
        <Text style={tipNumber}>2</Text>
        <Text style={tipText}>
          <strong>Review & save</strong> - Check your entry looks good, then
          save it to your secure logbook.
        </Text>
      </Section>

      <Section style={tipSection}>
        <Text style={tipNumber}>3</Text>
        <Text style={tipText}>
          <strong>Track progress</strong> - Watch your hours add up and see your
          skills develop over time.
        </Text>
      </Section>

      <Hr style={divider} />

      <Section style={proTipSection}>
        <Text style={proTipTitle}>Pro Tip</Text>
        <Text style={proTipText}>
          Enable two-factor authentication (2FA) in your settings for extra
          security. Your logbook is important - keep it protected!
        </Text>
      </Section>

      <Text style={paragraph}>
        If you have any questions, our team is here to help. Just reply to this
        email or check out our FAQ.
      </Text>

      <Text style={signoff}>
        Good luck with your apprenticeship!
        <br />
        <strong>The Apprentice Log Team</strong>
      </Text>
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

const subheading = {
  fontSize: "18px",
  fontWeight: "600",
  color: "#1a1a1a",
  margin: "24px 0 16px",
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

const divider = {
  borderColor: "#e6ebf1",
  margin: "32px 0",
};

const tipSection = {
  display: "flex",
  alignItems: "flex-start",
  margin: "16px 0",
};

const tipNumber = {
  backgroundColor: "#f97316",
  color: "#ffffff",
  borderRadius: "50%",
  width: "28px",
  height: "28px",
  lineHeight: "28px",
  textAlign: "center" as const,
  fontSize: "14px",
  fontWeight: "600",
  margin: "0 12px 0 0",
  flexShrink: 0,
};

const tipText = {
  fontSize: "15px",
  lineHeight: "24px",
  color: "#404040",
  margin: "0",
  flex: 1,
};

const proTipSection = {
  backgroundColor: "#f0fdf4",
  borderRadius: "8px",
  padding: "16px",
  margin: "24px 0",
  borderLeft: "4px solid #22c55e",
};

const proTipTitle = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#166534",
  margin: "0 0 8px",
};

const proTipText = {
  fontSize: "14px",
  color: "#166534",
  margin: "0",
  lineHeight: "22px",
};

const signoff = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#404040",
  margin: "32px 0 0",
};

export default WelcomeEmail;
