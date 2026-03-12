"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, Loader2, Lock, Check, AlertTriangle } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { toast } from "sonner";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);
  const { updatePassword, user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Verify that the user arrived via a valid recovery flow
  useEffect(() => {
    if (authLoading) return;

    // Check if there's a hash fragment (Supabase recovery tokens come as hash params)
    const hash = window.location.hash;
    const hasRecoveryToken = hash.includes("type=recovery") || hash.includes("type=magiclink");

    if (user) {
      // User has a valid session (set by Supabase after token exchange)
      setIsValidSession(true);
    } else if (hasRecoveryToken) {
      // Supabase is still processing the token — wait for auth state change
      const timeout = setTimeout(() => setIsValidSession(false), 10000);
      return () => clearTimeout(timeout);
    } else {
      // No user session and no recovery token — invalid direct access
      setIsValidSession(false);
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        router.push("/app");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await updatePassword(password);
      if (error) {
        toast.error(error.message);
      } else {
        setIsSuccess(true);
        toast.success("Password updated successfully!");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Invalid session — no recovery token and no user
  if (isValidSession === false) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm"
        >
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-amber-500" />
              </div>
              <h2 className="text-lg font-semibold mb-2">Invalid or Expired Link</h2>
              <p className="text-sm text-muted-foreground mb-4">
                This password reset link is invalid or has expired. Please request a new one.
              </p>
              <Link href="/auth">
                <Button className="w-full bg-orange-500 hover:bg-orange-600">
                  Back to Sign In
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Still loading / waiting for Supabase to process token
  if (isValidSession === null || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <p className="text-sm text-muted-foreground">Verifying your reset link...</p>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm"
        >
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <Check className="h-6 w-6 text-green-500" />
              </div>
              <h2 className="text-lg font-semibold mb-2">Password Updated!</h2>
              <p className="text-sm text-muted-foreground">
                Redirecting you to the app...
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
              <ClipboardList className="h-6 w-6 text-blue-500" />
            </div>
            <CardTitle>Reset Password</CardTitle>
            <CardDescription>
              Enter your new password below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                    minLength={8}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    required
                    minLength={8}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Update Password"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
