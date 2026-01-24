"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Mic, ArrowRight, Play, CheckCircle, Wrench, Menu, X, Zap, Droplets, Car, ChevronDown, Building2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { trackCTAClicked } from "@/lib/analytics";

export function HeroSection() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTradesOpen, setIsTradesOpen] = useState(false);
  const tradesDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (tradesDropdownRef.current && !tradesDropdownRef.current.contains(event.target as Node)) {
        setIsTradesOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const trades = [
    { name: "Construction", href: "/trades/construction", icon: Building2, color: "text-orange-500" },
    { name: "Carpentry", href: "/trades/carpentry", icon: Wrench, color: "text-amber-600" },
    { name: "Electrical", href: "/trades/electrical", icon: Zap, color: "text-yellow-500" },
    { name: "Plumbing", href: "/trades/plumbing", icon: Droplets, color: "text-blue-500" },
    { name: "Automotive", href: "/trades/automotive", icon: Car, color: "text-red-500" },
  ];

  const scrollToDownload = () => {
    trackCTAClicked("Start Free Trial", "hero");
    document.getElementById("download")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setIsMobileMenuOpen(false);
  };

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden bg-white">
      {/* Header / Navigation */}
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-orange-500/20 group-hover:shadow-orange-500/30 transition-shadow">
                <img src="/Logo-v1-128-128.png" alt="Apprentice Log" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xl text-gray-900">Apprentice Log</span>
                  <span className="hidden sm:inline-flex items-center gap-1 bg-blue-50 border border-blue-100 rounded-full px-2 py-0.5 text-xs font-medium text-blue-700">
                    <span>🇳🇿</span>
                    <span className="hidden lg:inline">NZ Made</span>
                  </span>
                </div>
                <span className="text-xs text-gray-500 hidden sm:block">For Kiwi Trade Apprentices</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {/* Trades Dropdown - Hover to open */}
              <div
                className="relative"
                ref={tradesDropdownRef}
                onMouseEnter={() => setIsTradesOpen(true)}
                onMouseLeave={() => setIsTradesOpen(false)}
              >
                <button
                  className="flex items-center gap-1 px-4 py-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg text-sm font-medium transition-all"
                >
                  Trades
                  <ChevronDown className={`h-4 w-4 transition-transform ${isTradesOpen ? "rotate-180" : ""}`} />
                </button>
                {isTradesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50"
                  >
                    {trades.map((trade) => (
                      <Link
                        key={trade.href}
                        href={trade.href}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-orange-50 transition-colors"
                      >
                        <trade.icon className={`h-5 w-5 ${trade.color}`} />
                        <span className="text-gray-700 font-medium">{trade.name}</span>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </div>
              <button
                onClick={() => scrollToSection("features")}
                className="px-4 py-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg text-sm font-medium transition-all"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("testimonials")}
                className="px-4 py-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg text-sm font-medium transition-all"
              >
                Testimonials
              </button>
              <button
                onClick={() => scrollToSection("faq")}
                className="px-4 py-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg text-sm font-medium transition-all"
              >
                FAQ
              </button>
              <button
                onClick={() => scrollToSection("download")}
                className="px-4 py-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg text-sm font-medium transition-all"
              >
                Download
              </button>
            </nav>

            {/* Right side buttons */}
            <div className="flex items-center gap-3">
              {/* Sign In - Desktop */}
              <Link
                href="/app"
                className="hidden md:inline-flex px-4 py-2 text-gray-700 hover:text-orange-600 text-sm font-medium transition-colors"
              >
                Sign In
              </Link>

              {/* Get Started CTA */}
              <Link href="/app" className="hidden sm:inline-flex">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all px-5">
                  <span>Get Started Free</span>
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-gray-100 bg-white"
          >
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
              {/* Trades section */}
              <div className="pb-3 mb-3 border-b border-gray-100">
                <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Trades</p>
                <div className="grid grid-cols-2 gap-2">
                  {trades.map((trade) => (
                    <Link
                      key={trade.href}
                      href={trade.href}
                      className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <trade.icon className={`h-4 w-4 ${trade.color}`} />
                      <span className="text-sm font-medium">{trade.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
              <button
                onClick={() => scrollToSection("features")}
                className="w-full text-left px-4 py-3 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg text-base font-medium transition-all"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("testimonials")}
                className="w-full text-left px-4 py-3 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg text-base font-medium transition-all"
              >
                Testimonials
              </button>
              <button
                onClick={() => scrollToSection("faq")}
                className="w-full text-left px-4 py-3 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg text-base font-medium transition-all"
              >
                FAQ
              </button>
              <button
                onClick={() => scrollToSection("download")}
                className="w-full text-left px-4 py-3 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg text-base font-medium transition-all"
              >
                Download
              </button>
              <div className="pt-3 border-t border-gray-100 space-y-2">
                <Link
                  href="/app"
                  className="block w-full text-center px-4 py-3 text-gray-700 hover:text-orange-600 rounded-lg text-base font-medium transition-all"
                >
                  Sign In
                </Link>
                <Link href="/app" className="block">
                  <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-lg shadow-md py-3">
                    Get Started Free
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
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
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <div className="inline-flex items-center gap-3 bg-gray-100 border border-gray-200 rounded-full px-4 py-2">
                <span className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                  <span>🇳🇿</span>
                  <span>NZ Made</span>
                </span>
                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                <span className="text-sm font-medium text-orange-600">BCITO Compliant</span>
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
              {["Free for NZ Apprentices", "Works Offline", "30-Second Entries"].map((item, i) => (
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
                onClick={() => {
                  trackCTAClicked("Watch Demo", "hero");
                  setIsVideoPlaying(true);
                }}
              >
                <Play className="h-5 w-5 mr-2" />
                Watch Demo
              </Button>
            </motion.div>

            {/* Industry - links to trade pages */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-10 pt-8 border-t border-gray-200"
            >
              <p className="text-sm text-gray-500 mb-4">
                Built for every trade — find your industry:
              </p>
              <div className="flex items-center gap-2 justify-center lg:justify-start flex-wrap">
                {trades.map((trade) => (
                  <Link
                    key={trade.href}
                    href={trade.href}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-orange-50 border border-gray-200 hover:border-orange-200 rounded-lg transition-all group"
                  >
                    <trade.icon className={`h-4 w-4 ${trade.color}`} />
                    <span className="font-medium text-sm text-gray-700 group-hover:text-orange-600">{trade.name}</span>
                  </Link>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Right column - Image + Phone mockup */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            {/* Background image of tradesperson */}
            <div className="absolute -inset-4 lg:-inset-8 rounded-3xl overflow-hidden opacity-20 lg:opacity-30">
              <img
                src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80"
                alt="Construction worker"
                className="w-full h-full object-cover"
              />
            </div>

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
                      <div className="w-8 h-8 rounded-full overflow-hidden">
                        <img src="/Logo-v1-128-128.png" alt="Apprentice Log" className="w-full h-full object-cover" />
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
