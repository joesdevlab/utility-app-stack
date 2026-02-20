"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Mic, ArrowRight, CheckCircle, Clock, FileText,
  Shield, Building2, Truck, Users
} from "lucide-react";
import Link from "next/link";
import { MarketingHeader } from "@/components/landing/marketing-header";
import { TradeVideoHero } from "@/components/landing/trade-video-hero";

export default function ConstructionPage() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      {/* Video Hero */}
      <TradeVideoHero
        videoSrc="/videos/construction.mp4"
        fallbackImage="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1600&q=80"
        badgeIcon={Building2}
        badgeText="For Construction Apprentices"
        title="Construction Logbooks"
        highlight="Made Easy"
        description="Document your site work, concrete pours, and building activities. AI converts your voice notes into professional BCITO entries."
      />

      {/* Construction-specific benefits */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Built for Construction Sites
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From foundations to finishing, capture every aspect of your construction apprenticeship.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Building2,
                title: "Construction Vocab",
                description: "AI trained on NZ construction terminology — formwork, rebar, concrete specs, and site terms."
              },
              {
                icon: Truck,
                title: "Equipment Tracking",
                description: "Log machinery operated, plant equipment used, and heavy vehicle experience."
              },
              {
                icon: Users,
                title: "Team Documentation",
                description: "Record work with different crews, supervisors, and subcontractors."
              },
              {
                icon: FileText,
                title: "Project Categories",
                description: "Categorize work across residential, commercial, civil, and infrastructure projects."
              },
              {
                icon: Clock,
                title: "Shift Logging",
                description: "Handle varied shift patterns, overtime, and multi-site days easily."
              },
              {
                icon: Shield,
                title: "H&S Compliance",
                description: "Document toolbox talks, site inductions, and safety observations."
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
                Record On-Site, Format Automatically
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Capture your work at smoko or end of day. Perfect for busy construction sites.
              </p>

              <div className="bg-gray-100 rounded-xl p-6 mb-6">
                <p className="text-sm text-gray-500 mb-2">You say:</p>
                <p className="text-gray-900 italic">
                  &quot;Working on the commercial build in Albany today. Morning was spent helping
                  with the concrete pour for the ground floor slab — about 80 cubic metres of 30MPa.
                  Used the vibrator to consolidate the pour. After lunch, started setting up
                  formwork for the lift shaft with the crew. Full day, 9 hours with the early start.&quot;
                </p>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>AI formats this into a complete, BCITO-compliant entry</span>
              </div>
            </div>

            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80"
                alt="Construction workers"
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
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80"
            alt="Testimonial"
            className="w-20 h-20 rounded-full mx-auto mb-6 object-cover border-4 border-white shadow-lg"
          />
          <blockquote className="text-2xl text-gray-900 mb-6">
            &quot;Working on big sites with different crews every week made logging a nightmare.
            Now I just voice record at the end of each day and it&apos;s sorted.&quot;
          </blockquote>
          <div className="text-gray-600">
            <p className="font-semibold text-gray-900">Te Koha Rawiri</p>
            <p>4th Year Construction Apprentice, Hawkins Construction</p>
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
            Join hundreds of construction apprentices across New Zealand.
          </p>
          <Link href="/app">
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
              <Link href="/" className="hover:text-orange-600">Home</Link>
              <Link href="/privacy" className="hover:text-orange-600">Privacy</Link>
              <Link href="/terms" className="hover:text-orange-600">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
