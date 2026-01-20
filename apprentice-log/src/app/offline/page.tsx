"use client";

import { motion } from "framer-motion";
import { WifiOff, RefreshCw, HardHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm"
      >
        <Card className="border-gray-200 shadow-lg">
          <CardContent className="pt-6 text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center">
              <WifiOff className="h-8 w-8 text-orange-600" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">You&apos;re offline</h1>
            <p className="text-gray-600 mb-6">
              Check your internet connection and try again. Your draft entries are saved locally.
            </p>
            <div className="space-y-3">
              <Button
                className="w-full bg-orange-500 hover:bg-orange-600 text-white shadow-md"
                onClick={handleRetry}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button
                variant="outline"
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                onClick={() => window.history.back()}
              >
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-md">
              <HardHat className="h-4 w-4 text-white" />
            </div>
            <span className="font-medium text-gray-700">Apprentice Log</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
