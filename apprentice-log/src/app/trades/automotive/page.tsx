"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Mic, ArrowRight, CheckCircle, Clock, FileText,
  Shield, Car, Wrench, Settings
} from "lucide-react";
import Link from "next/link";
import { MarketingHeader } from "@/components/landing/marketing-header";

export default function AutomotivePage() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=1600&q=80"
            alt="Automotive work"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/80 to-gray-900/60" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-red-500/20 border border-red-500/30 rounded-full px-4 py-2 mb-6"
            >
              <Car className="h-4 w-4 text-red-400" />
              <span className="text-red-300 text-sm font-semibold">For Automotive Apprentices</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"
            >
              Turbocharge Your{" "}
              <span className="text-red-400">Logbook</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-300 mb-8"
            >
              Document your diagnostic, service, and repair work.
              AI converts your voice notes into MITO-compliant entries.
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

      {/* Automotive-specific benefits */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Built for Automotive Apprentices
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From servicing to diagnostics, capture every aspect of your automotive work.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Car,
                title: "Automotive Terminology",
                description: "AI trained on automotive vocab — engine codes, OBD diagnostics, torque specs, and part numbers."
              },
              {
                icon: Settings,
                title: "Service Categories",
                description: "Track work across servicing, repairs, diagnostics, WOF prep, and specialized systems."
              },
              {
                icon: Wrench,
                title: "Tool & Equipment",
                description: "Log diagnostic tools used, lifts operated, and specialist equipment experience."
              },
              {
                icon: FileText,
                title: "Vehicle Records",
                description: "Track makes, models, and systems worked on for comprehensive experience logging."
              },
              {
                icon: Clock,
                title: "Job Time Tracking",
                description: "Log flat-rate times versus actual times for accurate skill progression."
              },
              {
                icon: Shield,
                title: "Workshop Safety",
                description: "Document safe work practices, PPE usage, and hazardous material handling."
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
                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center mb-4">
                  <benefit.icon className="h-6 w-6 text-red-600" />
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
                Voice Record Your Workshop Jobs
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Describe your diagnostic and repair work naturally. AI understands automotive terminology.
              </p>

              <div className="bg-gray-100 rounded-xl p-6 mb-6">
                <p className="text-sm text-gray-500 mb-2">You say:</p>
                <p className="text-gray-900 italic">
                  &quot;2019 Mazda CX-5 came in for a full service today. Changed the oil and filter
                  using 5W-30 synthetic, replaced the air filter and cabin filter. Did a brake
                  inspection — fronts at 60%, rears at 70%. Customer also complained about a
                  rough idle so I ran a diagnostic — found a misfire on cylinder 2. Replaced
                  the spark plugs and coil pack, cleared the codes and test drove. About 4
                  hours on this one.&quot;
                </p>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>AI formats this into a complete, MITO-compliant entry</span>
              </div>
            </div>

            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800&q=80"
                alt="Mechanic at work"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-20 bg-red-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <img
            src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80"
            alt="Testimonial"
            className="w-20 h-20 rounded-full mx-auto mb-6 object-cover border-4 border-white shadow-lg"
          />
          <blockquote className="text-2xl text-gray-900 mb-6">
            &quot;Between customers and jobs, I never had time to write proper entries.
            Now I just talk about what I did while washing my hands and it&apos;s all logged.&quot;
          </blockquote>
          <div className="text-gray-600">
            <p className="font-semibold text-gray-900">Marcus Chen</p>
            <p>2nd Year Automotive Apprentice, Toyota NZ</p>
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
            Join automotive apprentices across New Zealand.
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
              <div className="w-6 h-6 rounded overflow-hidden">
                <img src="/Logo-v1-128-128.png" alt="Apprentice Log" className="w-full h-full object-cover" />
              </div>
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
