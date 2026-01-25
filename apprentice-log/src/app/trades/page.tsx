"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Mic, ArrowRight, Hammer, Zap, Droplets, Building2, Car,
  Clock, FileText, Shield, CheckCircle
} from "lucide-react";
import Link from "next/link";
import { MarketingHeader } from "@/components/landing/marketing-header";

const trades = [
  {
    slug: "carpentry",
    title: "Carpentry",
    icon: Hammer,
    color: "orange",
    bgColor: "bg-orange-100",
    textColor: "text-orange-600",
    borderHover: "hover:border-orange-300",
    description: "Framing, roofing, and finishing work",
    compliance: "BCITO",
    videoSrc: "/videos/carpentry.mp4",
    fallbackImage: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80",
  },
  {
    slug: "electrical",
    title: "Electrical",
    icon: Zap,
    color: "yellow",
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-600",
    borderHover: "hover:border-yellow-300",
    description: "Wiring, installations, and testing",
    compliance: "EWRB",
    videoSrc: "/videos/electrical.mp4",
    fallbackImage: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&q=80",
  },
  {
    slug: "plumbing",
    title: "Plumbing & Gas",
    icon: Droplets,
    color: "blue",
    bgColor: "bg-blue-100",
    textColor: "text-blue-600",
    borderHover: "hover:border-blue-300",
    description: "Pipework, installations, and gasfitting",
    compliance: "PGDB",
    videoSrc: "/videos/plumbing.mp4",
    fallbackImage: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600&q=80",
  },
  {
    slug: "construction",
    title: "Construction",
    icon: Building2,
    color: "orange",
    bgColor: "bg-orange-100",
    textColor: "text-orange-600",
    borderHover: "hover:border-orange-300",
    description: "Site work, concrete, and building",
    compliance: "BCITO",
    videoSrc: "/videos/construction.mp4",
    fallbackImage: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&q=80",
  },
  {
    slug: "automotive",
    title: "Automotive",
    icon: Car,
    color: "red",
    bgColor: "bg-red-100",
    textColor: "text-red-600",
    borderHover: "hover:border-red-300",
    description: "Diagnostics, servicing, and repairs",
    compliance: "MITO",
    videoSrc: "/videos/automotive.mp4",
    fallbackImage: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&q=80",
  },
];

export default function TradesPage() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-blue-50" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-30 translate-y-1/2 -translate-x-1/2" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-700 text-sm font-medium mb-6">
              <Mic className="h-4 w-4" />
              Voice-Powered Logbooks for Every Trade
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Choose Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">
                Trade
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Apprentice Log is built specifically for NZ trade apprentices.
              Select your trade to see how we help you stay compliant.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Trade Cards Grid */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {trades.map((trade, index) => (
              <motion.div
                key={trade.slug}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Link href={`/trades/${trade.slug}`}>
                  <div className={`group relative bg-white rounded-2xl border-2 border-gray-100 ${trade.borderHover} overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}>
                    {/* Video/Image Preview */}
                    <div className="relative h-48 overflow-hidden">
                      <video
                        src={trade.videoSrc}
                        poster={trade.fallbackImage}
                        muted
                        loop
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onMouseEnter={(e) => e.currentTarget.play()}
                        onMouseLeave={(e) => {
                          e.currentTarget.pause();
                          e.currentTarget.currentTime = 0;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                      {/* Trade Icon Badge */}
                      <div className={`absolute top-4 left-4 w-12 h-12 rounded-xl ${trade.bgColor} flex items-center justify-center shadow-lg`}>
                        <trade.icon className={`h-6 w-6 ${trade.textColor}`} />
                      </div>

                      {/* Compliance Badge */}
                      <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs font-semibold text-gray-700">
                        {trade.compliance} Compliant
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                        {trade.title}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {trade.description}
                      </p>

                      <div className="flex items-center text-orange-500 font-medium text-sm">
                        Learn More
                        <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Works for Every Trade
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              No matter your trade, Apprentice Log understands your terminology and compliance requirements.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Mic,
                title: "Voice Recording",
                description: "Just talk about your day — AI does the rest",
              },
              {
                icon: FileText,
                title: "Auto-Formatting",
                description: "Entries formatted to your ITO's standards",
              },
              {
                icon: Clock,
                title: "Hours Tracking",
                description: "Automatic categorization by task type",
              },
              {
                icon: Shield,
                title: "Safety Logging",
                description: "Document H&S observations and PPE usage",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 border border-gray-200"
              >
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center mb-4">
                  <feature.icon className="h-5 w-5 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported ITOs */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Compliant with NZ Industry Training
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our AI is trained on the requirements for all major NZ trade qualifications.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {[
              { name: "BCITO", full: "Building & Construction ITO" },
              { name: "EWRB", full: "Electrical Workers Registration Board" },
              { name: "PGDB", full: "Plumbers, Gasfitters & Drainlayers Board" },
              { name: "MITO", full: "Motor Industry Training Organisation" },
            ].map((ito, index) => (
              <motion.div
                key={ito.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 px-5 py-3 bg-white rounded-full border border-gray-200 shadow-sm"
              >
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <span className="font-semibold text-gray-900">{ito.name}</span>
                  <span className="text-gray-400 mx-2">•</span>
                  <span className="text-gray-600 text-sm">{ito.full}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-orange-500 to-orange-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Simplify Your Logbook?
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            Join thousands of NZ apprentices who save hours every week.
          </p>
          <Link href="/app">
            <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50 text-lg px-10 py-7 rounded-xl shadow-lg">
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
