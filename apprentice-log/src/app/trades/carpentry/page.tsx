"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Mic, ArrowRight, CheckCircle, HardHat, Clock, FileText,
  Smartphone, Shield, Hammer, Ruler, Home
} from "lucide-react";
import Link from "next/link";

export default function CarpentryPage() {
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
            src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1600&q=80"
            alt="Carpentry work"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/80 to-gray-900/60" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 rounded-full px-4 py-2 mb-6"
            >
              <Hammer className="h-4 w-4 text-orange-400" />
              <span className="text-orange-300 text-sm font-semibold">For Carpentry Apprentices</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"
            >
              Your Carpentry Logbook,{" "}
              <span className="text-orange-400">Simplified</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-300 mb-8"
            >
              Voice-record your framing, roofing, and finishing work. AI converts it to
              BCITO-compliant entries that capture every skill and technique.
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

      {/* Carpentry-specific benefits */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Built for Carpentry Apprentices
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Capture your work from rough framing to final fit-out with terminology that matches your trade.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Hammer,
                title: "Carpentry Terminology",
                description: "AI trained on NZ carpentry vocabulary — joists, dwangs, nogs, sarking, and more."
              },
              {
                icon: Ruler,
                title: "Skills Tracking",
                description: "Track progress across framing, roofing, interior fit-out, and finishing competencies."
              },
              {
                icon: Home,
                title: "Site Documentation",
                description: "Log residential and commercial projects with proper BCITO categorization."
              },
              {
                icon: FileText,
                title: "Tool & Material Logs",
                description: "Automatically capture tools used, materials handled, and techniques applied."
              },
              {
                icon: Clock,
                title: "Hours by Category",
                description: "Break down hours by task type for accurate qualification progress tracking."
              },
              {
                icon: Shield,
                title: "Safety Records",
                description: "Document safety observations, PPE usage, and site hazard awareness."
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
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center mb-4">
                  <benefit.icon className="h-6 w-6 text-orange-600" />
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
                From Voice to Logbook in Seconds
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Just describe your day naturally. Our AI understands carpentry work and formats it perfectly.
              </p>

              <div className="bg-gray-100 rounded-xl p-6 mb-6">
                <p className="text-sm text-gray-500 mb-2">You say:</p>
                <p className="text-gray-900 italic">
                  &quot;Today I worked on the new residential build in Takapuna. Spent the morning installing
                  floor joists using 190x45 H1.2 treated timber. Used a nail gun and circular saw.
                  After smoko, helped with the wall framing, setting out the bottom plates and cutting studs.
                  About 8 hours total.&quot;
                </p>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>AI formats this into a complete, BCITO-compliant entry</span>
              </div>
            </div>

            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1590479773265-7464e5d48118?w=800&q=80"
                alt="Carpenter at work"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-20 bg-orange-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80"
            alt="Testimonial"
            className="w-20 h-20 rounded-full mx-auto mb-6 object-cover border-4 border-white shadow-lg"
          />
          <blockquote className="text-2xl text-gray-900 mb-6">
            &quot;I was 6 months behind on my logbook. With Apprentice Log, I caught up in two weeks.
            The AI actually understands what a dwang is!&quot;
          </blockquote>
          <div className="text-gray-600">
            <p className="font-semibold text-gray-900">James Thompson</p>
            <p>3rd Year Carpentry Apprentice, Fletcher Construction</p>
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
            Join hundreds of carpentry apprentices across New Zealand.
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
