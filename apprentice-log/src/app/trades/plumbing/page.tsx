"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Mic, ArrowRight, CheckCircle, HardHat, Clock, FileText,
  Shield, Droplets, Flame, Wrench
} from "lucide-react";
import Link from "next/link";

export default function PlumbingPage() {
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
            src="https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=1600&q=80"
            alt="Plumbing work"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/80 to-gray-900/60" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 rounded-full px-4 py-2 mb-6"
            >
              <Droplets className="h-4 w-4 text-blue-400" />
              <span className="text-blue-300 text-sm font-semibold">For Plumbing Apprentices</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"
            >
              Your Plumbing Logbook,{" "}
              <span className="text-blue-400">Flowing Smoothly</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-300 mb-8"
            >
              Document your pipework, installations, and maintenance work.
              AI converts your voice notes into PGDB-compliant entries.
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

      {/* Plumbing-specific benefits */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Built for Plumbing Apprentices
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From water supply to drainage, capture every aspect of your plumbing and gasfitting work.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Droplets,
                title: "Plumbing Terminology",
                description: "AI trained on NZ plumbing vocab — manifolds, PRVs, TMVs, pipe specs, and NZS standards."
              },
              {
                icon: Flame,
                title: "Gasfitting Logs",
                description: "Track gas appliance installations, pipework, and compliance testing separately."
              },
              {
                icon: Wrench,
                title: "Service & Maintenance",
                description: "Log repairs, unblocking, and maintenance work with detailed descriptions."
              },
              {
                icon: FileText,
                title: "Compliance Records",
                description: "Track work against Building Code G12/G13 and PGDB requirements."
              },
              {
                icon: Clock,
                title: "Hours by Category",
                description: "Split hours between sanitary, water supply, drainage, and gasfitting."
              },
              {
                icon: Shield,
                title: "Safety Documentation",
                description: "Document confined space entry, gas safety, and excavation work."
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
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                  <benefit.icon className="h-6 w-6 text-blue-600" />
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
                Voice Record Your Plumbing Work
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Describe your installations and repairs naturally. AI understands plumbing terminology.
              </p>

              <div className="bg-gray-100 rounded-xl p-6 mb-6">
                <p className="text-sm text-gray-500 mb-2">You say:</p>
                <p className="text-gray-900 italic">
                  &quot;New bathroom fit-out in Mt Eden today. Installed the water supply using
                  15mm copper to the vanity and 20mm to the shower mixer. Connected the waste
                  pipes with 40mm PVC for the basin and 50mm for the shower. Also fitted a
                  Rinnai infinity hot water unit with gas connection — did the pressure test
                  and got the CoC sorted. About 7 hours with travel.&quot;
                </p>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>AI formats this into a complete, PGDB-compliant entry</span>
              </div>
            </div>

            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800&q=80"
                alt="Plumber at work"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-20 bg-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <img
            src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80"
            alt="Testimonial"
            className="w-20 h-20 rounded-full mx-auto mb-6 object-cover border-4 border-white shadow-lg"
          />
          <blockquote className="text-2xl text-gray-900 mb-6">
            &quot;Juggling plumbing and gasfitting hours was a nightmare. Now the app
            automatically categorizes everything properly for my PGDB records.&quot;
          </blockquote>
          <div className="text-gray-600">
            <p className="font-semibold text-gray-900">Sophie Anderson</p>
            <p>3rd Year Plumbing & Gasfitting Apprentice</p>
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
            Join plumbing apprentices across New Zealand.
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
