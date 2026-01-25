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

interface EmployerInvitationEmailProps {
  inviteUrl: string;
  employerName: string;
  apprenticeEmail?: string;
  message?: string;
}

export function EmployerInvitationEmail({
  inviteUrl,
  employerName,
  apprenticeEmail,
  message,
}: EmployerInvitationEmailProps) {
  const firstName = apprenticeEmail ? apprenticeEmail.split("@")[0] : "";

  return (
    <BaseLayout preview={`${employerName} has invited you to join their team on Apprentice Log`}>
      {/* Hero icon */}
      <Section style={heroSection}>
        <Row>
          <Column align="center">
            <div style={iconWrapper}>
              <Text style={handshakeIcon}>&#129309;</Text>
            </div>
          </Column>
        </Row>
      </Section>

      <Heading style={heading}>You&apos;ve been invited!</Heading>

      <Text style={paragraph}>
        Kia ora{firstName ? ` ${firstName}` : ""}!
      </Text>

      <Text style={paragraph}>
        <strong>{employerName}</strong> has invited you to join their team on
        Apprentice Log. This will allow them to track your progress, view your
        logbook entries, and support your apprenticeship journey.
      </Text>

      {message && (
        <Section style={messageBox}>
          <Text style={messageLabel}>Message from {employerName}:</Text>
          <Text style={messageText}>&ldquo;{message}&rdquo;</Text>
        </Section>
      )}

      <Section style={buttonContainer}>
        <Button style={button} href={inviteUrl}>
          Accept Invitation
        </Button>
      </Section>

      {/* What happens next */}
      <Section style={infoBox}>
        <Text style={infoTitle}>&#128221; What happens when you accept?</Text>
        <Section style={infoItem}>
          <Row>
            <Column style={checkColumn}>
              <Text style={checkMark}>&#10003;</Text>
            </Column>
            <Column>
              <Text style={infoText}>
                Your employer can view your logbook entries and progress
              </Text>
            </Column>
          </Row>
        </Section>
        <Section style={infoItem}>
          <Row>
            <Column style={checkColumn}>
              <Text style={checkMark}>&#10003;</Text>
            </Column>
            <Column>
              <Text style={infoText}>
                They can add notes and feedback to your entries
              </Text>
            </Column>
          </Row>
        </Section>
        <Section style={infoItem}>
          <Row>
            <Column style={checkColumn}>
              <Text style={checkMark}>&#10003;</Text>
            </Column>
            <Column>
              <Text style={infoText}>
                You&apos;ll stay connected throughout your apprenticeship
              </Text>
            </Column>
          </Row>
        </Section>
      </Section>

      {/* Privacy note */}
      <Section style={privacyBox}>
        <Row>
          <Column style={privacyIconColumn}>
            <Text style={privacyIcon}>&#128274;</Text>
          </Column>
          <Column>
            <Text style={privacyText}>
              <strong>Your privacy matters.</strong> You control what&apos;s shared.
              Personal notes and private entries remain visible only to you.
            </Text>
          </Column>
        </Row>
      </Section>

      <Text style={paragraph}>
        If you weren&apos;t expecting this invitation or have concerns, you can simply
        ignore this email. The invitation will expire in 7 days.
      </Text>

      <Section style={linkSection}>
        <Text style={smallText}>
          Having trouble with the button? Copy and paste this link into your browser:
        </Text>
        <Text style={linkText}>{inviteUrl}</Text>
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
  infoBg: "#f8fafc",
  infoBorder: "#e2e8f0",
  successText: "#166534",
  privacyBg: "#fefce8",
  privacyBorder: "#fde047",
  privacyText: "#854d0e",
  messageBg: "#f0f9ff",
  messageBorder: "#7dd3fc",
  messageText: "#0c4a6e",
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

const handshakeIcon = {
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

const messageBox = {
  backgroundColor: colors.messageBg,
  borderRadius: "12px",
  padding: "20px",
  margin: "24px 0",
  borderLeft: `4px solid ${colors.messageBorder}`,
};

const messageLabel = {
  fontSize: "13px",
  fontWeight: "600",
  color: colors.messageText,
  margin: "0 0 8px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
};

const messageText = {
  fontSize: "16px",
  color: colors.messageText,
  margin: "0",
  lineHeight: "26px",
  fontStyle: "italic" as const,
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

const infoBox = {
  backgroundColor: colors.infoBg,
  borderRadius: "12px",
  padding: "24px",
  margin: "24px 0",
  border: `1px solid ${colors.infoBorder}`,
};

const infoTitle = {
  fontSize: "16px",
  fontWeight: "600",
  color: colors.text,
  margin: "0 0 16px",
};

const infoItem = {
  margin: "12px 0",
};

const checkColumn = {
  width: "28px",
  verticalAlign: "top" as const,
};

const checkMark = {
  color: colors.successText,
  fontSize: "16px",
  fontWeight: "700",
  margin: "0",
};

const infoText = {
  fontSize: "14px",
  color: colors.text,
  margin: "0",
  lineHeight: "22px",
};

const privacyBox = {
  backgroundColor: colors.privacyBg,
  borderRadius: "8px",
  padding: "16px",
  margin: "24px 0",
  borderLeft: `4px solid ${colors.privacyBorder}`,
};

const privacyIconColumn = {
  width: "40px",
  verticalAlign: "top" as const,
};

const privacyIcon = {
  fontSize: "20px",
  margin: "0",
};

const privacyText = {
  fontSize: "14px",
  color: colors.privacyText,
  margin: "0",
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

export default EmployerInvitationEmail;
