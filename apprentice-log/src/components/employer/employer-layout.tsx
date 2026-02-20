"use client";

import { useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { redirect } from "next/navigation";
import { EmployerNav, EmployerMobileNav } from "./employer-nav";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { prefetchDashboard } from "@/hooks/use-dashboard";

interface EmployerLayoutProps {
  children: React.ReactNode;
}

export function EmployerLayout({ children }: EmployerLayoutProps) {
  const { user, isLoading, organization } = useAuth();

  // Prefetch dashboard data immediately when employer section is accessed
  useEffect(() => {
    prefetchDashboard();
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-orange-50/50 to-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg shadow-orange-500/20">
              <img src="/Logo-v1-128-128.png" alt="Apprentice Log" className="w-full h-full object-cover" />
            </div>
            <motion.div
              className="absolute inset-0 rounded-2xl bg-orange-500/20"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </motion.div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    redirect("/auth/login?redirect=/employer");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/30 to-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow border-r bg-card/50 backdrop-blur-sm pt-5 overflow-y-auto">
          <div className="flex items-center gap-3 px-4 mb-8">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-orange-500/20">
              <img src="/Logo-v1-128-128.png" alt="Apprentice Log" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-gray-900">Employer Portal</span>
              {organization && (
                <span className="text-xs text-muted-foreground truncate max-w-[160px]">
                  {organization.name}
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 px-3">
            <EmployerNav />
          </div>

          <div className="p-4 border-t">
            <Link
              href="/app"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-orange-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to App
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="sticky top-0 z-40 md:hidden">
        <div className="flex items-center gap-3 border-b bg-background/95 backdrop-blur-lg px-4 py-3 safe-area-top">
          <div className="w-9 h-9 rounded-xl overflow-hidden shadow-md shadow-orange-500/20">
            <img src="/Logo-v1-128-128.png" alt="Apprentice Log" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <span className="font-bold text-sm">Employer Portal</span>
            {organization && (
              <p className="text-xs text-muted-foreground truncate">
                {organization.name}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="md:pl-64">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-4 md:p-8 pb-24 md:pb-8"
        >
          {children}
        </motion.div>
      </main>

      {/* Mobile Navigation */}
      <EmployerMobileNav />
    </div>
  );
}
