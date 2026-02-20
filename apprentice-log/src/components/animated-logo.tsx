"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface AnimatedLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  isLoading?: boolean;
  showGlow?: boolean;
  className?: string;
}

const sizeMap = {
  sm: 32,
  md: 48,
  lg: 64,
  xl: 96,
};

export function AnimatedLogo({
  size = "md",
  isLoading = true,
  showGlow = true,
  className = "",
}: AnimatedLogoProps) {
  const pixelSize = sizeMap[size];

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: pixelSize, height: pixelSize }}
    >
      {/* Rotating gradient glow ring */}
      {showGlow && isLoading && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: "conic-gradient(from 0deg, transparent, #f97316, #fbbf24, transparent)",
            filter: "blur(8px)",
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      )}

      {/* Pulsing backdrop glow */}
      {showGlow && isLoading && (
        <motion.div
          className="absolute inset-0 rounded-full bg-orange-500/30"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}

      {/* Logo container */}
      <motion.div
        className="relative z-10 rounded-full bg-white/90 p-1 shadow-lg"
        animate={
          isLoading
            ? {
                scale: [1, 1.05, 1],
                y: [0, -2, 0],
              }
            : {}
        }
        transition={{
          duration: 1.2,
          repeat: isLoading ? Infinity : 0,
          ease: "easeInOut",
        }}
        style={{ width: pixelSize, height: pixelSize }}
      >
        <Image
          src="/Logo-v1-128-128.png"
          alt="Apprentice Log"
          width={pixelSize - 8}
          height={pixelSize - 8}
          className="rounded-full"
          priority
        />
      </motion.div>
    </div>
  );
}

// Simpler loading variant for inline use
export function LogoSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const pixelSize = sizeMap[size];

  return (
    <div className="flex flex-col items-center gap-3">
      <AnimatedLogo size={size} isLoading showGlow />
      <motion.div
        className="flex gap-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-orange-500"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.15,
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}

// Full-page loading screen
export function LoadingScreen({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <LogoSpinner size="lg" />
      <motion.p
        className="mt-4 text-sm text-muted-foreground"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {message}
      </motion.p>
    </div>
  );
}
