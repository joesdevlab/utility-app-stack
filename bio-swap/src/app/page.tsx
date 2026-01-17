"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarcodeScanner } from "@/components/barcode-scanner";
import { MedicineCard, SavingsCard } from "@/components/medicine-card";
import { AuthForm } from "@/components/auth-form";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Scan,
  Pill,
  RotateCcw,
  ArrowRight,
  Sparkles,
  User,
  LogOut,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { demoBarcodes } from "@/lib/medicine-data";
import type { MedicineComparison } from "@/types";

type AppState = "idle" | "scanning" | "loading" | "result";

export default function Home() {
  const { user, isLoading: authLoading, signOut } = useAuth();
  const [state, setState] = useState<AppState>("idle");
  const [comparison, setComparison] = useState<MedicineComparison | null>(null);

  const handleScan = async (barcode: string) => {
    setState("loading");

    try {
      const response = await fetch(`/api/medicine?barcode=${barcode}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Medicine not found");
      }

      const data: MedicineComparison = await response.json();
      setComparison(data);
      setState("result");

      if (data.savings > 0) {
        toast.success(`Found ${data.alternatives.length} cheaper alternatives!`);
      }
    } catch (error) {
      console.error("Lookup error:", error);
      toast.error(
        error instanceof Error ? error.message : "Could not find medicine"
      );
      setState("idle");
    }
  };

  const handleDemoScan = (barcode: string) => {
    handleScan(barcode);
  };

  const handleReset = () => {
    setState("idle");
    setComparison(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur safe-area-top">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="w-10" /> {/* Spacer for centering */}
          <div className="flex items-center gap-2">
            <Pill className="h-6 w-6 text-emerald-500" />
            <h1 className="text-lg font-semibold">Bio-Swap</h1>
          </div>
          <div className="w-10 flex justify-end">
            {user ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => signOut()}
                className="h-8 w-8"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setState("idle")}
                className="h-8 w-8 text-muted-foreground"
              >
                <User className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-lg">
        <AnimatePresence mode="wait">
          {/* Idle State */}
          {state === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Hero */}
              <div className="text-center py-8">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 mb-4"
                >
                  <Scan className="h-10 w-10 text-emerald-500" />
                </motion.div>
                <h2 className="text-2xl font-bold mb-2">Find Cheaper Meds</h2>
                <p className="text-muted-foreground">
                  Scan a medicine barcode to find identical generics for less
                </p>
              </div>

              {/* Scan Button */}
              <Button
                size="lg"
                className="w-full h-14 text-lg bg-emerald-500 hover:bg-emerald-600"
                onClick={() => setState("scanning")}
              >
                <Scan className="h-5 w-5 mr-2" />
                Scan Barcode
              </Button>

              {/* Demo Section */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm font-medium">Try Demo Barcodes</span>
                  </div>
                  <div className="space-y-2">
                    {demoBarcodes.map((demo) => (
                      <Button
                        key={demo.barcode}
                        variant="outline"
                        className="w-full justify-between"
                        onClick={() => handleDemoScan(demo.barcode)}
                      >
                        <span className="text-sm">{demo.description}</span>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Info */}
              <div className="text-center text-sm text-muted-foreground">
                <p>
                  Same active ingredients. Same strength. Different price.
                </p>
              </div>
            </motion.div>
          )}

          {/* Loading State */}
          {state === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mb-4" />
              <p className="text-muted-foreground">Looking up medicine...</p>
            </motion.div>
          )}

          {/* Result State */}
          {state === "result" && comparison && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Savings Card */}
              {(comparison.savings > 0 || comparison.subsidyAvailable) && (
                <SavingsCard
                  savings={comparison.savings}
                  subsidyAvailable={comparison.subsidyAvailable}
                />
              )}

              {/* Scanned Product */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  You scanned
                </h3>
                <MedicineCard medicine={comparison.scanned} isScanned />
              </div>

              {/* Alternatives */}
              {comparison.alternatives.length > 0 ? (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    Cheaper alternatives ({comparison.alternatives.length})
                  </h3>
                  <div className="space-y-3">
                    {comparison.alternatives.map((med, index) => (
                      <MedicineCard
                        key={med.id}
                        medicine={med}
                        isCheapest={index === 0}
                        delay={0.1 * (index + 1)}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">
                      This is already the cheapest option we found!
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Subsidy Tip */}
              {comparison.subsidyAvailable && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card className="border-emerald-500/30 bg-emerald-500/5">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Badge className="bg-emerald-500 shrink-0">Tip</Badge>
                        <p className="text-sm">
                          Ask your GP to prescribe the generic version. With a
                          prescription, you may only pay the{" "}
                          <strong>$5 co-pay</strong> instead of the full price!
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Reset Button */}
              <Button
                variant="outline"
                className="w-full"
                onClick={handleReset}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Scan Another
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Scanner Modal */}
      <AnimatePresence>
        {state === "scanning" && (
          <BarcodeScanner
            onScan={handleScan}
            onClose={() => setState("idle")}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
