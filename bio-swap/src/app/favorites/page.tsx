"use client";

import { motion } from "framer-motion";
import { useAuth } from "@/components/auth-provider";
import { AuthForm } from "@/components/auth-form";
import { useFavorites } from "@/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Pill,
  ArrowLeft,
  Loader2,
  Heart,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function FavoritesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { favorites, isLoading, removeFavorite } = useFavorites(user?.id);

  const handleRemove = async (medicineId: string) => {
    await removeFavorite(medicineId);
    toast.success("Removed from favorites");
  };

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
            <Heart className="h-5 w-5 text-emerald-500 fill-emerald-500" />
            <h1 className="text-lg font-semibold">Favorites</h1>
          </div>
          <div className="w-8" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-lg">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        ) : favorites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <Heart className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No favorites yet</h2>
            <p className="text-muted-foreground mb-6">
              Save medicines you buy often for quick access
            </p>
            <Link href="/">
              <Button className="bg-emerald-500 hover:bg-emerald-600">
                <Pill className="h-4 w-4 mr-2" />
                Scan Medicine
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {favorites.length} {favorites.length === 1 ? "medicine" : "medicines"} saved
            </p>

            {favorites.map((fav, index) => (
              <motion.div
                key={fav.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium">
                          {fav.medicine?.brandName || "Unknown"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {fav.medicine?.genericName} {fav.medicine?.strength}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {fav.medicine?.form} • {fav.medicine?.packSize} pack
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="font-semibold text-emerald-600">
                            ${fav.medicine?.price.toFixed(2)}
                          </span>
                          {fav.medicine?.isGeneric && (
                            <Badge variant="secondary" className="text-xs">
                              Generic
                            </Badge>
                          )}
                          {fav.medicine?.isSubsidized && (
                            <Badge className="bg-emerald-500 text-xs">
                              Subsidized
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleRemove(fav.medicineId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
