"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  Heart,
  Target,
  Users,
  Sparkles,
  Shield,
  Clock,
  Mic,
  CheckCircle2,
} from "lucide-react";
import { MarketingHeader } from "@/components/landing/marketing-header";
import { FooterSection } from "@/components/landing/footer-section";

const values = [
  {
    icon: Heart,
    title: "Built for Apprentices",
    description:
      "We understand the daily grind of trade work. Every feature is designed to save you time and reduce paperwork stress.",
  },
  {
    icon: Target,
    title: "Focused on NZ",
    description:
      "Made specifically for New Zealand apprentices and BCITO requirements. We know the local industry inside out.",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description:
      "Your data belongs to you. We use enterprise-grade security and never sell your information to third parties.",
  },
  {
    icon: Sparkles,
    title: "Always Improving",
    description:
      "We listen to apprentice feedback and continuously update the app with new features and improvements.",
  },
];

const stats = [
  { value: "30s", label: "Average entry time" },
  { value: "100%", label: "Free for apprentices" },
  { value: "24/7", label: "Available anywhere" },
  { value: "NZ", label: "Made locally" },
];

const features = [
  "Voice-to-text transcription with AI",
  "Automatic BCITO formatting",
  "Offline recording support",
  "Secure cloud backup",
  "Export to PDF anytime",
  "Dark mode for site work",
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      {/* Hero Section */}
      <section className="relative py-20 sm:py-28 bg-gradient-to-b from-orange-50 to-white overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-100 rounded-full opacity-50 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-100 rounded-full opacity-50 blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 bg-orange-100 border border-orange-200 rounded-full px-4 py-2 mb-6">
              <Heart className="h-4 w-4 text-orange-600" />
              <span className="text-orange-700 text-sm font-semibold">Our Story</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Making Apprentice Life{" "}
              <span className="text-orange-500">Easier</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Apprentice Log was born from a simple frustration: spending hours on paperwork
              after a long day on site. We built the tool we wished existed when we were apprentices.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl sm:text-4xl font-bold text-orange-500 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 bg-orange-100 border border-orange-200 rounded-full px-3 py-1.5 mb-4">
                <Target className="h-4 w-4 text-orange-600" />
                <span className="text-orange-700 text-xs font-semibold">Our Mission</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Empowering NZ&apos;s Next Generation of Tradespeople
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                New Zealand&apos;s construction industry is facing a skills shortage. We believe
                that supporting apprentices through their training journey is crucial for the
                future of our trades.
              </p>
              <p className="text-gray-600 leading-relaxed mb-6">
                By eliminating the frustration of logbook paperwork, we help apprentices focus
                on what matters most: learning their trade and becoming qualified professionals.
              </p>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-full">
                  <span>🇳🇿</span>
                  <span>Made in New Zealand</span>
                </div>
                <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-full">
                  <Clock className="h-4 w-4" />
                  <span>Est. 2024</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-8 text-white shadow-xl shadow-orange-500/20">
                <Mic className="h-12 w-12 mb-6 opacity-90" />
                <h3 className="text-2xl font-bold mb-4">Voice-First Design</h3>
                <p className="text-orange-100 leading-relaxed mb-6">
                  We built Apprentice Log around voice recording because we know apprentices
                  are tired after a long day. Just speak naturally about your work, and our
                  AI handles the rest.
                </p>
                <ul className="space-y-3">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-orange-200 shrink-0" />
                      <span className="text-sm text-orange-50">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-orange-100 border border-orange-200 rounded-full px-3 py-1.5 mb-4">
              <Users className="h-4 w-4 text-orange-600" />
              <span className="text-orange-700 text-xs font-semibold">Our Values</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What Drives Us
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Every decision we make is guided by these core principles.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center mb-4">
                  <value.icon className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Ready to Simplify Your Logbook?
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of NZ apprentices who are saving time and staying on top of
              their training records.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/app">
                <Button className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-xl transition-all">
                  Get Started Free
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto px-8 py-6 text-lg font-semibold rounded-xl border-2"
                >
                  Contact Us
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
}
