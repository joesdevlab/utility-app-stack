"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Mic, ArrowRight, CheckCircle, HardHat, Clock, FileText,
  Shield, Zap, Cable, Gauge
} from "lucide-react";
import Link from "next/link";

export default function ElectricalPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/landing" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                <HardHat className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900">Apprentice Log</span>
            </Link>
            <Link href="/">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1600&q=80"
            alt="Electrical work"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/80 to-gray-900/60" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-yellow-500/20 border border-yellow-500/30 rounded-full px-4 py-2 mb-6"
            >
              <Zap className="h-4 w-4 text-yellow-400" />
              <span className="text-yellow-300 text-sm font-semibold">For Electrical Apprentices</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"
            >
              Power Up Your{" "}
              <span className="text-yellow-400">Logbook</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-300 mb-8"
            >
              Document your wiring, installations, and testing work.
              AI converts your voice notes into EWRB-compliant entries.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <Link href="/">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white text-lg px-8 py-6 rounded-xl">
                  <Mic className="h-5 w-5 mr-2" />
                  Start Free Trial
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Electrical-specific benefits */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Built for Electrical Apprentices
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From domestic wiring to commercial installations, capture every aspect of your electrical work.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "Electrical Terminology",
                description: "AI trained on NZ electrical vocab — MCBs, RCDs, switchboards, cable specs, and AS/NZS standards."
              },
              {
                icon: Cable,
                title: "Installation Tracking",
                description: "Log domestic, commercial, and industrial installations with proper categorization."
              },
              {
                icon: Gauge,
                title: "Testing Records",
                description: "Document insulation resistance, earth continuity, and polarity testing work."
              },
              {
                icon: FileText,
                title: "Compliance Logging",
                description: "Track work against Wiring Rules and EWRB requirements automatically."
              },
              {
                icon: Clock,
                title: "Hours by Category",
                description: "Break down hours by installation type for accurate qualification tracking."
              },
              {
                icon: Shield,
                title: "Safety Documentation",
                description: "Record isolation procedures, LOTO, and electrical safety observations."
              }
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-orange-200 hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center mb-4">
                  <benefit.icon className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Example entry */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Voice Record Your Electrical Work
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Describe your installations and testing naturally. AI understands electrical terminology.
              </p>

              <div className="bg-gray-100 rounded-xl p-6 mb-6">
                <p className="text-sm text-gray-500 mb-2">You say:</p>
                <p className="text-gray-900 italic">
                  &quot;New house rough-in today in Henderson. Ran the submains from the meter box
                  to the switchboard using 16mm TPS. Installed the switchboard with 40A main switch
                  and 20A MCBs for the power circuits. Also ran cables for 15 power points and
                  8 lighting circuits. Used a megger to test insulation resistance — all good.
                  About 8 and a half hours.&quot;
                </p>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>AI formats this into a complete, EWRB-compliant entry</span>
              </div>
            </div>

            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80"
                alt="Electrician at work"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-20 bg-yellow-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <img
            src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80"
            alt="Testimonial"
            className="w-20 h-20 rounded-full mx-auto mb-6 object-cover border-4 border-white shadow-lg"
          />
          <blockquote className="text-2xl text-gray-900 mb-6">
            &quot;The app actually knows the difference between an MCB and an RCD.
            My entries are way more detailed now without spending extra time.&quot;
          </blockquote>
          <div className="text-gray-600">
            <p className="font-semibold text-gray-900">Daniel Foster</p>
            <p>2nd Year Electrical Apprentice, Spark Electrical Ltd</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            Ready to Simplify Your Logbook?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join electrical apprentices across New Zealand.
          </p>
          <Link href="/">
            <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white text-lg px-10 py-7 rounded-xl shadow-lg">
              <Mic className="h-5 w-5 mr-2" />
              Get Started Free
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-gray-500">
              <HardHat className="h-5 w-5 text-orange-500" />
              <span>Apprentice Log — Made in New Zealand</span>
            </div>
            <div className="flex gap-6 text-sm text-gray-500">
              <Link href="/landing" className="hover:text-orange-600">Home</Link>
              <Link href="/privacy" className="hover:text-orange-600">Privacy</Link>
              <Link href="/terms" className="hover:text-orange-600">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
