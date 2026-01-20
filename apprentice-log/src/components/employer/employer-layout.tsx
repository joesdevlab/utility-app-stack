"use client";

import { useAuth } from "@/components/auth-provider";
import { redirect } from "next/navigation";
import { EmployerNav, EmployerMobileNav } from "./employer-nav";
import { Building2 } from "lucide-react";
import Link from "next/link";

interface EmployerLayoutProps {
  children: React.ReactNode;
}

export function EmployerLayout({ children }: EmployerLayoutProps) {
  const { user, isLoading, organization } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    redirect("/auth/login?redirect=/employer");
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow border-r bg-card pt-5 overflow-y-auto">
          <div className="flex items-center gap-2 px-4 mb-6">
            <div className="rounded-lg bg-primary p-2">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold">Employer Portal</span>
              {organization && (
                <span className="text-xs text-muted-foreground truncate max-w-[180px]">
                  {organization.name}
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 px-3">
            <EmployerNav />
          </div>

          <div className="p-4 border-t">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Back to App
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="sticky top-0 z-40 md:hidden">
        <div className="flex items-center gap-3 border-b bg-background/80 backdrop-blur-lg px-4 py-3">
          <div className="rounded-lg bg-primary p-2">
            <Building2 className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <span className="font-semibold text-sm">Employer Portal</span>
            {organization && (
              <p className="text-xs text-muted-foreground truncate">
                {organization.name}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="md:pl-64">
        <div className="p-4 md:p-8 pb-24 md:pb-8">{children}</div>
      </main>

      {/* Mobile Navigation */}
      <EmployerMobileNav />
    </div>
  );
}
