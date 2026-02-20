"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Mic, ArrowRight, Play, Volume2, VolumeX } from "lucide-react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

interface TradeVideoHeroProps {
  videoSrc: string;
  fallbackImage: string;
  badgeIcon: LucideIcon;
  badgeText: string;
  title: string;
  highlight: string;
  description: string;
}

export function TradeVideoHero({
  videoSrc,
  fallbackImage,
  badgeIcon: BadgeIcon,
  badgeText,
  title,
  highlight,
  description,
}: TradeVideoHeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showPlayButton, setShowPlayButton] = useState(true);

  // Check if user prefers reduced motion
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Auto-play video when loaded (muted for autoplay policy)
  useEffect(() => {
    if (videoRef.current && isVideoLoaded && !prefersReducedMotion) {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
        setShowPlayButton(false);
      }).catch(() => {
        // Autoplay blocked, show play button
        setShowPlayButton(true);
      });
    }
  }, [isVideoLoaded, prefersReducedMotion]);

  const handlePlayClick = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
        setShowPlayButton(false);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <section className="relative h-[85vh] min-h-[600px] max-h-[900px] overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0">
        {/* Fallback Image (shown while video loads or on reduced motion) */}
        <img
          src={fallbackImage}
          alt=""
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            isVideoLoaded && !prefersReducedMotion ? "opacity-0" : "opacity-100"
          }`}
        />

        {/* Video Element */}
        {!prefersReducedMotion && (
          <video
            ref={videoRef}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              isVideoLoaded ? "opacity-100" : "opacity-0"
            }`}
            loop
            muted={isMuted}
            playsInline
            preload="auto"
            onCanPlayThrough={() => setIsVideoLoaded(true)}
            onLoadedData={() => setIsVideoLoaded(true)}
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/75 to-gray-900/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 rounded-full px-4 py-2 mb-6"
            >
              <BadgeIcon className="h-4 w-4 text-orange-400" />
              <span className="text-orange-300 text-sm font-semibold">{badgeText}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"
            >
              {title}{" "}
              <span className="text-orange-400">{highlight}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-300 mb-8 leading-relaxed"
            >
              {description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <Link href="/app">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white text-lg px-8 py-6 rounded-xl shadow-lg shadow-orange-500/25">
                  <Mic className="h-5 w-5 mr-2" />
                  Start Free Trial
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Video Controls (bottom right) */}
      {!prefersReducedMotion && isVideoLoaded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-6 right-6 z-20 flex items-center gap-2"
        >
          {/* Play/Pause Button (only show if not autoplaying) */}
          {showPlayButton && (
            <button
              onClick={handlePlayClick}
              className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              aria-label={isPlaying ? "Pause video" : "Play video"}
            >
              <Play className={`h-5 w-5 ${isPlaying ? "hidden" : ""}`} fill="currentColor" />
              {isPlaying && (
                <div className="flex gap-1">
                  <div className="w-1 h-4 bg-white rounded-full" />
                  <div className="w-1 h-4 bg-white rounded-full" />
                </div>
              )}
            </button>
          )}

          {/* Mute/Unmute Button */}
          <button
            onClick={toggleMute}
            className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            aria-label={isMuted ? "Unmute video" : "Mute video"}
          >
            {isMuted ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </button>
        </motion.div>
      )}

      {/* Loading indicator */}
      {!isVideoLoaded && !prefersReducedMotion && (
        <div className="absolute bottom-6 right-6 z-20">
          <div className="w-10 h-10 rounded-full border-2 border-white/20 border-t-white/80 animate-spin" />
        </div>
      )}
    </section>
  );
}
