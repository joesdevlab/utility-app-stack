"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";

interface AudioWaveformProps {
  audioLevel: number; // 0-1
  isRecording: boolean;
  barCount?: number;
  variant?: "bars" | "dots";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeConfig = {
  sm: { barWidth: 3, gap: 2, maxHeight: 20 },
  md: { barWidth: 4, gap: 3, maxHeight: 32 },
  lg: { barWidth: 6, gap: 4, maxHeight: 48 },
};

export function AudioWaveform({
  audioLevel,
  isRecording,
  barCount = 7,
  variant = "bars",
  size = "md",
  className = "",
}: AudioWaveformProps) {
  const [barHeights, setBarHeights] = useState<number[]>(
    Array(barCount).fill(0.15)
  );
  const animationRef = useRef<number | undefined>(undefined);
  const { barWidth, gap, maxHeight } = sizeConfig[size];

  useEffect(() => {
    if (!isRecording) {
      // Reset to idle state
      setBarHeights(Array(barCount).fill(0.15));
      return;
    }

    const updateBars = () => {
      setBarHeights((prev) =>
        prev.map((_, index) => {
          // Create natural wave effect - middle bars are taller
          const center = (barCount - 1) / 2;
          const distanceFromCenter = Math.abs(index - center);
          const baseMultiplier = 1 - (distanceFromCenter / center) * 0.4;

          // Add randomness for natural feel
          const noise = 0.7 + Math.random() * 0.6;

          // Combine audio level with position-based multiplier
          const height = Math.max(
            0.15,
            Math.min(1, audioLevel * baseMultiplier * noise)
          );

          return height;
        })
      );

      animationRef.current = requestAnimationFrame(updateBars);
    };

    // Start animation loop
    animationRef.current = requestAnimationFrame(updateBars);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRecording, audioLevel, barCount]);

  const totalWidth = barCount * barWidth + (barCount - 1) * gap;

  if (variant === "dots") {
    return (
      <div className={`flex items-center justify-center gap-2 ${className}`}>
        {barHeights.map((height, i) => (
          <motion.div
            key={i}
            className="rounded-full bg-gradient-to-t from-orange-600 to-orange-400"
            animate={{
              scale: isRecording ? 0.5 + height * 0.8 : 0.5,
              opacity: isRecording ? 0.6 + height * 0.4 : 0.4,
            }}
            transition={{ duration: 0.05, ease: "linear" }}
            style={{
              width: barWidth * 1.5,
              height: barWidth * 1.5,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`flex items-end justify-center ${className}`}
      style={{ width: totalWidth, height: maxHeight }}
    >
      {barHeights.map((height, i) => (
        <motion.div
          key={i}
          className="rounded-full bg-gradient-to-t from-orange-600 to-orange-400"
          animate={{
            height: isRecording ? height * maxHeight : maxHeight * 0.15,
            opacity: isRecording ? 0.7 + height * 0.3 : 0.4,
          }}
          transition={{ duration: 0.05, ease: "linear" }}
          style={{
            width: barWidth,
            marginLeft: i > 0 ? gap : 0,
            minHeight: maxHeight * 0.15,
          }}
        />
      ))}
    </div>
  );
}

// Larger, more prominent waveform for the recording screen
export function RecordingWaveform({
  audioLevel,
  isRecording,
}: {
  audioLevel: number;
  isRecording: boolean;
}) {
  return (
    <motion.div
      className="flex flex-col items-center gap-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <AudioWaveform
        audioLevel={audioLevel}
        isRecording={isRecording}
        barCount={9}
        size="lg"
      />
      {isRecording && (
        <motion.p
          className="text-xs text-orange-600 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Listening...
        </motion.p>
      )}
    </motion.div>
  );
}

// Compact inline waveform for status indicators
export function MiniWaveform({
  isActive,
  className = "",
}: {
  isActive: boolean;
  className?: string;
}) {
  const [level, setLevel] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setLevel(0);
      return;
    }

    const interval = setInterval(() => {
      setLevel(0.3 + Math.random() * 0.7);
    }, 100);

    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <AudioWaveform
      audioLevel={level}
      isRecording={isActive}
      barCount={5}
      size="sm"
      className={className}
    />
  );
}
