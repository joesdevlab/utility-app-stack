"use client";

import { AuthProvider } from "@/components/auth-provider";
import { ErrorBoundary } from "@/components/error-boundary";
import { OfflineIndicator } from "@/components/offline-indicator";
import { InstallPrompt } from "@/components/install-prompt";
import { SkipToContent } from "@/components/skip-to-content";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SkipToContent />
        <OfflineIndicator />
        {children}
        <InstallPrompt />
      </AuthProvider>
    </ErrorBoundary>
  );
}
