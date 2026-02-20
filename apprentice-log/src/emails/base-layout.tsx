import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Row,
  Column,
  Hr,
} from "@react-email/components";
import * as React from "react";

interface BaseLayoutProps {
  preview: string;
  children: React.ReactNode;
}

export function BaseLayout({ preview, children }: BaseLayoutProps) {
  const currentYear = new Date().getFullYear();

  return (
    <Html>
      <Head>
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
      </Head>
      <Preview>{preview}</Preview>
      <Body style={main}>
        {/* Top accent bar */}
        <Section style={accentBar} />

        <Container style={container}>
          {/* Header with Logo */}
          <Section style={header}>
            <Row>
              <Column style={logoColumn}>
                <Img
                  src="https://apprenticelog.nz/Logo-v1-128-128.png"
                  width="56"
                  height="56"
                  alt="Apprentice Log"
                  style={logo}
                />
              </Column>
            </Row>
            <Text style={brandName}>Apprentice Log</Text>
            <Text style={tagline}>Voice-to-Logbook for NZ Trade Apprentices</Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>{children}</Section>

          {/* Footer */}
          <Section style={footer}>
            <Hr style={footerDivider} />

            {/* App download badges */}
            <Section style={appBadges}>
              <Text style={downloadText}>Get the app:</Text>
              <Row style={badgeRow}>
                <Column align="center">
                  <Link href="https://play.google.com/store/apps/details?id=nz.apprenticelog.app">
                    <Img
                      src="https://apprenticelog.nz/badges/google-play-badge.png"
                      width="135"
                      height="40"
                      alt="Get it on Google Play"
                      style={badge}
                    />
                  </Link>
                </Column>
              </Row>
            </Section>

            <Hr style={footerDivider} />

            {/* Social & Links */}
            <Text style={footerTagline}>
              Made with aroha in Aotearoa for Kiwi trade apprentices
            </Text>

            <Section style={footerLinksSection}>
              <Link href="https://apprenticelog.nz" style={footerLink}>
                Website
              </Link>
              <Text style={footerDot}> &bull; </Text>
              <Link href="https://apprenticelog.nz/privacy" style={footerLink}>
                Privacy Policy
              </Link>
              <Text style={footerDot}> &bull; </Text>
              <Link href="https://apprenticelog.nz/terms" style={footerLink}>
                Terms of Service
              </Link>
              <Text style={footerDot}> &bull; </Text>
              <Link href="https://apprenticelog.nz/contact" style={footerLink}>
                Contact Us
              </Link>
            </Section>

            {/* Company info */}
            <Text style={companyInfo}>
              Apprentice Log is a product of Laika Dynamics Ltd
            </Text>
            <Text style={footerCopyright}>
              &copy; {currentYear} Apprentice Log. All rights reserved.
            </Text>

            {/* Unsubscribe notice */}
            <Text style={unsubscribeText}>
              You&apos;re receiving this email because you have an Apprentice Log account.
              <br />
              <Link href="https://apprenticelog.nz/app/settings" style={unsubscribeLink}>
                Manage email preferences
              </Link>
            </Text>
          </Section>
        </Container>

        {/* Bottom spacing */}
        <Section style={bottomSpacer} />
      </Body>
    </Html>
  );
}

// Brand Colors
const colors = {
  primary: "#f97316", // Orange-500
  primaryDark: "#ea580c", // Orange-600
  text: "#1f2937", // Gray-800
  textMuted: "#6b7280", // Gray-500
  textLight: "#9ca3af", // Gray-400
  background: "#f3f4f6", // Gray-100
  white: "#ffffff",
  border: "#e5e7eb", // Gray-200
  success: "#22c55e",
  warning: "#f59e0b",
};

// Styles
const main = {
  backgroundColor: colors.background,
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const accentBar = {
  backgroundColor: colors.primary,
  height: "4px",
  width: "100%",
};

const container = {
  backgroundColor: colors.white,
  margin: "0 auto",
  maxWidth: "600px",
  borderRadius: "0 0 8px 8px",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
};

const header = {
  padding: "40px 40px 32px",
  textAlign: "center" as const,
  borderBottom: `1px solid ${colors.border}`,
};

const logoColumn = {
  textAlign: "center" as const,
};

const logo = {
  margin: "0 auto 16px",
  borderRadius: "16px",
  boxShadow: "0 4px 12px rgba(249, 115, 22, 0.25)",
};

const brandName = {
  fontSize: "28px",
  fontWeight: "700",
  color: colors.text,
  margin: "0 0 4px",
  letterSpacing: "-0.5px",
};

const tagline = {
  fontSize: "14px",
  color: colors.textMuted,
  margin: "0",
  fontWeight: "500",
};

const content = {
  padding: "40px",
};

const footer = {
  padding: "32px 40px 40px",
  backgroundColor: "#fafafa",
  borderTop: `1px solid ${colors.border}`,
  borderRadius: "0 0 8px 8px",
};

const footerDivider = {
  borderColor: colors.border,
  borderWidth: "1px",
  margin: "24px 0",
};

const appBadges = {
  textAlign: "center" as const,
  margin: "16px 0",
};

const downloadText = {
  fontSize: "13px",
  color: colors.textMuted,
  margin: "0 0 12px",
  textAlign: "center" as const,
};

const badgeRow = {
  margin: "0 auto",
};

const badge = {
  margin: "0 8px",
};

const footerTagline = {
  fontSize: "14px",
  color: colors.textMuted,
  margin: "0 0 16px",
  textAlign: "center" as const,
  fontStyle: "italic" as const,
};

const footerLinksSection = {
  textAlign: "center" as const,
  margin: "0 0 16px",
};

const footerLink = {
  color: colors.primary,
  textDecoration: "none",
  fontSize: "13px",
  fontWeight: "500",
};

const footerDot = {
  color: colors.textLight,
  fontSize: "13px",
  display: "inline" as const,
  margin: "0 4px",
};

const companyInfo = {
  fontSize: "12px",
  color: colors.textLight,
  margin: "0 0 4px",
  textAlign: "center" as const,
};

const footerCopyright = {
  fontSize: "12px",
  color: colors.textLight,
  margin: "0 0 16px",
  textAlign: "center" as const,
};

const unsubscribeText = {
  fontSize: "11px",
  color: colors.textLight,
  margin: "0",
  textAlign: "center" as const,
  lineHeight: "18px",
};

const unsubscribeLink = {
  color: colors.textMuted,
  textDecoration: "underline",
};

const bottomSpacer = {
  height: "32px",
};

export default BaseLayout;
