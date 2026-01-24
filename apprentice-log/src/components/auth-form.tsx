"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HardHat, Loader2, Mail, Lock, User, CheckCircle2, RefreshCw } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { MFAVerify } from "@/components/mfa-verify";
import { Turnstile } from "@/components/turnstile";
import { toast } from "sonner";

type AuthMode = "signin" | "signup" | "forgot" | "verify" | "mfa";

export function AuthForm() {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const { signIn, signUp, resetPassword, resendVerification } = useAuth();

  // Check if Turnstile is configured
  const isTurnstileConfigured = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  const handleTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token);
  }, []);

  const handleTurnstileExpire = useCallback(() => {
    setTurnstileToken(null);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Require Turnstile verification for signup and forgot password only
    const requiresTurnstile = mode === "signup" || mode === "forgot";
    if (isTurnstileConfigured && requiresTurnstile && !turnstileToken) {
      toast.error("Please complete the security verification");
      return;
    }

    setIsLoading(true);

    try {
      // Verify Turnstile token server-side for sensitive actions
      if (isTurnstileConfigured && turnstileToken && requiresTurnstile) {
        const verifyResponse = await fetch("/api/auth/verify-turnstile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: turnstileToken }),
        });

        if (!verifyResponse.ok) {
          const data = await verifyResponse.json();
          toast.error(data.error || "Security verification failed");
          setTurnstileToken(null); // Reset to require new verification
          return;
        }
      }

      if (mode === "signin") {
        const { error, mfaRequired } = await signIn(email, password);
        if (error) {
          toast.error(error.message);
        } else if (mfaRequired) {
          setMode("mfa");
        } else {
          toast.success("Welcome back!");
        }
      } else if (mode === "signup") {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success("Check your email to verify your account");
          setMode("verify");
        }
      } else if (mode === "forgot") {
        const { error } = await resetPassword(email);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success("Check your email for a password reset link");
          setMode("signin");
        }
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    setIsResending(true);
    try {
      const { error } = await resendVerification(email);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Verification email sent!");
      }
    } catch {
      toast.error("Failed to resend verification email");
    } finally {
      setIsResending(false);
    }
  };

  // MFA verification screen
  if (mode === "mfa") {
    return (
      <MFAVerify
        onSuccess={() => {
          toast.success("Welcome back!");
          // The auth state change will handle the redirect
        }}
        onCancel={() => {
          setMode("signin");
          setPassword("");
        }}
      />
    );
  }

  // Verification pending screen
  if (mode === "verify") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-orange-500" />
              </div>
              <CardTitle>Check your email</CardTitle>
              <CardDescription>
                We sent a verification link to <strong>{email}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Click the link in your email to verify your account, then sign in.
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleResendVerification}
                disabled={isResending}
              >
                {isResending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Resend email
              </Button>
              <Button
                className="w-full bg-orange-500 hover:bg-orange-600"
                onClick={() => setMode("signin")}
              >
                Back to Sign In
              </Button>
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
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center">
              <HardHat className="h-6 w-6 text-orange-500" />
            </div>
            <CardTitle>Apprentice Log</CardTitle>
            <CardDescription>
              {mode === "signin"
                ? "Sign in to access your logbook"
                : mode === "signup"
                ? "Create an account to get started"
                : "Enter your email to reset your password"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Smith"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10"
                      required={mode === "signup"}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {mode !== "forgot" && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
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
              )}

              {/* Turnstile CAPTCHA - only show for signup and forgot password */}
              {(mode === "signup" || mode === "forgot") && (
                <div className="flex justify-center">
                  <Turnstile
                    onVerify={handleTurnstileVerify}
                    onExpire={handleTurnstileExpire}
                    theme="auto"
                    action={mode}
                  />
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600"
                disabled={isLoading || (isTurnstileConfigured && (mode === "signup" || mode === "forgot") && !turnstileToken)}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : mode === "signin" ? (
                  "Sign In"
                ) : mode === "signup" ? (
                  "Create Account"
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm space-y-2">
              {mode === "signin" && (
                <>
                  <p className="text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setMode("signup")}
                      className="text-orange-500 hover:underline"
                    >
                      Sign up
                    </button>
                  </p>
                  <p>
                    <button
                      type="button"
                      onClick={() => setMode("forgot")}
                      className="text-muted-foreground hover:text-orange-500"
                    >
                      Forgot password?
                    </button>
                  </p>
                </>
              )}
              {mode === "signup" && (
                <p className="text-muted-foreground">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("signin")}
                    className="text-orange-500 hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              )}
              {mode === "forgot" && (
                <p className="text-muted-foreground">
                  Remember your password?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("signin")}
                    className="text-orange-500 hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
