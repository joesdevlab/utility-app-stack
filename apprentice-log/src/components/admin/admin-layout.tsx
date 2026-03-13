"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { useAuth } from "@/components/auth-provider";
import { useRouter } from "next/navigation";
import { AdminNav, AdminMobileNav } from "./admin-nav";
import { LogOut, Download, RefreshCw, Sparkles, Clock, FlaskConical } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import type { MRRData } from "./admin-charts";
import { DEMO_DATA, exportToCSV } from "./admin-charts";

interface AdminContextType {
  data: MRRData | null;
  isLoading: boolean;
  isRefreshing: boolean;
  useDemoData: boolean;
  setUseDemoData: (v: boolean) => void;
  displayData: MRRData;
  lastUpdated: Date | null;
  fetchData: (showRefresh?: boolean) => Promise<void>;
  error: string | null;
}

const AdminContext = createContext<AdminContextType | null>(null);

export function useAdminData() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdminData must be used within AdminLayout");
  return ctx;
}

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isLoading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<MRRData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [useDemoData, setUseDemoData] = useState(false);

  const fetchData = async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/mrr");
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to fetch data");
      }
      const result = await response.json();
      setData(result);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const displayData = useDemoData ? DEMO_DATA : (data || DEMO_DATA);

  // Auth loading
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-orange-50/30">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/20 flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    router.push("/auth?redirect=/admin");
    return null;
  }

  const ctxValue: AdminContextType = {
    data,
    isLoading,
    isRefreshing,
    useDemoData,
    setUseDemoData,
    displayData,
    lastUpdated,
    fetchData,
    error,
  };

  return (
    <AdminContext.Provider value={ctxValue}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-orange-50/30">
        {/* Demo Mode Banner */}
        <AnimatePresence>
          {useDemoData && (
            <motion.div
              initial={{ opacity: 0, y: -40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-white py-2.5 px-4 text-center text-sm font-medium"
            >
              <div className="flex items-center justify-center gap-2">
                <FlaskConical className="h-4 w-4" />
                <span>Demo Mode Active - Showing sample data for 150+ paying customers</span>
                <button
                  onClick={() => setUseDemoData(false)}
                  className="ml-2 px-2 py-0.5 rounded bg-white/20 hover:bg-white/30 transition-colors text-xs"
                >
                  Show Real Data
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop Sidebar */}
        <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col z-30">
          <div className="flex flex-col flex-grow border-r bg-card/50 backdrop-blur-sm pt-5 overflow-y-auto">
            <div className="flex items-center gap-3 px-4 mb-8">
              <motion.div
                initial={{ rotate: -180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/25 flex items-center justify-center"
              >
                <Sparkles className="h-5 w-5 text-white" />
              </motion.div>
              <div className="flex flex-col">
                <span className="font-bold text-gray-900">Admin Dashboard</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  Apprentice Log
                  {lastUpdated && (
                    <>
                      <Clock className="h-3 w-3 ml-1" />
                      {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </>
                  )}
                </span>
              </div>
            </div>

            <div className="flex-1 px-3">
              <AdminNav />
            </div>

            {/* Sidebar Footer */}
            <div className="p-4 border-t space-y-3">
              {/* Demo Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FlaskConical className={`h-3.5 w-3.5 ${useDemoData ? "text-orange-600" : "text-gray-400"}`} />
                  <Label htmlFor="sidebar-demo" className={`text-xs cursor-pointer ${useDemoData ? "text-orange-700" : "text-muted-foreground"}`}>
                    Demo Data
                  </Label>
                </div>
                <Switch
                  id="sidebar-demo"
                  checked={useDemoData}
                  onCheckedChange={setUseDemoData}
                  className="data-[state=checked]:bg-orange-500"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={() => exportToCSV(displayData, `apprentice-log-metrics-${new Date().toISOString().split("T")[0]}.csv`)}
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs gap-1.5 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200"
                >
                  <Download className="h-3.5 w-3.5" />
                  Export
                </Button>
                <Button
                  onClick={() => fetchData(true)}
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs gap-1.5 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200"
                  disabled={isRefreshing || useDemoData}
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>

              <button
                onClick={async () => { await signOut(); router.push("/"); }}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-red-600 transition-colors w-full"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="sticky top-0 z-40 md:hidden">
          <div className="flex items-center gap-3 border-b bg-background/95 backdrop-blur-lg px-4 py-3 safe-area-top">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-md shadow-orange-500/20 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <span className="font-bold text-sm">Admin Dashboard</span>
              <p className="text-xs text-muted-foreground">Apprentice Log</p>
            </div>
            <button
              onClick={async () => { await signOut(); router.push("/"); }}
              className="p-2 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
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
            {isLoading && !data ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-4 w-64" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-40 rounded-xl" />
                  ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Skeleton className="h-80 rounded-xl lg:col-span-2" />
                  <Skeleton className="h-80 rounded-xl" />
                </div>
              </div>
            ) : (
              children
            )}
          </motion.div>
        </main>

        {/* Mobile Navigation */}
        <AdminMobileNav />
      </div>
    </AdminContext.Provider>
  );
}
