"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Menu, X, ChevronDown, ArrowRight,
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
            {/* Trades Dropdown */}
            <div
              className="relative"
              ref={tradesDropdownRef}
              onMouseEnter={() => setIsTradesOpen(true)}
              onMouseLeave={() => setIsTradesOpen(false)}
            >
              <button
                onClick={() => setIsTradesOpen(!isTradesOpen)}
                className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isTradesOpen
                    ? "text-orange-600 bg-orange-50"
                    : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                }`}
              >
                Trades
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isTradesOpen ? "rotate-180" : ""}`} />
              </button>
              {isTradesOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-100 py-3 z-50 overflow-hidden"
                >
                  <div className="px-4 pb-2 mb-2 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Select Your Trade</p>
                  </div>
                  {trades.map((trade, index) => (
                    <Link
                      key={trade.href}
                      href={trade.href}
                      className="group flex items-center gap-3 px-4 py-3 mx-2 rounded-xl hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 transition-all duration-200"
                      onClick={() => setIsTradesOpen(false)}
                    >
                      <div className={`flex items-center justify-center w-10 h-10 rounded-xl bg-gray-50 group-hover:bg-white group-hover:shadow-md transition-all duration-200 ${trade.color.replace('text-', 'group-hover:shadow-')}/20`}>
                        <trade.icon className={`h-5 w-5 ${trade.color} transition-transform duration-200 group-hover:scale-110`} />
                      </div>
                      <div className="flex-1">
                        <span className="text-gray-800 font-semibold group-hover:text-orange-600 transition-colors">{trade.name}</span>
                        <p className="text-xs text-gray-400 group-hover:text-gray-500">View {trade.name.toLowerCase()} resources</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-orange-500 group-hover:translate-x-1 transition-all duration-200" />
                    </Link>
                  ))}
                  <div className="mt-2 pt-2 mx-4 border-t border-gray-100">
                    <Link
                      href="/trades"
                      className="flex items-center justify-center gap-2 py-2 text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
                      onClick={() => setIsTradesOpen(false)}
                    >
                      View all trades
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
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
            <Link
              href="/about"
              className="px-4 py-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg text-sm font-medium transition-all"
            >
              About
            </Link>
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
            <Link
              href="/employer-landing"
              className="block w-full text-left px-4 py-3 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg text-base font-medium transition-all"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              For Employers
            </Link>
            <Link
              href="/about"
              className="block w-full text-left px-4 py-3 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg text-base font-medium transition-all"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </Link>
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
  );
}
