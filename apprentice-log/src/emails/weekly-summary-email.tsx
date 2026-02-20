import {
  Button,
  Heading,
  Text,
  Section,
  Row,
  Column,
  Hr,
} from "@react-email/components";
import * as React from "react";
import { BaseLayout } from "./base-layout";

interface WeeklyStats {
  totalHours: number;
  entriesCount: number;
  streak: number;
  topSkill?: string;
}

interface WeeklySummaryEmailProps {
  userName?: string;
  weekStartDate: string;
  weekEndDate: string;
  stats: WeeklyStats;
  dashboardUrl?: string;
}

export function WeeklySummaryEmail({
  userName,
  weekStartDate,
  weekEndDate,
  stats,
  dashboardUrl = "https://apprenticelog.nz/app",
}: WeeklySummaryEmailProps) {
  const hasActivity = stats.totalHours > 0 || stats.entriesCount > 0;

  return (
    <BaseLayout preview={`Your weekly summary: ${stats.totalHours} hours logged this week`}>
      {/* Hero icon */}
      <Section style={heroSection}>
        <Row>
          <Column align="center">
            <div style={iconWrapper}>
              <Text style={chartIcon}>&#128200;</Text>
            </div>
          </Column>
        </Row>
      </Section>

      <Heading style={heading}>Your Weekly Summary</Heading>

      <Text style={dateRange}>
        {weekStartDate} - {weekEndDate}
      </Text>

      <Text style={paragraph}>
        Kia ora{userName ? ` ${userName}` : ""}! Here&apos;s how your week went.
      </Text>

      {hasActivity ? (
        <>
          {/* Stats Grid */}
          <Section style={statsGrid}>
            <Row>
              <Column style={statBox}>
                <Text style={statNumber}>{stats.totalHours}</Text>
                <Text style={statLabel}>Hours Logged</Text>
              </Column>
              <Column style={statBox}>
                <Text style={statNumber}>{stats.entriesCount}</Text>
                <Text style={statLabel}>Entries Made</Text>
              </Column>
            </Row>
            <Row>
              <Column style={statBox}>
                <Text style={statNumber}>{stats.streak}</Text>
                <Text style={statLabel}>Day Streak &#128293;</Text>
              </Column>
              {stats.topSkill && (
                <Column style={statBox}>
                  <Text style={statSkill}>{stats.topSkill}</Text>
                  <Text style={statLabel}>Top Skill</Text>
                </Column>
              )}
            </Row>
          </Section>

          {/* Encouragement based on performance */}
          <Section style={encouragementBox}>
            <Text style={encouragementText}>
              {stats.totalHours >= 40 ? (
                <>&#127942; <strong>Outstanding week!</strong> You&apos;ve logged a full work week of hours. Keep up the amazing progress!</>
              ) : stats.totalHours >= 20 ? (
                <>&#11088; <strong>Great progress!</strong> You&apos;re building strong habits. Every entry counts towards your qualification.</>
              ) : stats.entriesCount > 0 ? (
                <>&#128170; <strong>Nice work!</strong> Consistency is key. Try to log your hours daily for the best results.</>
              ) : (
                <>&#128075; Don&apos;t forget to log your hours! Regular entries help track your progress accurately.</>
              )}
            </Text>
          </Section>
        </>
      ) : (
        /* No activity message */
        <Section style={noActivityBox}>
          <Text style={noActivityIcon}>&#128564;</Text>
          <Text style={noActivityTitle}>No entries this week</Text>
          <Text style={noActivityText}>
            It looks like you didn&apos;t log any hours this week. Don&apos;t worry -
            it happens! Jump back in and record what you&apos;ve been working on.
          </Text>
        </Section>
      )}

      <Section style={buttonContainer}>
        <Button style={button} href={dashboardUrl}>
          View Full Dashboard
        </Button>
      </Section>

      <Hr style={divider} />

      {/* Tips section */}
      <Section style={tipsSection}>
        <Text style={tipsTitle}>&#128161; Quick Tips</Text>
        <Text style={tipItem}>
          <strong>Log daily:</strong> Spend 2 minutes at the end of each day recording what you did.
        </Text>
        <Text style={tipItem}>
          <strong>Be specific:</strong> Include tasks, tools used, and skills practiced.
        </Text>
        <Text style={tipItem}>
          <strong>Review weekly:</strong> Check your entries match your actual work.
        </Text>
      </Section>

      <Text style={footerText}>
        You&apos;re receiving this because you have weekly summaries enabled.
        <br />
        Manage your email preferences in the app settings.
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
  statBg: "#f8fafc",
  encouragementBg: "#f0fdf4",
  encouragementBorder: "#86efac",
  encouragementText: "#166534",
  noActivityBg: "#fef3c7",
  noActivityBorder: "#fbbf24",
  noActivityText: "#92400e",
  tipsBg: "#eff6ff",
  tipsBorder: "#bfdbfe",
  tipsText: "#1e40af",
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

const chartIcon = {
  fontSize: "36px",
  margin: "0",
  lineHeight: "80px",
};

const heading = {
  fontSize: "28px",
  fontWeight: "700",
  color: colors.text,
  margin: "0 0 8px",
  textAlign: "center" as const,
  letterSpacing: "-0.5px",
};

const dateRange = {
  fontSize: "14px",
  color: colors.textMuted,
  margin: "0 0 24px",
  textAlign: "center" as const,
  fontWeight: "500",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "28px",
  color: colors.text,
  margin: "0 0 24px",
};

const statsGrid = {
  margin: "24px 0",
};

const statBox = {
  backgroundColor: colors.statBg,
  borderRadius: "12px",
  padding: "20px",
  textAlign: "center" as const,
  margin: "8px",
  border: `1px solid ${colors.border}`,
};

const statNumber = {
  fontSize: "36px",
  fontWeight: "700",
  color: colors.primary,
  margin: "0 0 4px",
  lineHeight: "1",
};

const statSkill = {
  fontSize: "18px",
  fontWeight: "700",
  color: colors.primary,
  margin: "0 0 4px",
  lineHeight: "1.2",
};

const statLabel = {
  fontSize: "13px",
  color: colors.textMuted,
  margin: "0",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  fontWeight: "500",
};

const encouragementBox = {
  backgroundColor: colors.encouragementBg,
  borderRadius: "8px",
  padding: "16px",
  margin: "24px 0",
  borderLeft: `4px solid ${colors.encouragementBorder}`,
};

const encouragementText = {
  fontSize: "15px",
  color: colors.encouragementText,
  margin: "0",
  lineHeight: "24px",
};

const noActivityBox = {
  backgroundColor: colors.noActivityBg,
  borderRadius: "12px",
  padding: "32px",
  margin: "24px 0",
  textAlign: "center" as const,
  borderLeft: `4px solid ${colors.noActivityBorder}`,
};

const noActivityIcon = {
  fontSize: "48px",
  margin: "0 0 16px",
};

const noActivityTitle = {
  fontSize: "18px",
  fontWeight: "600",
  color: colors.noActivityText,
  margin: "0 0 8px",
};

const noActivityText = {
  fontSize: "14px",
  color: colors.noActivityText,
  margin: "0",
  lineHeight: "22px",
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

const divider = {
  borderColor: colors.border,
  borderWidth: "1px",
  margin: "32px 0",
};

const tipsSection = {
  backgroundColor: colors.tipsBg,
  borderRadius: "8px",
  padding: "20px",
  margin: "24px 0",
  borderLeft: `4px solid ${colors.tipsBorder}`,
};

const tipsTitle = {
  fontSize: "16px",
  fontWeight: "600",
  color: colors.tipsText,
  margin: "0 0 12px",
};

const tipItem = {
  fontSize: "14px",
  color: colors.tipsText,
  margin: "0 0 8px",
  lineHeight: "22px",
};

const footerText = {
  fontSize: "13px",
  color: colors.textLight,
  margin: "24px 0 0",
  textAlign: "center" as const,
  lineHeight: "20px",
};

export default WeeklySummaryEmail;
