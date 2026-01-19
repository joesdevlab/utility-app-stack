"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, ArrowRight, Smartphone, CheckCircle } from "lucide-react";

export function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      id="download"
      className="py-24 bg-gradient-to-b from-slate-950 to-slate-900 relative overflow-hidden"
    >
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-2 mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-green-400 text-sm font-medium">Free Forever • No Credit Card</span>
          </div>

          {/* Headline */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Ditch the Paperwork?
          </h2>

          <p className="text-lg sm:text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
            Join 500+ Kiwi apprentices who&apos;ve made their logbook the easiest part of the job.
            Get started in under a minute.
          </p>

          {/* Benefits list */}
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            {[
              "30-second entries",
              "BCITO compatible",
              "Works offline",
              "100% free",
            ].map((benefit, i) => (
              <div
                key={i}
                className="flex items-center gap-2 bg-slate-800/50 border border-slate-700 rounded-full px-4 py-2"
              >
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-slate-300 text-sm">{benefit}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              size="lg"
              className="bg-blue-500 hover:bg-blue-600 text-white text-lg px-10 py-7 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300"
              asChild
            >
              <a href="/">
                <Mic className="h-5 w-5 mr-2" />
                Start Recording Now
                <ArrowRight className="h-5 w-5 ml-2" />
              </a>
            </Button>
          </div>

          {/* Install instructions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-slate-800/30 border border-slate-700 rounded-2xl p-6 max-w-xl mx-auto"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Smartphone className="h-5 w-5 text-blue-400" />
              </div>
              <h3 className="font-semibold text-white">Install on Your Phone</h3>
            </div>

            <ol className="text-left text-sm text-slate-400 space-y-2">
              <li className="flex gap-3">
                <span className="text-blue-400 font-mono">1.</span>
                <span>Open <strong className="text-white">apprentice-log.vercel.app</strong> in your browser</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-400 font-mono">2.</span>
                <span>Tap the menu (⋮) and select <strong className="text-white">&quot;Add to Home Screen&quot;</strong></span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-400 font-mono">3.</span>
                <span>That&apos;s it! Open the app and start recording</span>
              </li>
            </ol>

            <p className="text-xs text-slate-500 mt-4">
              Coming soon to the Google Play Store!
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
