"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mic, Clock, Settings } from "lucide-react";

const navItems = [
  { href: "/history", label: "History", icon: Clock },
  { href: "/", label: "Record", icon: Mic, isMain: true },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-gray-200/50 safe-area-bottom">
      <div className="flex items-center justify-around h-20 max-w-md mx-auto px-6">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.isMain) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative -mt-8"
              >
                <motion.div
                  whileTap={{ scale: 0.92 }}
                  whileHover={{ scale: 1.02 }}
                  className="relative"
                >
                  {/* Glow effect */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 blur-lg opacity-40" />

                  {/* Main button */}
                  <div className="relative flex items-center justify-center w-[68px] h-[68px] rounded-full bg-gradient-to-br from-orange-500 to-orange-600 shadow-xl shadow-orange-500/30 ring-4 ring-white">
                    <Icon className="w-7 h-7 text-white" strokeWidth={2.5} />
                  </div>
                </motion.div>
                <motion.span
                  className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs font-semibold text-orange-600"
                  animate={{ opacity: isActive ? 1 : 0.8 }}
                >
                  {item.label}
                </motion.span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center min-w-[72px] py-2 group"
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="relative flex flex-col items-center"
              >
                <div className={`p-2 rounded-xl transition-colors ${
                  isActive ? "bg-orange-100" : "group-hover:bg-gray-100"
                }`}>
                  <Icon
                    className={`w-5 h-5 transition-colors ${
                      isActive ? "text-orange-600" : "text-gray-500 group-hover:text-gray-700"
                    }`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </div>
                {isActive && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-orange-500"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.div>
              <span
                className={`text-[11px] mt-1 transition-colors ${
                  isActive
                    ? "text-orange-600 font-semibold"
                    : "text-gray-500 group-hover:text-gray-700"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
