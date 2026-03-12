"use client";

import { AuthForm } from "@/components/auth-form";
import { useAuth } from "@/components/auth-provider";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

function AuthContent() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get mode and invite params from URL (e.g., /auth?mode=signup&email=test@example.com)
  const modeParam = searchParams.get("mode");
  const defaultMode = modeParam === "signup" ? "signup" : "signin";
  const defaultEmail = searchParams.get("email") || "";

  useEffect(() => {
    // If user is already logged in, redirect appropriately
    if (!isLoading && user) {
      // If email is not verified, send to verification page
      // to avoid redirect loop (middleware bounces unverified users from /app)
      if (!user.email_confirmed_at) {
        router.replace("/auth/verify-email");
      } else {
        router.replace("/app");
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-orange-500 rounded-2xl" />
        </div>
      </div>
    );
  }

  return <AuthForm defaultMode={defaultMode} defaultEmail={defaultEmail} />;
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-orange-500 rounded-2xl" />
          </div>
        </div>
      }
    >
      <AuthContent />
    </Suspense>
  );
}
