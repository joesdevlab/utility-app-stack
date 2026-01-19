"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Mic, ArrowRight, Play, CheckCircle } from "lucide-react";
import { useState } from "react";

export function HeroSection() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const scrollToDownload = () => {
    document.getElementById("download")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-blue-600/10 to-transparent rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293720_1px,transparent_1px),linear-gradient(to_bottom,#1f293720_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left column - Text content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-6"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span className="text-blue-400 text-sm font-medium">Built for NZ Apprentices</span>
            </motion.div>

            {/* Main headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"
            >
              Speak Your Day.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
                We Write It Up.
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg sm:text-xl text-slate-300 mb-8 max-w-xl mx-auto lg:mx-0"
            >
              Stop wasting time on paperwork after a hard day on site.
              Record your voice in 30 seconds and get a professional BCITO logbook entry.
            </motion.p>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-4 justify-center lg:justify-start mb-8"
            >
              {["Free to use", "Works offline", "BCITO compatible"].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-slate-400 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>{item}</span>
                </div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button
                size="lg"
                className="bg-blue-500 hover:bg-blue-600 text-white text-lg px-8 py-6 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300"
                onClick={scrollToDownload}
              >
                <Mic className="h-5 w-5 mr-2" />
                Start Recording Free
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-slate-700 text-slate-300 hover:bg-slate-800 text-lg px-8 py-6 rounded-xl"
                onClick={() => setIsVideoPlaying(true)}
              >
                <Play className="h-5 w-5 mr-2" />
                Watch Demo
              </Button>
            </motion.div>

            {/* Social proof mini */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-10 flex items-center gap-4 justify-center lg:justify-start"
            >
              <div className="flex -space-x-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 border-2 border-slate-900 flex items-center justify-center text-xs font-bold text-white"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div className="text-sm">
                <span className="text-white font-semibold">500+</span>
                <span className="text-slate-400"> Kiwi apprentices</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right column - Phone mockup */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            <div className="relative mx-auto w-[280px] sm:w-[320px]">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full scale-150" />

              {/* Phone frame */}
              <div className="relative bg-slate-900 rounded-[3rem] p-3 shadow-2xl border border-slate-700">
                {/* Screen */}
                <div className="bg-slate-950 rounded-[2.5rem] overflow-hidden aspect-[9/19.5]">
                  {/* Status bar */}
                  <div className="h-8 bg-slate-900 flex items-center justify-center">
                    <div className="w-20 h-5 bg-slate-950 rounded-full" />
                  </div>

                  {/* App content mockup */}
                  <div className="p-4 space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="text-white font-semibold">Apprentice Log</div>
                      <div className="w-8 h-8 rounded-full bg-slate-800" />
                    </div>

                    {/* Record button */}
                    <div className="flex flex-col items-center py-8">
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                          boxShadow: [
                            "0 0 0 0 rgba(59, 130, 246, 0.4)",
                            "0 0 0 20px rgba(59, 130, 246, 0)",
                            "0 0 0 0 rgba(59, 130, 246, 0)",
                          ],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center cursor-pointer"
                      >
                        <Mic className="h-10 w-10 text-white" />
                      </motion.div>
                      <p className="text-slate-400 text-sm mt-4">Tap to record</p>
                    </div>

                    {/* Sample entry preview */}
                    <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700">
                      <div className="text-xs text-slate-400 mb-1">Today&apos;s Entry</div>
                      <div className="text-sm text-white">Framing work on site...</div>
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">8h</span>
                        <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded">Carpentry</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -right-4 top-20 bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl"
              >
                <div className="text-xs text-slate-400">Hours logged</div>
                <div className="text-xl font-bold text-white">1,247</div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute -left-4 bottom-32 bg-green-500/10 border border-green-500/20 rounded-lg p-3 shadow-xl"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-400">Entry saved!</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Video modal placeholder */}
      {isVideoPlaying && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setIsVideoPlaying(false)}
        >
          <div className="bg-slate-900 rounded-2xl p-8 max-w-2xl w-full text-center">
            <p className="text-white text-xl mb-4">Demo Video Coming Soon</p>
            <p className="text-slate-400 mb-6">Click anywhere to close</p>
            <Button variant="outline" onClick={() => setIsVideoPlaying(false)}>
              Close
            </Button>
          </div>
        </motion.div>
      )}
    </section>
  );
}
