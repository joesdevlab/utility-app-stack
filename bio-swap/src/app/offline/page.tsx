"use client";

import { motion } from "framer-motion";
import { WifiOff, RefreshCw, Pill } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm"
      >
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              <WifiOff className="h-8 w-8 text-muted-foreground" />
            </div>
            <h1 className="text-xl font-semibold mb-2">You&apos;re offline</h1>
            <p className="text-muted-foreground mb-6">
              Check your internet connection and try again. Your recent scans are still available.
            </p>
            <div className="space-y-3">
              <Button
                className="w-full bg-emerald-500 hover:bg-emerald-600"
                onClick={handleRetry}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.history.back()}
              >
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Pill className="h-5 w-5 text-emerald-500" />
            <span className="font-medium">Bio-Swap</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
