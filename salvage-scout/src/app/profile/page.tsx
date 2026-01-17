"use client";

import { motion } from "framer-motion";
import { useAuth } from "@/components/auth-provider";
import { AuthForm } from "@/components/auth-form";
import { useProfileStats } from "@/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  User,
  ArrowLeft,
  LogOut,
  Package,
  Bookmark,
  Clock,
  CheckCircle2,
  Loader2,
  ChevronRight,
  Mail,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

function formatDate(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-NZ", {
    month: "long",
    year: "numeric",
  });
}

export default function ProfilePage() {
  const { user, isLoading: authLoading, signOut } = useAuth();
  const { stats, isLoading: statsLoading } = useProfileStats(user?.id);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
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

  const displayName = user.user_metadata?.full_name || user.email?.split("@")[0] || "User";

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
            <User className="h-5 w-5 text-amber-500" />
            <h1 className="text-lg font-semibold">Profile</h1>
          </div>
          <div className="w-8" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-lg space-y-6">
        {/* User Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <User className="h-8 w-8 text-amber-500" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold">{displayName}</h2>
                  <div className="flex items-center gap-1 text-muted-foreground text-sm">
                    <Mail className="h-3 w-3" />
                    <span>{user.email}</span>
                  </div>
                  {stats.memberSince && (
                    <div className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
                      <Calendar className="h-3 w-3" />
                      <span>Member since {formatDate(stats.memberSince)}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <Package className="h-6 w-6 mx-auto mb-2 text-amber-500" />
                    <p className="text-2xl font-bold">{stats.totalListings}</p>
                    <p className="text-xs text-muted-foreground">Total Listings</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-green-500" />
                    <p className="text-2xl font-bold">{stats.activeListings}</p>
                    <p className="text-xs text-muted-foreground">Active</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <Clock className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
                    <p className="text-2xl font-bold">{stats.pendingListings}</p>
                    <p className="text-xs text-muted-foreground">Pending</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <Bookmark className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                    <p className="text-2xl font-bold">{stats.savedListings}</p>
                    <p className="text-xs text-muted-foreground">Saved</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Link href="/my-listings">
                <div className="flex items-center justify-between px-6 py-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Package className="h-5 w-5 text-muted-foreground" />
                    <span>My Listings</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
              <Link href="/saved">
                <div className="flex items-center justify-between px-6 py-4 hover:bg-muted/50 transition-colors border-t">
                  <div className="flex items-center gap-3">
                    <Bookmark className="h-5 w-5 text-muted-foreground" />
                    <span>Saved Listings</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sign Out */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            variant="outline"
            className="w-full text-destructive hover:text-destructive"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </motion.div>
      </main>
    </div>
  );
}
