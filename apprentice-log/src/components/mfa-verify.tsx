"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Loader2, ArrowLeft, Key } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { toast } from "sonner";

interface MFAVerifyProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function MFAVerify({ onSuccess, onCancel }: MFAVerifyProps) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [useRecoveryCode, setUseRecoveryCode] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { verifyMFAChallenge } = useAuth();

  useEffect(() => {
    if (!useRecoveryCode) {
      inputRefs.current[0]?.focus();
    }
  }, [useRecoveryCode]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (newCode.every((d) => d) && newCode.join("").length === 6) {
      handleSubmit(newCode.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newCode = [...code];
    pastedData.split("").forEach((char, i) => {
      if (i < 6) newCode[i] = char;
    });
    setCode(newCode);

    if (newCode.every((d) => d)) {
      handleSubmit(newCode.join(""));
    }
  };

  const handleSubmit = async (codeString?: string) => {
    const verifyCode = codeString || code.join("");
    if (verifyCode.length !== 6) {
      toast.error("Please enter all 6 digits");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await verifyMFAChallenge(verifyCode);
      if (error) {
        toast.error(error.message || "Invalid code. Please try again.");
        setCode(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      } else {
        toast.success("Verified successfully!");
        onSuccess();
      }
    } catch {
      toast.error("Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecoverySubmit = async () => {
    const trimmed = recoveryCode.trim();
    if (!trimmed) {
      toast.error("Please enter a recovery code");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/mfa/recovery-codes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: trimmed }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Invalid recovery code");
        return;
      }

      if (data.message) {
        toast.warning(data.message);
      }

      toast.success("Recovery code accepted!");
      onSuccess();
    } catch {
      toast.error("Failed to verify recovery code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-orange-50/30 to-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <Card className="border-gray-200 shadow-xl">
          <AnimatePresence mode="wait">
            {!useRecoveryCode ? (
              <motion.div
                key="totp"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                <CardHeader className="text-center pb-2">
                  <div className="mx-auto mb-4 relative">
                    <div className="absolute inset-0 rounded-full bg-orange-500/20 blur-xl" />
                    <div className="relative h-16 w-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/25">
                      <Shield className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    Two-Factor Authentication
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Enter the 6-digit code from your authenticator app
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Code Input */}
                  <div className="flex justify-center gap-2" onPaste={handlePaste}>
                    {code.map((digit, index) => (
                      <Input
                        key={index}
                        ref={(el) => { inputRefs.current[index] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="w-11 h-14 text-center text-xl font-bold rounded-xl border-gray-200 focus:border-orange-400 focus:ring-orange-200"
                        disabled={isLoading}
                      />
                    ))}
                  </div>

                  {/* Verify Button */}
                  <Button
                    onClick={() => handleSubmit()}
                    disabled={isLoading || code.some((d) => !d)}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/25"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Verifying...
                      </>
                    ) : (
                      "Verify Code"
                    )}
                  </Button>

                  {/* Recovery Code Link */}
                  <Button
                    variant="ghost"
                    onClick={() => setUseRecoveryCode(true)}
                    className="w-full text-muted-foreground hover:text-orange-600"
                  >
                    <Key className="h-4 w-4 mr-2" />
                    Use a recovery code instead
                  </Button>

                  {/* Cancel Link */}
                  <Button
                    variant="ghost"
                    onClick={onCancel}
                    className="w-full text-muted-foreground hover:text-orange-600"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Sign In
                  </Button>

                  {/* Help Text */}
                  <p className="text-xs text-center text-muted-foreground">
                    Open your authenticator app (Google Authenticator, Authy, etc.) to get your code
                  </p>
                </CardContent>
              </motion.div>
            ) : (
              <motion.div
                key="recovery"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <CardHeader className="text-center pb-2">
                  <div className="mx-auto mb-4 relative">
                    <div className="absolute inset-0 rounded-full bg-amber-500/20 blur-xl" />
                    <div className="relative h-16 w-16 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
                      <Key className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    Recovery Code
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Enter one of your saved recovery codes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Input
                    type="text"
                    placeholder="Enter recovery code"
                    value={recoveryCode}
                    onChange={(e) => setRecoveryCode(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleRecoverySubmit()}
                    className="h-14 text-center text-lg font-mono rounded-xl border-gray-200 focus:border-amber-400 focus:ring-amber-200"
                    disabled={isLoading}
                    autoFocus
                  />

                  <Button
                    onClick={handleRecoverySubmit}
                    disabled={isLoading || !recoveryCode.trim()}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-lg shadow-amber-500/25"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Verifying...
                      </>
                    ) : (
                      "Verify Recovery Code"
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => {
                      setUseRecoveryCode(false);
                      setRecoveryCode("");
                    }}
                    className="w-full text-muted-foreground hover:text-orange-600"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to authenticator code
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    Recovery codes were provided when you set up two-factor authentication. Each code can only be used once.
                  </p>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </div>
  );
}
