"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Mic, ArrowRight, Play, CheckCircle, HardHat, Wrench, ClipboardCheck } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export function HeroSection() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const scrollToDownload = () => {
    document.getElementById("download")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden bg-white">
      {/* Header / Navigation */}
      <header className="relative z-20 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/landing" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/25">
                <HardHat className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl text-gray-900">Apprentice Log</span>
                <span className="text-xs text-gray-500 hidden sm:block">Made in New Zealand</span>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <button
                onClick={() => scrollToSection("features")}
                className="text-gray-600 hover:text-orange-600 text-sm font-medium transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("testimonials")}
                className="text-gray-600 hover:text-orange-600 text-sm font-medium transition-colors"
              >
                Testimonials
              </button>
              <button
                onClick={() => scrollToSection("faq")}
                className="text-gray-600 hover:text-orange-600 text-sm font-medium transition-colors"
              >
                FAQ
              </button>
              <Link href="/privacy" className="text-gray-600 hover:text-orange-600 text-sm font-medium transition-colors">
                Privacy
              </Link>
            </nav>

            {/* CTA Button */}
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg shadow-md">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left column - Text content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            {/* Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap gap-3 justify-center lg:justify-start mb-6"
            >
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-2">
                <span className="text-lg">🇳🇿</span>
                <span className="text-blue-700 text-sm font-semibold">Built in New Zealand</span>
              </div>
              <div className="inline-flex items-center gap-2 bg-orange-100 border border-orange-200 rounded-full px-4 py-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                </span>
                <span className="text-orange-700 text-sm font-semibold">BCITO Approved Format</span>
              </div>
            </motion.div>

            {/* Main headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6"
            >
              Built for Kiwi
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">
                Trade Apprentices
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg sm:text-xl text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0"
            >
              The #1 logbook app designed exclusively for New Zealand apprentices.
              Voice-to-text technology transforms your daily activities into BCITO-compliant entries in seconds.
            </motion.p>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-4 justify-center lg:justify-start mb-8"
            >
              {["100% NZ Made", "BCITO Compliant", "Works Offline"].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-gray-600 text-sm">
                  <CheckCircle className="h-4 w-4 text-orange-500" />
                  <span className="font-medium">{item}</span>
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
                className="bg-orange-500 hover:bg-orange-600 text-white text-lg px-8 py-6 rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-300"
                onClick={scrollToDownload}
              >
                <Mic className="h-5 w-5 mr-2" />
                Start Free Trial
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 text-lg px-8 py-6 rounded-xl"
                onClick={() => setIsVideoPlaying(true)}
              >
                <Play className="h-5 w-5 mr-2" />
                Watch Demo
              </Button>
            </motion.div>

            {/* NZ Industry */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-10 pt-8 border-t border-gray-200"
            >
              <p className="text-sm text-gray-500 mb-4">
                <span className="text-lg mr-2">🇳🇿</span>
                Proudly supporting Kiwi tradies from Northland to Southland
              </p>
              <div className="flex items-center gap-6 justify-center lg:justify-start flex-wrap">
                <div className="flex items-center gap-2 text-gray-400">
                  <HardHat className="h-6 w-6" />
                  <span className="font-semibold">Construction</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Wrench className="h-6 w-6" />
                  <span className="font-semibold">Carpentry</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <ClipboardCheck className="h-6 w-6" />
                  <span className="font-semibold">All NZ Trades</span>
                </div>
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
              <div className="absolute inset-0 bg-orange-500/10 blur-3xl rounded-full scale-150" />

              {/* Phone frame */}
              <div className="relative bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
                {/* Screen */}
                <div className="bg-white rounded-[2.5rem] overflow-hidden aspect-[9/19.5]">
                  {/* Status bar */}
                  <div className="h-8 bg-gray-100 flex items-center justify-center">
                    <div className="w-20 h-5 bg-gray-900 rounded-full" />
                  </div>

                  {/* App content mockup */}
                  <div className="p-4 space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="text-gray-900 font-semibold">Apprentice Log</div>
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                        <HardHat className="h-4 w-4 text-orange-500" />
                      </div>
                    </div>

                    {/* Record button */}
                    <div className="flex flex-col items-center py-8">
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                          boxShadow: [
                            "0 0 0 0 rgba(249, 115, 22, 0.4)",
                            "0 0 0 20px rgba(249, 115, 22, 0)",
                            "0 0 0 0 rgba(249, 115, 22, 0)",
                          ],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center cursor-pointer shadow-lg"
                      >
                        <Mic className="h-10 w-10 text-white" />
                      </motion.div>
                      <p className="text-gray-500 text-sm mt-4">Tap to record entry</p>
                    </div>

                    {/* Sample entry preview */}
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                      <div className="text-xs text-gray-500 mb-1">Today&apos;s Entry</div>
                      <div className="text-sm text-gray-900">Framing work on residential site...</div>
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded font-medium">8h</span>
                        <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">Carpentry</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -right-4 top-20 bg-white border border-gray-200 rounded-lg p-3 shadow-xl"
              >
                <div className="text-xs text-gray-500">Total Hours</div>
                <div className="text-xl font-bold text-gray-900">1,247</div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute -left-4 bottom-32 bg-green-50 border border-green-200 rounded-lg p-3 shadow-xl"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-700 font-medium">Entry saved</span>
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
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setIsVideoPlaying(false)}
        >
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full text-center">
            <p className="text-gray-900 text-xl font-semibold mb-4">Product Demo</p>
            <p className="text-gray-500 mb-6">Video coming soon. Click anywhere to close.</p>
            <Button onClick={() => setIsVideoPlaying(false)}>
              Close
            </Button>
          </div>
        </motion.div>
      )}
      </div>
    </section>
  );
}
