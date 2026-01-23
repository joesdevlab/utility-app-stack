"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Key,
  Copy,
  Check,
  Download,
  AlertTriangle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

interface MFARecoveryCodesProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  codes?: string[];
  isGenerating?: boolean;
  onGenerateNew?: () => Promise<void>;
}

export function MFARecoveryCodes({
  open,
  onOpenChange,
  codes = [],
  isGenerating = false,
  onGenerateNew,
}: MFARecoveryCodesProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyAll = async () => {
    const codesText = codes.join("\n");
    await navigator.clipboard.writeText(codesText);
    setCopied(true);
    toast.success("Recovery codes copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const codesText = [
      "Apprentice Log - MFA Recovery Codes",
      "Generated: " + new Date().toLocaleString(),
      "",
      "Keep these codes in a safe place. Each code can only be used once.",
      "",
      ...codes.map((code, i) => `${i + 1}. ${code}`),
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
        <DialogHeader className="text-center pb-2">
          <div className="mx-auto mb-4">
            <div className="h-14 w-14 rounded-full bg-amber-100 flex items-center justify-center">
              <Key className="h-7 w-7 text-amber-600" />
            </div>
          </div>
          <DialogTitle className="text-xl font-bold">
            Recovery Codes
          </DialogTitle>
          <DialogDescription className="text-sm">
            Save these codes somewhere safe. You can use them to sign in if you
            lose access to your authenticator app.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium">Important!</p>
                <p>
                  Each code can only be used once. Store them securely - you
                  won&apos;t be able to see them again.
                </p>
              </div>
            </div>
          </div>

          {/* Codes Grid */}
          {codes.length > 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-2">
                {codes.map((code, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="font-mono text-sm bg-white border border-gray-200 rounded px-3 py-2 text-center"
                  >
                    {code}
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              {isGenerating ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                  <p className="text-sm text-gray-500">Generating codes...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <p className="text-sm text-gray-500">
                    No recovery codes generated yet
                  </p>
                  {onGenerateNew && (
                    <Button
                      onClick={onGenerateNew}
                      variant="outline"
                      size="sm"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Generate Codes
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          {codes.length > 0 && (
            <div className="flex gap-2">
              <Button
                onClick={handleCopyAll}
                variant="outline"
                className="flex-1"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy All
                  </>
                )}
              </Button>
              <Button
                onClick={handleDownload}
                variant="outline"
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          )}

          {/* Done Button */}
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full bg-orange-500 hover:bg-orange-600"
          >
            I&apos;ve Saved My Codes
          </Button>

          {/* Regenerate Option */}
          {codes.length > 0 && onGenerateNew && (
            <p className="text-center text-xs text-gray-500">
              Need new codes?{" "}
              <button
                onClick={onGenerateNew}
                className="text-orange-600 hover:text-orange-700 font-medium"
                disabled={isGenerating}
              >
                Generate new recovery codes
              </button>
              <br />
              (This will invalidate your existing codes)
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
