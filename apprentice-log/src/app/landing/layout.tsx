import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Apprentice Log | Voice-to-Logbook for NZ Apprentices",
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
