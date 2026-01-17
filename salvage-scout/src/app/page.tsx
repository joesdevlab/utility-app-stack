"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PhotoCapture } from "@/components/photo-capture";
import { ListingCard, EmptyListingCard } from "@/components/listing-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  MapPin,
  RefreshCw,
  Recycle,
  Camera,
  Check,
  X,
  Loader2,
  Phone,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "@/hooks/use-location";
import { useListings } from "@/hooks/use-listings";
import type { Material, MaterialAnalysis } from "@/types";
import { CATEGORY_LABELS, CONDITION_LABELS } from "@/types";

type AppState = "feed" | "capturing" | "analyzing" | "confirming";

export default function Home() {
  const [state, setState] = useState<AppState>("feed");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<MaterialAnalysis | null>(null);
  const [contactMethod, setContactMethod] = useState<"message" | "call">("message");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { location, isLoading: locationLoading, getLocation } = useLocation();
  const { listings, isLoading: listingsLoading, addListing, refreshListings } = useListings(location);

  // Get location on mount
  useEffect(() => {
    getLocation();
  }, [getLocation]);

  const handleCapture = async (imageData: string) => {
    setCapturedImage(imageData);
    setState("analyzing");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageData }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze image");
      }

      const data: MaterialAnalysis = await response.json();
      setAnalysis(data);
      setState("confirming");
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Could not analyze image. Please try again.");
      setState("feed");
      setCapturedImage(null);
    }
  };

  const handleConfirmListing = () => {
    if (!analysis || !capturedImage || !location) {
      toast.error("Missing required information");
      return;
    }

    const newListing: Material = {
      id: `listing-${Date.now()}`,
      title: analysis.title,
      description: analysis.description,
      category: analysis.category,
      condition: analysis.condition,
      quantity: analysis.suggestedQuantity,
      imageUrl: capturedImage,
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
        suburb: location.suburb,
      },
      postedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      contactMethod,
      status: "available",
    };

    addListing(newListing);
    toast.success("Listing posted!");

    // Reset state
    setState("feed");
    setCapturedImage(null);
    setAnalysis(null);

    // Haptic feedback
    if ("vibrate" in navigator) {
      navigator.vibrate(50);
    }
  };

  const handleCancelListing = () => {
    setState("feed");
    setCapturedImage(null);
    setAnalysis(null);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await getLocation();
    refreshListings();
    setIsRefreshing(false);
    toast.success("Listings refreshed");
  };

  const isLoading = locationLoading || listingsLoading;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur safe-area-top">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            <Recycle className="h-6 w-6 text-amber-500" />
            <h1 className="text-lg font-semibold">Salvage Scout</h1>
          </div>
          <div className="flex items-center gap-2">
            {location && (
              <Badge variant="outline" className="text-xs">
                <MapPin className="h-3 w-3 mr-1" />
                {location.suburb}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`h-5 w-5 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-lg pb-24">
        <AnimatePresence mode="wait">
          {/* Feed State */}
          {state === "feed" && (
            <motion.div
              key="feed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Hero Card */}
              <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
                <CardContent className="p-4">
                  <h2 className="font-semibold mb-1">
                    Free building materials near you
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Reduce waste, save money. Snap a photo to list or browse
                    what&apos;s available.
                  </p>
                </CardContent>
              </Card>

              {/* Listings */}
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                </div>
              ) : listings.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Available near you ({listings.length})
                  </h3>
                  {listings.map((listing, index) => (
                    <ListingCard
                      key={listing.id}
                      material={listing}
                      delay={0.1 * index}
                    />
                  ))}
                </div>
              ) : (
                <EmptyListingCard />
              )}
            </motion.div>
          )}

          {/* Analyzing State */}
          {state === "analyzing" && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-amber-500 border-t-transparent mb-4" />
              <p className="text-muted-foreground">Analyzing materials...</p>
              <p className="text-sm text-muted-foreground mt-2">
                AI is identifying what you&apos;re giving away
              </p>
            </motion.div>
          )}

          {/* Confirming State */}
          {state === "confirming" && analysis && (
            <motion.div
              key="confirming"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <h2 className="font-semibold">Confirm Your Listing</h2>

              {/* Preview Image */}
              {capturedImage && (
                <div className="relative rounded-xl overflow-hidden">
                  <img
                    src={capturedImage}
                    alt="Material preview"
                    className="w-full listing-image"
                  />
                </div>
              )}

              {/* Auto-filled Details */}
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Title</Label>
                    <p className="font-medium">{analysis.title}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Description
                    </Label>
                    <p className="text-sm">{analysis.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Category
                      </Label>
                      <Badge variant="secondary">
                        {CATEGORY_LABELS[analysis.category]}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Condition
                      </Label>
                      <Badge variant="outline">
                        {CONDITION_LABELS[analysis.condition]}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Quantity
                    </Label>
                    <p className="text-sm">{analysis.suggestedQuantity}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Location */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-amber-500" />
                    <span className="text-sm">
                      {location?.suburb || "Location unknown"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Method */}
              <Card>
                <CardContent className="p-4">
                  <Label className="text-xs text-muted-foreground mb-2 block">
                    How should people contact you?
                  </Label>
                  <div className="flex gap-2">
                    <Button
                      variant={contactMethod === "message" ? "default" : "outline"}
                      className={
                        contactMethod === "message"
                          ? "bg-amber-500 hover:bg-amber-600"
                          : ""
                      }
                      onClick={() => setContactMethod("message")}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                    <Button
                      variant={contactMethod === "call" ? "default" : "outline"}
                      className={
                        contactMethod === "call"
                          ? "bg-amber-500 hover:bg-amber-600"
                          : ""
                      }
                      onClick={() => setContactMethod("call")}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Tips from AI */}
              {analysis.tips && analysis.tips.length > 0 && (
                <Card className="border-amber-500/30 bg-amber-500/5">
                  <CardContent className="p-4">
                    <Label className="text-xs text-muted-foreground mb-2 block">
                      Tips for a better listing
                    </Label>
                    <ul className="text-sm space-y-1">
                      {analysis.tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-amber-500">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleCancelListing}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-amber-500 hover:bg-amber-600"
                  onClick={handleConfirmListing}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Post Listing
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Action Button */}
      {state === "feed" && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed bottom-6 right-6 safe-area-bottom z-30"
        >
          <Button
            size="lg"
            className="h-14 w-14 rounded-full bg-amber-500 hover:bg-amber-600 shadow-lg"
            onClick={() => setState("capturing")}
          >
            <Plus className="h-6 w-6" />
          </Button>
        </motion.div>
      )}

      {/* Camera Modal */}
      <AnimatePresence>
        {state === "capturing" && (
          <PhotoCapture
            onCapture={handleCapture}
            onClose={() => setState("feed")}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
