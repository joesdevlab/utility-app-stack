"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import type { EmailOtpType } from "@supabase/supabase-js";

function ConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const tokenHash = searchParams.get("token_hash");
    const type = searchParams.get("type") as EmailOtpType | null;
    const redirectTo = searchParams.get("redirect_to") || "/app";

    if (!tokenHash || !type) {
      setStatus("error");
      setErrorMessage("Invalid confirmation link. Please request a new one.");
      return;
    }

    const confirmToken = async () => {
      const supabase = createClient();

      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type,
      });

      if (error) {
        setStatus("error");
        setErrorMessage(error.message);
        return;
      }

      setStatus("success");

      // Redirect after a short delay
      setTimeout(() => {
        if (type === "recovery") {
          router.push("/auth/reset-password");
        } else {
          router.push(redirectTo);
        }
      }, 1500);
    };

    confirmToken();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-orange-50 to-white">
      <Card className="w-full max-w-sm">
        <CardContent className="pt-6 text-center space-y-4">
          {status === "loading" && (
            <>
              <Loader2 className="h-10 w-10 animate-spin text-orange-500 mx-auto" />
              <p className="text-sm text-muted-foreground">Verifying your account...</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Verified!</h2>
                <p className="text-sm text-muted-foreground">Redirecting you now...</p>
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Verification Failed</h2>
                <p className="text-sm text-muted-foreground">{errorMessage}</p>
              </div>
              <div className="space-y-2 pt-2">
                <Button
                  className="w-full bg-orange-500 hover:bg-orange-600"
                  onClick={() => router.push("/auth?mode=signup")}
                >
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push("/auth")}
                >
                  Back to Sign In
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      }
    >
      <ConfirmContent />
    </Suspense>
  );
}
