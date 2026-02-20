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
      {/* Hero icon */}
      <Section style={heroSection}>
        <Row>
          <Column align="center">
            <div style={iconWrapper}>
              <Img
                src="https://apprenticelog.nz/email-assets/party-popper.png"
                width="48"
                height="48"
                alt="Welcome"
                style={heroIcon}
              />
            </div>
          </Column>
        </Row>
      </Section>

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

      {/* Quick Start Guide */}
      <Section style={quickStartBox}>
        <Text style={quickStartTitle}>&#128640; Quick Start Guide</Text>

        <Section style={stepSection}>
          <Row>
            <Column style={stepNumberColumn}>
              <Text style={stepNumber}>1</Text>
            </Column>
            <Column>
              <Text style={stepText}>
                <strong>Record your day</strong> - Tap the microphone and describe
                what you worked on today. Our AI will format it for you.
              </Text>
            </Column>
          </Row>
        </Section>

        <Section style={stepSection}>
          <Row>
            <Column style={stepNumberColumn}>
              <Text style={stepNumber}>2</Text>
            </Column>
            <Column>
              <Text style={stepText}>
                <strong>Review & save</strong> - Check your entry looks good, then
                save it to your secure logbook.
              </Text>
            </Column>
          </Row>
        </Section>

        <Section style={stepSection}>
          <Row>
            <Column style={stepNumberColumn}>
              <Text style={stepNumber}>3</Text>
            </Column>
            <Column>
              <Text style={stepText}>
                <strong>Track progress</strong> - Watch your hours add up and see your
                skills develop over time.
              </Text>
            </Column>
          </Row>
        </Section>
      </Section>

      {/* Pro Tip */}
      <Section style={proTipBox}>
        <Row>
          <Column style={proTipIconColumn}>
            <Text style={proTipIcon}>&#128161;</Text>
          </Column>
          <Column>
            <Text style={proTipTitle}>Pro Tip</Text>
            <Text style={proTipText}>
              Enable two-factor authentication (2FA) in your settings for extra
              security. Your logbook is important - keep it protected!
            </Text>
          </Column>
        </Row>
      </Section>

      {/* What's included */}
      <Section style={featuresBox}>
        <Text style={featuresTitle}>What you can do with Apprentice Log:</Text>
        <Row>
          <Column style={featureColumn}>
            <Text style={featureItem}>&#127908; Voice-to-text logging</Text>
          </Column>
        </Row>
        <Row>
          <Column style={featureColumn}>
            <Text style={featureItem}>&#128202; Progress tracking</Text>
          </Column>
        </Row>
        <Row>
          <Column style={featureColumn}>
            <Text style={featureItem}>&#128274; Secure cloud storage</Text>
          </Column>
        </Row>
        <Row>
          <Column style={featureColumn}>
            <Text style={featureItem}>&#128241; Works offline too</Text>
          </Column>
        </Row>
      </Section>

      <Text style={paragraph}>
        If you have any questions, our team is here to help. Just reply to this
        email or check out our FAQ on the website.
      </Text>

      <Text style={signoff}>
        Good luck with your apprenticeship!
        <br />
        <strong>The Apprentice Log Team</strong>
      </Text>
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
  successBg: "#f0fdf4",
  successBorder: "#86efac",
  successText: "#166534",
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

const quickStartBox = {
  backgroundColor: "#f8fafc",
  borderRadius: "12px",
  padding: "24px",
  margin: "32px 0",
  border: `1px solid ${colors.border}`,
};

const quickStartTitle = {
  fontSize: "18px",
  fontWeight: "700",
  color: colors.text,
  margin: "0 0 20px",
  textAlign: "center" as const,
};

const stepSection = {
  margin: "16px 0",
};

const stepNumberColumn = {
  width: "40px",
  verticalAlign: "top" as const,
};

const stepNumber = {
  backgroundColor: colors.primary,
  color: "#ffffff",
  borderRadius: "50%",
  width: "28px",
  height: "28px",
  lineHeight: "28px",
  textAlign: "center" as const,
  fontSize: "14px",
  fontWeight: "600",
  margin: "0",
  display: "inline-block",
};

const stepText = {
  fontSize: "15px",
  lineHeight: "24px",
  color: colors.text,
  margin: "0",
};

const proTipBox = {
  backgroundColor: colors.successBg,
  borderRadius: "8px",
  padding: "16px",
  margin: "24px 0",
  borderLeft: `4px solid ${colors.successBorder}`,
};

const proTipIconColumn = {
  width: "40px",
  verticalAlign: "top" as const,
};

const proTipIcon = {
  fontSize: "24px",
  margin: "0",
};

const proTipTitle = {
  fontSize: "14px",
  fontWeight: "600",
  color: colors.successText,
  margin: "0 0 6px",
};

const proTipText = {
  fontSize: "14px",
  color: colors.successText,
  margin: "0",
  lineHeight: "22px",
};

const featuresBox = {
  backgroundColor: colors.infoBg,
  borderRadius: "8px",
  padding: "20px",
  margin: "24px 0",
  borderLeft: `4px solid ${colors.infoBorder}`,
};

const featuresTitle = {
  fontSize: "14px",
  fontWeight: "600",
  color: colors.infoText,
  margin: "0 0 12px",
};

const featureColumn = {
  paddingLeft: "8px",
};

const featureItem = {
  fontSize: "14px",
  color: colors.infoText,
  margin: "0 0 8px",
  lineHeight: "22px",
};

const signoff = {
  fontSize: "16px",
  lineHeight: "28px",
  color: colors.text,
  margin: "32px 0 0",
  paddingTop: "24px",
  borderTop: `1px solid ${colors.border}`,
};

export default WelcomeEmail;
