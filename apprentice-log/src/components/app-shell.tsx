"use client";

import { ReactNode, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { BottomNav } from "./bottom-nav";
import { useAuth } from "./auth-provider";
import { LogOut, Building2, ChevronDown } from "lucide-react";
import Link from "next/link";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut, isEmployer } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  // Get page title based on pathname
  const getPageTitle = () => {
    switch (pathname) {
      case "/app":
        return "Record Entry";
      case "/app/history":
        return "Entry History";
      case "/app/settings":
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
            <div className="w-9 h-9 rounded-xl overflow-hidden shadow-lg shadow-orange-500/25">
              <img src="/Logo-v1-128-128.png" alt="Apprentice Log" className="w-full h-full object-cover" />
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

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-1.5 bg-orange-50 border border-orange-100 rounded-full pl-2.5 pr-2 py-1 hover:bg-orange-100 transition-colors"
            >
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-[10px] font-bold text-white">
                {user?.email?.[0]?.toUpperCase() || "?"}
              </div>
              <ChevronDown className="h-3 w-3 text-orange-600" />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-50" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                  <div className="px-3 py-2 border-b border-gray-100">
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                  {isEmployer && (
                    <Link
                      href="/employer/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 transition-colors"
                    >
                      <Building2 className="h-4 w-4" />
                      Employer Portal
                    </Link>
                  )}
                  <button
                    onClick={async () => { setMenuOpen(false); await signOut(); router.push("/"); }}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </>
            )}
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
