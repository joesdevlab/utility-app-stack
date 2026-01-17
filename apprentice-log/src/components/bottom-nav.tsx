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
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.isMain) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative -mt-6"
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className={`flex items-center justify-center w-16 h-16 rounded-full shadow-lg ${
                    isActive
                      ? "bg-orange-500 text-white"
                      : "bg-orange-500 text-white"
                  }`}
                >
                  <Icon className="w-7 h-7" />
                </motion.div>
                <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs font-medium text-orange-500">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center min-w-[64px] py-2"
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="relative flex flex-col items-center"
              >
                <Icon
                  className={`w-6 h-6 ${
                    isActive ? "text-orange-500" : "text-muted-foreground"
                  }`}
                />
                {isActive && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="absolute -bottom-1 w-1 h-1 rounded-full bg-orange-500"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.div>
              <span
                className={`text-xs mt-1 ${
                  isActive
                    ? "text-orange-500 font-medium"
                    : "text-muted-foreground"
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
