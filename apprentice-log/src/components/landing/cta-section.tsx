"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, ArrowRight, Smartphone, CheckCircle, Shield, Clock } from "lucide-react";
import { AppStoreBadges } from "@/components/app-store-badges";

export function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      id="download"
      className="py-24 bg-gradient-to-b from-white to-orange-50 relative overflow-hidden"
    >
      {/* Background image */}
      <div className="absolute inset-0 opacity-5">
        <img
          src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1200&q=80"
          alt=""
          className="w-full h-full object-cover"
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-green-100 border border-green-200 rounded-full px-4 py-2 mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-green-700 text-sm font-semibold">100% Free for NZ Apprentices</span>
          </div>

          {/* Headline */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Start Your Free Account Today
          </h2>

          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join over 500 trade professionals across New Zealand who have transformed their
            logbook process. Get started in under a minute.
          </p>

          {/* Benefits list */}
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            {[
              { icon: Clock, text: "30-second entries" },
              { icon: CheckCircle, text: "BCITO compliant" },
              { icon: Smartphone, text: "Works offline" },
              { icon: Shield, text: "Enterprise security" },
            ].map((benefit, i) => (
              <div
                key={i}
                className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 shadow-sm"
              >
                <benefit.icon className="h-4 w-4 text-orange-500" />
                <span className="text-gray-700 text-sm font-medium">{benefit.text}</span>
              </div>
            ))}
          </div>

          {/* App Store Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-10"
          >
            <p className="text-sm text-gray-500 mb-4">Download the app</p>
            <AppStoreBadges className="justify-center" />
          </motion.div>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              size="lg"
              className="bg-orange-500 hover:bg-orange-600 text-white text-lg px-10 py-7 rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-300"
              asChild
            >
              <a href="/">
                <Mic className="h-5 w-5 mr-2" />
                Try Web Version
                <ArrowRight className="h-5 w-5 ml-2" />
              </a>
            </Button>
          </div>

          {/* Install instructions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white border border-gray-200 rounded-2xl p-6 max-w-xl mx-auto shadow-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                <Smartphone className="h-5 w-5 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Or Install as Web App</h3>
            </div>

            <ol className="text-left text-sm text-gray-600 space-y-2">
              <li className="flex gap-3">
                <span className="text-orange-600 font-mono font-semibold">1.</span>
                <span>Visit <strong className="text-gray-900">apprentice-log.vercel.app</strong> on your mobile device</span>
              </li>
              <li className="flex gap-3">
                <span className="text-orange-600 font-mono font-semibold">2.</span>
                <span>Tap the browser menu and select <strong className="text-gray-900">&quot;Add to Home Screen&quot;</strong></span>
              </li>
              <li className="flex gap-3">
                <span className="text-orange-600 font-mono font-semibold">3.</span>
                <span>Open the app and create your free account</span>
              </li>
            </ol>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
