"use client";

import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { BottomNav } from "./bottom-nav";
import { HardHat } from "lucide-react";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  // Get page title based on pathname
  const getPageTitle = () => {
    switch (pathname) {
      case "/":
        return "Record Entry";
      case "/history":
        return "Entry History";
      case "/settings":
        return "Settings";
      default:
        return "Apprentice Log";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/30 to-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-orange-100/50 safe-area-top">
        <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/25">
              <HardHat className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-base font-bold text-gray-900 leading-tight">
                {getPageTitle()}
              </h1>
              <span className="text-[10px] text-orange-600 font-medium leading-tight">
                Apprentice Log
              </span>
            </div>
          </div>

          {/* NZ Badge */}
          <div className="flex items-center gap-1 bg-blue-50 border border-blue-100 rounded-full px-2 py-0.5">
            <span className="text-xs">🇳🇿</span>
            <span className="text-[10px] font-medium text-blue-700">NZ Made</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-28">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
