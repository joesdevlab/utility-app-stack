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
} from "@react-email/components";
import * as React from "react";

interface BaseLayoutProps {
  preview: string;
  children: React.ReactNode;
}

export function BaseLayout({ preview, children }: BaseLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header with Logo */}
          <Section style={header}>
            <Img
              src="https://apprentice-log.vercel.app/Logo-v1-128-128.png"
              width="48"
              height="48"
              alt="Apprentice Log"
              style={logo}
            />
            <Text style={brandName}>Apprentice Log</Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>{children}</Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Made with care in New Zealand for Kiwi trade apprentices
            </Text>
            <Text style={footerLinks}>
              <Link href="https://apprentice-log.vercel.app" style={link}>
                Website
              </Link>
              {" • "}
              <Link href="https://apprentice-log.vercel.app/privacy" style={link}>
                Privacy
              </Link>
              {" • "}
              <Link href="https://apprentice-log.vercel.app/terms" style={link}>
                Terms
              </Link>
            </Text>
            <Text style={footerCopyright}>
              © {new Date().getFullYear()} Apprentice Log. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  maxWidth: "600px",
};

const header = {
  padding: "32px 40px 24px",
  textAlign: "center" as const,
  borderBottom: "1px solid #e6ebf1",
};

const logo = {
  margin: "0 auto 12px",
  borderRadius: "12px",
};

const brandName = {
  fontSize: "24px",
  fontWeight: "700",
  color: "#1a1a1a",
  margin: "0",
};

const content = {
  padding: "32px 40px",
};

const footer = {
  padding: "24px 40px",
  backgroundColor: "#f6f9fc",
  borderTop: "1px solid #e6ebf1",
  textAlign: "center" as const,
};

const footerText = {
  fontSize: "13px",
  color: "#8898aa",
  margin: "0 0 8px",
};

const footerLinks = {
  fontSize: "13px",
  color: "#8898aa",
  margin: "0 0 8px",
};

const link = {
  color: "#f97316",
  textDecoration: "none",
};

const footerCopyright = {
  fontSize: "12px",
  color: "#adb5bd",
  margin: "0",
};
