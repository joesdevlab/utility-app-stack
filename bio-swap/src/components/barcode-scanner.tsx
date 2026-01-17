"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, FlashlightOff, Flashlight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const [isStarted, setIsStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch {
        // Ignore errors when stopping
      }
      scannerRef.current = null;
    }
  }, []);

  const startScanner = useCallback(async () => {
    if (!containerRef.current) return;

    try {
      setError(null);
      const scanner = new Html5Qrcode("barcode-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 150 },
          aspectRatio: 1.777,
        },
        (decodedText) => {
          // Haptic feedback
          if ("vibrate" in navigator) {
            navigator.vibrate(50);
          }
          onScan(decodedText);
          stopScanner();
        },
        () => {
          // Ignore QR code not found errors
        }
      );

      setIsStarted(true);

      // Check if torch is available
      const capabilities = scanner.getRunningTrackCameraCapabilities();
      if (capabilities.torchFeature().isSupported()) {
        setHasTorch(true);
      }
    } catch (err) {
      console.error("Scanner error:", err);
      setError("Could not access camera. Please check permissions.");
    }
  }, [onScan, stopScanner]);

  const toggleTorch = async () => {
    if (scannerRef.current && hasTorch) {
      try {
        const capabilities = scannerRef.current.getRunningTrackCameraCapabilities();
        const torch = capabilities.torchFeature();
        await torch.apply(!torchOn);
        setTorchOn(!torchOn);
      } catch {
        // Ignore torch errors
      }
    }
  };

  useEffect(() => {
    startScanner();
    return () => {
      stopScanner();
    };
  }, [startScanner, stopScanner]);

  const handleClose = () => {
    stopScanner();
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black"
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 safe-area-top">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={handleClose}
        >
          <X className="h-6 w-6" />
        </Button>
        <span className="text-white font-medium">Scan Barcode</span>
        {hasTorch ? (
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={toggleTorch}
          >
            {torchOn ? (
              <Flashlight className="h-6 w-6" />
            ) : (
              <FlashlightOff className="h-6 w-6" />
            )}
          </Button>
        ) : (
          <div className="w-10" />
        )}
      </div>

      {/* Scanner Container */}
      <div
        ref={containerRef}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div
          id="barcode-reader"
          className="w-full h-full scanner-viewfinder"
        />
        {isStarted && <div className="scan-line" />}
      </div>

      {/* Error State */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 p-8"
          >
            <Camera className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-white text-center mb-4">{error}</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                className="bg-emerald-500 hover:bg-emerald-600"
                onClick={startScanner}
              >
                Try Again
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      <div className="absolute bottom-0 left-0 right-0 p-6 safe-area-bottom">
        <p className="text-white/80 text-center text-sm">
          Point camera at medicine barcode
        </p>
      </div>
    </motion.div>
  );
}
