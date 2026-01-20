"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

export default function EmployerPage() {
  const router = useRouter();
  const { organization, isLoading, orgLoading } = useAuth();

  useEffect(() => {
    if (isLoading || orgLoading) return;

    if (organization) {
      router.replace("/employer/dashboard");
    } else {
      router.replace("/employer/onboarding");
    }
  }, [organization, isLoading, orgLoading, router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}
