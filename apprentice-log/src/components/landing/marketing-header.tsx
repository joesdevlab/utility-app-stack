"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  HardHat, Menu, X, ChevronDown, ArrowRight,
  Building2, Wrench, Zap, Droplets, Car
} from "lucide-react";
import Link from "next/link";

const trades = [
  { name: "Construction", href: "/trades/construction", icon: Building2, color: "text-orange-500" },
  { name: "Carpentry", href: "/trades/carpentry", icon: Wrench, color: "text-amber-600" },
  { name: "Electrical", href: "/trades/electrical", icon: Zap, color: "text-yellow-500" },
  { name: "Plumbing", href: "/trades/plumbing", icon: Droplets, color: "text-blue-500" },
  { name: "Automotive", href: "/trades/automotive", icon: Car, color: "text-red-500" },
];

export function MarketingHeader() {
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

  const scrollToSection = (id: string) => {
    // Navigate to landing page with hash
    window.location.href = `/landing#${id}`;
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/landing" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:shadow-orange-500/30 transition-shadow">
              <HardHat className="h-5 w-5 text-white" />
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
            {/* Trades Dropdown */}
            <div className="relative" ref={tradesDropdownRef}>
              <button
                onClick={() => setIsTradesOpen(!isTradesOpen)}
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
                      onClick={() => setIsTradesOpen(false)}
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
            <Link
              href="/employer-landing"
              className="px-4 py-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg text-sm font-medium transition-all"
            >
              For Employers
            </Link>
          </nav>

          {/* Right side buttons */}
          <div className="flex items-center gap-3">
            {/* Sign In - Desktop */}
            <Link
              href="/"
              className="hidden md:inline-flex px-4 py-2 text-gray-700 hover:text-orange-600 text-sm font-medium transition-colors"
            >
              Sign In
            </Link>

            {/* Get Started CTA */}
            <Link href="/" className="hidden sm:inline-flex">
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
            <Link
              href="/employer-landing"
              className="block w-full text-left px-4 py-3 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg text-base font-medium transition-all"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              For Employers
            </Link>
            <div className="pt-3 border-t border-gray-100 space-y-2">
              <Link
                href="/"
                className="block w-full text-center px-4 py-3 text-gray-700 hover:text-orange-600 rounded-lg text-base font-medium transition-all"
              >
                Sign In
              </Link>
              <Link href="/" className="block">
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
  );
}
