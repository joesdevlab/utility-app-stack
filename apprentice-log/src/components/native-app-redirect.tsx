"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isNativeApp } from "@/lib/capacitor";

interface NativeAppRedirectProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * Wrapper component that redirects to auth page when running in native app (Capacitor)
 * Shows children (marketing content) only on web
 */
export function NativeAppRedirect({ children, redirectTo = "/auth" }: NativeAppRedirectProps) {
  const router = useRouter();
  const [isNative, setIsNative] = useState<boolean | null>(null);

  useEffect(() => {
    const native = isNativeApp();
    setIsNative(native);

    if (native) {
      router.replace(redirectTo);
    }
  }, [router, redirectTo]);

  // Still checking or redirecting
  if (isNative === null || isNative) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-orange-500 rounded-2xl" />
        </div>
      </div>
    );
  }

  // Web browser - show marketing content
  return <>{children}</>;
}
