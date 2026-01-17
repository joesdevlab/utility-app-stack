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
import { Input } from "@/components/ui/input";
import {
  Scan,
  Pill,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  History,
  LogOut,
  Loader2,
  Search,
  X,
  Keyboard,
  Heart,
} from "lucide-react";
import Link from "next/link";
import { useScans, useFavorites } from "@/hooks";
import { toast } from "sonner";
import { demoBarcodes } from "@/lib/medicine-data";
import type { Medicine, MedicineComparison } from "@/types";

type AppState = "idle" | "scanning" | "loading" | "result" | "searching" | "search-results";

export default function Home() {
  const { user, isLoading: authLoading, signOut } = useAuth();
  const [state, setState] = useState<AppState>("idle");
  const [comparison, setComparison] = useState<MedicineComparison | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Medicine[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [manualBarcode, setManualBarcode] = useState("");
  const { addScan } = useScans(user?.id);
  const { isFavorite, addFavorite, removeFavorite } = useFavorites(user?.id);

  const handleFavoriteToggle = (medicineId: string, currentlyFavorite: boolean) => {
    if (!user) {
      toast.error("Sign in to save favorites");
      return;
    }
    if (currentlyFavorite) {
      removeFavorite(medicineId);
      toast.success("Removed from favorites");
    } else {
      addFavorite(medicineId);
      toast.success("Added to favorites");
    }
  };

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

      // Record the scan to history
      if (user && data.scanned.id) {
        addScan(data.scanned.id, barcode);
      }

      if (data.savings > 0) {
        toast.success(`Found ${data.alternatives.length} cheaper alternatives!`);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not find medicine"
      );
      setState("idle");
    }
  };

  const handleDemoScan = (barcode: string) => {
    handleScan(barcode);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(`/api/medicines/search?q=${encodeURIComponent(searchQuery.trim())}`);
      if (!response.ok) {
        throw new Error("Search failed");
      }
      const data = await response.json();
      setSearchResults(data.medicines || []);
      setState("search-results");
    } catch {
      toast.error("Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectMedicine = (medicine: Medicine) => {
    handleScan(medicine.barcode);
  };

  const handleManualBarcode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualBarcode.trim()) return;
    handleScan(manualBarcode.trim());
  };

  const handleReset = () => {
    setState("idle");
    setComparison(null);
    setSearchQuery("");
    setSearchResults([]);
    setManualBarcode("");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur safe-area-top">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="w-16" /> {/* Spacer for centering */}
          <div className="flex items-center gap-2">
            <Pill className="h-6 w-6 text-emerald-500" />
            <h1 className="text-lg font-semibold">Bio-Swap</h1>
          </div>
          <div className="flex items-center gap-1 w-24 justify-end">
            {user && (
              <Link href="/favorites">
                <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Favorites">
                  <Heart className="h-4 w-4" />
                </Button>
              </Link>
            )}
            {user && (
              <Link href="/history">
                <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Scan history">
                  <History className="h-4 w-4" />
                </Button>
              </Link>
            )}
            {user && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => signOut()}
                className="h-8 w-8"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
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

              {/* Search by Name */}
              <div className="relative">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <div className="h-px flex-1 bg-border" />
                  <span>or search by name</span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search medicines..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-10"
                  />
                  {searchQuery && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                      onClick={() => setSearchQuery("")}
                      aria-label="Clear search"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </form>
              </div>

              {/* Manual Barcode Entry */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Keyboard className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm font-medium">Enter Barcode Manually</span>
                  </div>
                  <form onSubmit={handleManualBarcode} className="flex gap-2">
                    <Input
                      placeholder="e.g., 9415991011231"
                      value={manualBarcode}
                      onChange={(e) => setManualBarcode(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="submit"
                      className="bg-emerald-500 hover:bg-emerald-600"
                      disabled={!manualBarcode.trim()}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </form>
                </CardContent>
              </Card>

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
          {(state === "loading" || isSearching) && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mb-4" />
              <p className="text-muted-foreground">
                {isSearching ? "Searching medicines..." : "Looking up medicine..."}
              </p>
            </motion.div>
          )}

          {/* Search Results State */}
          {state === "search-results" && (
            <motion.div
              key="search-results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Search Results ({searchResults.length})
                </h3>
                <Button variant="outline" size="sm" onClick={handleReset}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </div>

              {searchResults.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No medicines found for &quot;{searchQuery}&quot;
                    </p>
                    <Button
                      variant="link"
                      className="mt-2 text-emerald-500"
                      onClick={handleReset}
                    >
                      Try a different search
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {searchResults.map((medicine, index) => (
                    <motion.div
                      key={medicine.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card
                        className="cursor-pointer hover:border-emerald-500/50 transition-colors"
                        onClick={() => handleSelectMedicine(medicine)}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{medicine.brandName}</h4>
                              <p className="text-sm text-muted-foreground">
                                {medicine.genericName} {medicine.strength}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {medicine.form} • {medicine.packSize} pack
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-emerald-600">
                                ${medicine.price.toFixed(2)}
                              </p>
                              {medicine.isGeneric && (
                                <Badge variant="secondary" className="text-xs">
                                  Generic
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
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
                <MedicineCard
                  medicine={comparison.scanned}
                  isScanned
                  isFavorite={isFavorite(comparison.scanned.id)}
                  onFavoriteToggle={handleFavoriteToggle}
                />
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
                        isFavorite={isFavorite(med.id)}
                        onFavoriteToggle={handleFavoriteToggle}
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
