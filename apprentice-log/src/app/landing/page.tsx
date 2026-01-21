import { Metadata } from "next";
import {
  HeroSection,
  ProblemSection,
  FeaturesSection,
  TestimonialsSection,
  FAQSection,
  CTASection,
  FooterSection,
} from "@/components/landing";
import { NativeAppRedirect } from "@/components/native-app-redirect";

export const metadata: Metadata = {
  metadataBase: new URL("https://apprentice-log.vercel.app"),
  title: "Apprentice Log | Voice-to-Logbook for NZ Apprentices",
  description:
    "Stop wasting time on paperwork. Record your voice in 30 seconds and get a professional BCITO logbook entry. Free for all NZ apprentices.",
  keywords: [
    "apprentice logbook",
    "BCITO",
    "construction apprentice",
    "NZ apprentice",
    "voice recorder",
    "logbook app",
    "trade apprentice",
    "building apprentice",
    "carpentry apprentice",
  ],
  openGraph: {
    title: "Apprentice Log | Voice-to-Logbook for NZ Apprentices",
    description:
      "Stop wasting time on paperwork. Record your voice in 30 seconds and get a professional BCITO logbook entry.",
    url: "https://apprentice-log.vercel.app/landing",
    siteName: "Apprentice Log",
    images: [
      {
        url: "/store-assets/feature-graphic.png",
        width: 1024,
        height: 500,
        alt: "Apprentice Log - Voice-to-Logbook for NZ Apprentices",
      },
    ],
    locale: "en_NZ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Apprentice Log | Voice-to-Logbook for NZ Apprentices",
    description:
      "Stop wasting time on paperwork. Record your voice in 30 seconds and get a professional BCITO logbook entry.",
    images: ["/store-assets/feature-graphic.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function LandingPage() {
  return (
    <NativeAppRedirect>
      <main className="min-h-screen bg-slate-950">
        <HeroSection />
        <ProblemSection />
        <FeaturesSection />
        <TestimonialsSection />
        <FAQSection />
        <CTASection />
        <FooterSection />
      </main>
    </NativeAppRedirect>
  );
}
