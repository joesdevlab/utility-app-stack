"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, FlashlightOff, Flashlight, ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

// Supported barcode formats for medicine scanning
// NZ medicines primarily use EAN-13, but we support other common formats
const SUPPORTED_FORMATS = [
  Html5QrcodeSupportedFormats.EAN_13,
  Html5QrcodeSupportedFormats.EAN_8,
  Html5QrcodeSupportedFormats.UPC_A,
  Html5QrcodeSupportedFormats.UPC_E,
  Html5QrcodeSupportedFormats.CODE_128,
  Html5QrcodeSupportedFormats.CODE_39,
];

/**
 * Validates that a barcode is in an acceptable format
 * Returns true if the barcode format is valid for medicine lookup
 */
function isValidBarcodeFormat(barcode: string): boolean {
  // EAN-13: 13 digits
  if (/^\d{13}$/.test(barcode)) return true;
  // EAN-8: 8 digits
  if (/^\d{8}$/.test(barcode)) return true;
  // UPC-A: 12 digits
  if (/^\d{12}$/.test(barcode)) return true;
  // UPC-E: 6-8 digits
  if (/^\d{6,8}$/.test(barcode)) return true;
  // CODE-128/CODE-39: alphanumeric, typically used for pharmacy codes
  if (/^[A-Z0-9]{6,20}$/i.test(barcode)) return true;

  return false;
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const [isStarted, setIsStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      const scanner = new Html5Qrcode("barcode-reader", {
        formatsToSupport: SUPPORTED_FORMATS,
        verbose: false,
      });
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 280, height: 120 },
          aspectRatio: 1.777,
        },
        (decodedText) => {
          // Validate barcode format before accepting
          if (!isValidBarcodeFormat(decodedText)) {
            toast.error("Invalid barcode format. Please scan a medicine barcode.");
            return;
          }

          // Haptic feedback
          if ("vibrate" in navigator) {
            navigator.vibrate(50);
          }
          onScan(decodedText);
          stopScanner();
        },
        () => {
          // Ignore barcode not found errors
        }
      );

      setIsStarted(true);

      // Check if torch is available
      const capabilities = scanner.getRunningTrackCameraCapabilities();
      if (capabilities.torchFeature().isSupported()) {
        setHasTorch(true);
      }
    } catch {
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

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessingImage(true);
    setError(null);

    try {
      // Stop camera scanner if running
      await stopScanner();

      // Create a new scanner instance for file scanning
      const scanner = new Html5Qrcode("barcode-reader-file", {
        formatsToSupport: SUPPORTED_FORMATS,
        verbose: false,
      });

      const result = await scanner.scanFile(file, true);

      if (!isValidBarcodeFormat(result)) {
        toast.error("Invalid barcode format. Please upload a medicine barcode image.");
        setIsProcessingImage(false);
        // Clear the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      // Haptic feedback
      if ("vibrate" in navigator) {
        navigator.vibrate(50);
      }

      scanner.clear();
      onScan(result);
    } catch {
      toast.error("Could not read barcode from image. Please try a clearer image.");
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } finally {
      setIsProcessingImage(false);
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
            <div className="flex flex-col gap-3 w-full max-w-xs">
              <Button
                className="w-full bg-emerald-500 hover:bg-emerald-600"
                onClick={startScanner}
              >
                Try Again
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessingImage}
              >
                {isProcessingImage ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Upload Barcode Image
                  </>
                )}
              </Button>
              <Button variant="ghost" className="w-full text-white/70" onClick={handleClose}>
                Cancel
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden file input for image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
      {/* Hidden container for file scanning */}
      <div id="barcode-reader-file" className="hidden" />

      {/* Instructions and Upload Button */}
      <div className="absolute bottom-0 left-0 right-0 p-6 safe-area-bottom space-y-3">
        <p className="text-white/80 text-center text-sm">
          Point camera at medicine barcode (EAN-13)
        </p>
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessingImage}
          >
            {isProcessingImage ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <ImageIcon className="h-4 w-4 mr-2" />
                Upload Image
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
