"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Shield, Loader2, CheckCircle2, Copy, Check, Smartphone, QrCode, Key, AlertTriangle, Download } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { toast } from "sonner";
import Image from "next/image";

interface MFASetupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type SetupStep = "intro" | "qr" | "verify" | "recovery" | "success";

export function MFASetup({ open, onOpenChange, onSuccess }: MFASetupProps) {
  const [step, setStep] = useState<SetupStep>("intro");
  const [qrCode, setQrCode] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [factorId, setFactorId] = useState<string>("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [secretCopied, setSecretCopied] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [recoveryCodesCopied, setRecoveryCodesCopied] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { enrollMFA, verifyMFAEnrollment } = useAuth();

  useEffect(() => {
    if (!open) {
      setStep("intro");
      setQrCode("");
      setSecret("");
      setFactorId("");
      setCode(["", "", "", "", "", ""]);
      setRecoveryCodes([]);
    }
  }, [open]);

  useEffect(() => {
    if (step === "verify") {
      inputRefs.current[0]?.focus();
    }
  }, [step]);

  const handleStartSetup = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await enrollMFA();
      if (error) {
        toast.error(error.message || "Failed to start MFA setup");
        return;
      }

      if (data) {
        setQrCode(data.totp.qr_code);
        setSecret(data.totp.secret);
        setFactorId(data.id);
        setStep("qr");
      }
    } catch {
      toast.error("Failed to start MFA setup");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopySecret = async () => {
    await navigator.clipboard.writeText(secret);
    setSecretCopied(true);
    toast.success("Secret copied to clipboard");
    setTimeout(() => setSecretCopied(false), 2000);
  };

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newCode.every((d) => d) && newCode.join("").length === 6) {
      handleVerify(newCode.join(""));
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
      handleVerify(newCode.join(""));
    }
  };

  const handleVerify = async (codeString?: string) => {
    const verifyCode = codeString || code.join("");
    if (verifyCode.length !== 6) {
      toast.error("Please enter all 6 digits");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await verifyMFAEnrollment(factorId, verifyCode);
      if (error) {
        toast.error(error.message || "Invalid code. Please try again.");
        setCode(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      } else {
        // Generate recovery codes after successful MFA enrollment
        try {
          const response = await fetch("/api/auth/mfa/recovery-codes", {
            method: "POST",
          });
          const data = await response.json();
          if (data.codes) {
            setRecoveryCodes(data.codes);
            setStep("recovery");
          } else {
            setStep("success");
          }
        } catch {
          // Continue to success even if recovery codes fail
          setStep("success");
        }
        onSuccess?.();
      }
    } catch {
      toast.error("Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyRecoveryCodes = async () => {
    const codesText = recoveryCodes.join("\n");
    await navigator.clipboard.writeText(codesText);
    setRecoveryCodesCopied(true);
    toast.success("Recovery codes copied to clipboard");
    setTimeout(() => setRecoveryCodesCopied(false), 2000);
  };

  const handleDownloadRecoveryCodes = () => {
    const codesText = [
      "Apprentice Log - MFA Recovery Codes",
      "Generated: " + new Date().toLocaleString(),
      "",
      "Keep these codes in a safe place. Each code can only be used once.",
      "",
      ...recoveryCodes.map((code, i) => `${i + 1}. ${code}`),
      "",
      "If you lose access to your authenticator app, use one of these codes to sign in.",
    ].join("\n");

    const blob = new Blob([codesText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "apprentice-log-recovery-codes.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Recovery codes downloaded");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <AnimatePresence mode="wait">
          {step === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <DialogHeader className="text-center pb-4">
                <div className="mx-auto mb-4 relative">
                  <div className="absolute inset-0 rounded-full bg-orange-500/20 blur-xl" />
                  <div className="relative h-16 w-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/25">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                </div>
                <DialogTitle className="text-xl font-bold">
                  Set Up Two-Factor Authentication
                </DialogTitle>
                <DialogDescription className="text-sm">
                  Add an extra layer of security to your account
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                  <h4 className="font-semibold text-orange-800 mb-2">You'll need:</h4>
                  <ul className="space-y-2 text-sm text-orange-700">
                    <li className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      An authenticator app on your phone
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                      <span>Google Authenticator, Authy, or 1Password work great</span>
                    </li>
                  </ul>
                </div>

                <Button
                  onClick={handleStartSetup}
                  disabled={isLoading}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/25"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Setting up...
                    </>
                  ) : (
                    <>
                      <QrCode className="h-4 w-4 mr-2" />
                      Continue Setup
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {step === "qr" && (
            <motion.div
              key="qr"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <DialogHeader className="text-center pb-4">
                <DialogTitle className="text-lg font-bold">
                  Scan QR Code
                </DialogTitle>
                <DialogDescription className="text-sm">
                  Open your authenticator app and scan this code
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* QR Code */}
                <div className="flex justify-center">
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    {qrCode && (
                      <Image
                        src={qrCode}
                        alt="QR Code for authenticator app"
                        width={200}
                        height={200}
                        className="rounded-lg"
                      />
                    )}
                  </div>
                </div>

                {/* Manual Entry */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                    <Key className="h-3 w-3" />
                    Or enter this code manually:
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 font-mono break-all">
                      {secret}
                    </code>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCopySecret}
                      className="h-9 w-9 shrink-0"
                    >
                      {secretCopied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={() => setStep("verify")}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/25"
                >
                  I've Scanned the Code
                </Button>
              </div>
            </motion.div>
          )}

          {step === "verify" && (
            <motion.div
              key="verify"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <DialogHeader className="text-center pb-4">
                <DialogTitle className="text-lg font-bold">
                  Enter Verification Code
                </DialogTitle>
                <DialogDescription className="text-sm">
                  Enter the 6-digit code from your authenticator app
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex justify-center gap-2" onPaste={handlePaste}>
                  {code.map((digit, index) => (
                    <Input
                      key={index}
                      ref={(el) => { inputRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-10 h-12 text-center text-lg font-bold rounded-xl border-gray-200 focus:border-orange-400 focus:ring-orange-200"
                      disabled={isLoading}
                    />
                  ))}
                </div>

                <Button
                  onClick={() => handleVerify()}
                  disabled={isLoading || code.some((d) => !d)}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/25"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Verifying...
                    </>
                  ) : (
                    "Verify & Enable"
                  )}
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => setStep("qr")}
                  className="w-full text-muted-foreground"
                >
                  Back to QR Code
                </Button>
              </div>
            </motion.div>
          )}

          {step === "recovery" && (
            <motion.div
              key="recovery"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <DialogHeader className="text-center pb-4">
                <div className="mx-auto mb-4">
                  <div className="h-14 w-14 rounded-full bg-amber-100 flex items-center justify-center">
                    <Key className="h-7 w-7 text-amber-600" />
                  </div>
                </div>
                <DialogTitle className="text-lg font-bold">
                  Save Your Recovery Codes
                </DialogTitle>
                <DialogDescription className="text-sm">
                  Use these codes if you lose access to your authenticator app
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800">
                      Save these codes somewhere safe. Each code can only be used once. You won&apos;t be able to see them again!
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-2">
                    {recoveryCodes.map((recoveryCode, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="font-mono text-sm bg-white border border-gray-200 rounded px-3 py-2 text-center"
                      >
                        {recoveryCode}
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleCopyRecoveryCodes}
                    variant="outline"
                    className="flex-1"
                  >
                    {recoveryCodesCopied ? (
                      <>
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleDownloadRecoveryCodes}
                    variant="outline"
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>

                <Button
                  onClick={() => setStep("success")}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/25"
                >
                  I&apos;ve Saved My Codes
                </Button>
              </div>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center py-4"
            >
              <div className="mx-auto mb-6 relative">
                <div className="absolute inset-0 rounded-full bg-green-500/20 blur-xl" />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="relative h-20 w-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-xl shadow-green-500/30 mx-auto"
                >
                  <CheckCircle2 className="h-10 w-10 text-white" />
                </motion.div>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                2FA Enabled!
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Your account is now protected with two-factor authentication
              </p>

              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-green-800">All Set!</p>
                    <p className="text-xs text-green-700">
                      Your recovery codes have been saved. Keep them in a safe place.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => onOpenChange(false)}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/25"
              >
                Done
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
