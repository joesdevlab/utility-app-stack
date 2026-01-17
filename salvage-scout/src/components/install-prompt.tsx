"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useInstallPrompt } from "@/hooks/use-install-prompt";

const DISMISS_KEY = "install-prompt-dismissed";
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export function InstallPrompt() {
  const { canInstall, isInstalled, isIOS, promptInstall } = useInstallPrompt();
  const [isDismissed, setIsDismissed] = useState(true);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Check if user dismissed recently
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10);
      if (Date.now() - dismissedTime < DISMISS_DURATION) {
        setIsDismissed(true);
        return;
      }
    }
    setIsDismissed(false);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setIsDismissed(true);
    setShowIOSInstructions(false);
  };

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }

    const success = await promptInstall();
    if (success) {
      handleDismiss();
    }
  };

  // Don't show if installed or dismissed
  if (isInstalled || isDismissed || !canInstall) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-20 left-4 right-4 z-40 safe-area-bottom"
      >
        <Card className="border-amber-500/30 bg-background/95 backdrop-blur shadow-lg">
          <CardContent className="p-4">
            {showIOSInstructions ? (
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold">Install Salvage Scout</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 -mt-1 -mr-1"
                    onClick={handleDismiss}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <ol className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="flex-shrink-0 h-5 w-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center">1</span>
                    <span>Tap the <Share className="h-4 w-4 inline mx-1" /> Share button</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="flex-shrink-0 h-5 w-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center">2</span>
                    <span>Scroll down and tap &quot;Add to Home Screen&quot;</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="flex-shrink-0 h-5 w-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center">3</span>
                    <span>Tap &quot;Add&quot; to install</span>
                  </li>
                </ol>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={handleDismiss}
                >
                  Got it
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Download className="h-5 w-5 text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm">Install Salvage Scout</h3>
                  <p className="text-xs text-muted-foreground">
                    Add to your home screen for quick access
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleDismiss}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    className="bg-amber-500 hover:bg-amber-600"
                    onClick={handleInstall}
                  >
                    Install
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
