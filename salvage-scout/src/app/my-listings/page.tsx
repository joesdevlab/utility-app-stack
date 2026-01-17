"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/components/auth-provider";
import { AuthForm } from "@/components/auth-form";
import { ListingCard } from "@/components/listing-card";
import { ListingEditSheet } from "@/components/listing-edit-sheet";
import { useMyListings } from "@/hooks/use-my-listings";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Recycle,
  ArrowLeft,
  Trash2,
  Pencil,
  Plus,
  Loader2,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import type { Material } from "@/types";

export default function MyListingsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { listings, isLoading, removeListing, updateListing } = useMyListings(user?.id);
  const [editingListing, setEditingListing] = useState<Material | null>(null);
  const [editSheetOpen, setEditSheetOpen] = useState(false);

  const handleEdit = (listing: Material) => {
    setEditingListing(listing);
    setEditSheetOpen(true);
  };

  const handleSave = async (id: string, updates: Partial<Material>) => {
    return await updateListing(id, updates);
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

  const handleDelete = (id: string) => {
    if (confirm("Delete this listing? This cannot be undone.")) {
      removeListing(id);
      toast.success("Listing deleted");
    }
  };

  const handleStatusChange = async (id: string, status: "available" | "pending" | "claimed") => {
    const result = await updateListing(id, { status });
    if (result) {
      toast.success(`Status updated to ${status}`);
    } else {
      toast.error("Failed to update status");
    }
  };

  const activeListings = listings.filter((l) => l.status === "available");
  const pendingListings = listings.filter((l) => l.status === "pending");
  const claimedListings = listings.filter((l) => l.status === "claimed");

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
            <Package className="h-5 w-5 text-amber-500" />
            <h1 className="text-lg font-semibold">My Listings</h1>
          </div>
          <div className="w-8" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-lg">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          </div>
        ) : listings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <Recycle className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No listings yet</h2>
            <p className="text-muted-foreground mb-6">
              Share your leftover building materials with others
            </p>
            <Link href="/">
              <Button className="bg-amber-500 hover:bg-amber-600">
                <Plus className="h-4 w-4 mr-2" />
                Create Listing
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              {listings.length} {listings.length === 1 ? "listing" : "listings"}
            </p>

            {/* Active Listings */}
            {activeListings.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <Badge className="bg-green-500">Active</Badge>
                  {activeListings.length} listing{activeListings.length !== 1 ? "s" : ""}
                </h3>
                <div className="space-y-3">
                  {activeListings.map((listing, index) => (
                    <motion.div
                      key={listing.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="relative"
                    >
                      <ListingCard material={listing} />
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleStatusChange(listing.id, "pending")}
                        >
                          Mark Pending
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-amber-500"
                          onClick={() => handleEdit(listing)}
                          aria-label="Edit listing"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDelete(listing.id)}
                          aria-label="Delete listing"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Pending Listings */}
            {pendingListings.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <Badge className="bg-yellow-500">Pending</Badge>
                  {pendingListings.length} listing{pendingListings.length !== 1 ? "s" : ""}
                </h3>
                <div className="space-y-3">
                  {pendingListings.map((listing, index) => (
                    <motion.div
                      key={listing.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="relative"
                    >
                      <ListingCard material={listing} />
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleStatusChange(listing.id, "claimed")}
                        >
                          Mark Claimed
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(listing.id, "available")}
                        >
                          Reactivate
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-amber-500"
                          onClick={() => handleEdit(listing)}
                          aria-label="Edit listing"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Claimed Listings */}
            {claimedListings.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <Badge variant="secondary">Claimed</Badge>
                  {claimedListings.length} listing{claimedListings.length !== 1 ? "s" : ""}
                </h3>
                <div className="space-y-3">
                  {claimedListings.map((listing, index) => (
                    <motion.div
                      key={listing.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="relative opacity-60"
                    >
                      <ListingCard material={listing} />
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDelete(listing.id)}
                          aria-label="Delete listing"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Edit Sheet */}
      <ListingEditSheet
        listing={editingListing}
        open={editSheetOpen}
        onOpenChange={setEditSheetOpen}
        onSave={handleSave}
      />
    </div>
  );
}
