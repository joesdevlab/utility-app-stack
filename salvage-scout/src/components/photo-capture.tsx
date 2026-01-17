"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, RotateCcw, Check, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PhotoCaptureProps {
  onCapture: (imageData: string) => void;
  onClose: () => void;
}

export function PhotoCapture({ onCapture, onClose }: PhotoCaptureProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = useCallback(async () => {
    try {
      setError(null);

      // Stop existing stream first
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch {
      setError("Could not access camera. Please check permissions.");
    }
  }, [facingMode, stream]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0);

      // Get image data as base64
      const imageData = canvas.toDataURL("image/jpeg", 0.8);
      setCapturedImage(imageData);

      // Haptic feedback
      if ("vibrate" in navigator) {
        navigator.vibrate(50);
      }
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleConfirm = () => {
    if (capturedImage) {
      stopCamera();
      onCapture(capturedImage);
    }
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  const handleFlip = () => {
    setFacingMode(prev => prev === "environment" ? "user" : "environment");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        setCapturedImage(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black"
    >
      {/* Hidden canvas for image capture */}
      <canvas ref={canvasRef} className="hidden" />

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
        <span className="text-white font-medium">
          {capturedImage ? "Review Photo" : "Take Photo"}
        </span>
        <div className="w-10" />
      </div>

      {/* Camera Preview or Captured Image */}
      <div className="absolute inset-0 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {capturedImage ? (
            <motion.img
              key="captured"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={capturedImage}
              alt="Captured material"
              className="w-full h-full object-contain"
            />
          ) : (
            <motion.video
              key="video"
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          )}
        </AnimatePresence>
      </div>

      {/* Error State */}
      <AnimatePresence>
        {error && !capturedImage && (
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
                className="bg-amber-500 hover:bg-amber-600"
                onClick={startCamera}
              >
                Try Again
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-6 safe-area-bottom">
        {capturedImage ? (
          <div className="flex items-center justify-center gap-6">
            <Button
              variant="outline"
              size="lg"
              className="h-14 px-6 bg-white/10 border-white/30 text-white hover:bg-white/20"
              onClick={handleRetake}
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              Retake
            </Button>
            <Button
              size="lg"
              className="h-14 px-8 bg-amber-500 hover:bg-amber-600 text-white"
              onClick={handleConfirm}
            >
              <Check className="h-5 w-5 mr-2" />
              Use Photo
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-6">
            {/* Upload button */}
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
                <ImageIcon className="h-6 w-6" />
              </div>
            </label>

            {/* Capture button */}
            <button
              onClick={handleCapture}
              disabled={!stream}
              className="h-20 w-20 rounded-full bg-white flex items-center justify-center disabled:opacity-50 touch-target no-select active:scale-95 transition-transform"
            >
              <div className="h-16 w-16 rounded-full border-4 border-amber-500" />
            </button>

            {/* Flip camera button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-full text-white hover:bg-white/20"
              onClick={handleFlip}
            >
              <RotateCcw className="h-6 w-6" />
            </Button>
          </div>
        )}

        {!capturedImage && (
          <p className="text-white/60 text-center text-sm mt-4">
            Take a photo of the materials you&apos;re giving away
          </p>
        )}
      </div>
    </motion.div>
  );
}
