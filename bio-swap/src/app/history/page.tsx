"use client";

import { motion } from "framer-motion";
import { useAuth } from "@/components/auth-provider";
import { AuthForm } from "@/components/auth-form";
import { MedicineCard } from "@/components/medicine-card";
import { useScans } from "@/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Pill,
  Clock,
  Trash2,
  ArrowLeft,
  Loader2,
  History,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function HistoryPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { scans, isLoading, deleteScan, clearScans } = useScans(user?.id);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  const handleClearAll = () => {
    if (confirm("Clear all scan history? This cannot be undone.")) {
      clearScans();
      toast.success("History cleared");
    }
  };

  const handleDelete = (id: string) => {
    deleteScan(id);
    toast.success("Scan removed");
  };

  // Group scans by date
  const groupedScans = scans.reduce((acc, scan) => {
    const date = new Date(scan.scannedAt).toLocaleDateString("en-NZ", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(scan);
    return acc;
  }, {} as Record<string, typeof scans>);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur safe-area-top">
        <div className="flex items-center justify-between h-14 px-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Back to home">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-emerald-500" />
            <h1 className="text-lg font-semibold">Scan History</h1>
          </div>
          <div className="w-8">
            {scans.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={handleClearAll}
                aria-label="Clear all history"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-lg">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        ) : scans.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <Clock className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No scans yet</h2>
            <p className="text-muted-foreground mb-6">
              Scan a medicine barcode to see your history here
            </p>
            <Link href="/">
              <Button className="bg-emerald-500 hover:bg-emerald-600">
                <Pill className="h-4 w-4 mr-2" />
                Scan a Medicine
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              {scans.length} {scans.length === 1 ? "scan" : "scans"} recorded
            </p>

            {Object.entries(groupedScans).map(([date, dateScans], groupIndex) => (
              <div key={date}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs font-medium text-muted-foreground px-2">
                    {date}
                  </span>
                  <div className="h-px flex-1 bg-border" />
                </div>

                <div className="space-y-3">
                  {dateScans.map((scan, index) => (
                    <motion.div
                      key={scan.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (groupIndex * dateScans.length + index) * 0.05 }}
                      className="relative"
                    >
                      {scan.medicine ? (
                        <MedicineCard medicine={scan.medicine} />
                      ) : (
                        <Card>
                          <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">
                              Barcode: {scan.barcode}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Medicine no longer available
                            </p>
                          </CardContent>
                        </Card>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(scan.id)}
                        aria-label="Delete scan"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
