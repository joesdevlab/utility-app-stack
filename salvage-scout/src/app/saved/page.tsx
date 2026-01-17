"use client";

import { motion } from "framer-motion";
import { useAuth } from "@/components/auth-provider";
import { AuthForm } from "@/components/auth-form";
import { useSavedListings } from "@/hooks";
import { ListingCard } from "@/components/listing-card";
import { Button } from "@/components/ui/button";
import {
  Recycle,
  ArrowLeft,
  Loader2,
  Bookmark,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function SavedPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { savedListings, isLoading, unsaveListing } = useSavedListings(user?.id);

  const handleUnsave = async (listingId: string) => {
    await unsaveListing(listingId);
    toast.success("Removed from saved");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur safe-area-top">
        <div className="flex items-center justify-between h-14 px-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-amber-500 fill-amber-500" />
            <h1 className="text-lg font-semibold">Saved Listings</h1>
          </div>
          <div className="w-8" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-lg">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          </div>
        ) : savedListings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <Bookmark className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No saved listings</h2>
            <p className="text-muted-foreground mb-6">
              Save listings you&apos;re interested in for easy access
            </p>
            <Link href="/">
              <Button className="bg-amber-500 hover:bg-amber-600">
                <Recycle className="h-4 w-4 mr-2" />
                Browse Listings
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {savedListings.length} {savedListings.length === 1 ? "listing" : "listings"} saved
            </p>

            {savedListings.map((saved, index) =>
              saved.listing ? (
                <motion.div
                  key={saved.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative"
                >
                  <ListingCard material={saved.listing} />
                  <div className="absolute top-2 right-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleUnsave(saved.listingId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ) : null
            )}
          </div>
        )}
      </main>
    </div>
  );
}
