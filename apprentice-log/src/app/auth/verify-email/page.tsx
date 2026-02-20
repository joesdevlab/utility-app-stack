"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, RefreshCw, CheckCircle, LogOut } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/app";
  const { user, session, signOut, resendVerification } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Check if email is verified and redirect
  useEffect(() => {
    if (user?.email_confirmed_at) {
      router.push(redirect);
    }
  }, [user, redirect, router]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleResendEmail = async () => {
    if (cooldown > 0 || !user?.email) return;

    setIsResending(true);
    try {
      await resendVerification(user.email);
      toast.success("Verification email sent! Check your inbox.");
      setCooldown(60); // 60 second cooldown
    } catch (error) {
      toast.error("Failed to send verification email. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const handleRefresh = () => {
    router.refresh();
    window.location.reload();
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 to-white p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
            <Mail className="h-8 w-8 text-orange-500" />
          </div>
          <CardTitle className="text-2xl">Verify Your Email</CardTitle>
          <CardDescription>
            We sent a verification link to{" "}
            <span className="font-medium text-gray-900">{user.email}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-orange-800">
              Please check your email and click the verification link to continue.
              Check your spam folder if you don&apos;t see it.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleResendEmail}
              disabled={isResending || cooldown > 0}
              variant="outline"
              className="w-full"
            >
              {isResending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : cooldown > 0 ? (
                `Resend in ${cooldown}s`
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Resend Verification Email
                </>
              )}
            </Button>

            <Button
              onClick={handleRefresh}
              className="w-full bg-orange-500 hover:bg-orange-600"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              I&apos;ve Verified My Email
            </Button>

            <Button
              onClick={handleSignOut}
              variant="ghost"
              className="w-full text-gray-500"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>
              Wrong email?{" "}
              <button
                onClick={handleSignOut}
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                Sign up with a different email
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
