"use client";

import { useEffect, useState } from "react";

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Start fade-out after hydration
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, 100);

    // Remove from DOM after animation
    const removeTimer = setTimeout(() => {
      setIsVisible(false);
    }, 600);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0a0a0a",
        opacity: isFading ? 0 : 1,
        transition: "opacity 0.5s ease-out",
        pointerEvents: isFading ? "none" : "auto",
      }}
    >
      {/* App Icon */}
      <svg
        width="80"
        height="80"
        viewBox="0 0 512 512"
        style={{ marginBottom: "24px" }}
      >
        <rect width="512" height="512" rx="96" fill="#3b82f6" />
        <path
          d="M256 120c-75 0-136 61-136 136s61 136 136 136 136-61 136-136-61-136-136-136zm0 240c-57.4 0-104-46.6-104-104s46.6-104 104-104 104 46.6 104 104-46.6 104-104 104z"
          fill="white"
        />
        <circle cx="256" cy="256" r="48" fill="white" />
        <path
          d="M256 168v-32M256 376v-32M344 256h32M136 256h32"
          stroke="white"
          strokeWidth="24"
          strokeLinecap="round"
        />
      </svg>

      {/* App Name */}
      <h1
        style={{
          fontSize: "24px",
          fontWeight: 600,
          color: "white",
          margin: 0,
          letterSpacing: "-0.02em",
        }}
      >
        Apprentice Log
      </h1>

      {/* Tagline */}
      <p
        style={{
          fontSize: "14px",
          color: "#a1a1aa",
          margin: "8px 0 0 0",
        }}
      >
        Voice-to-logbook for apprentices
      </p>

      {/* Loading indicator */}
      <div
        style={{
          marginTop: "32px",
          width: "32px",
          height: "32px",
          border: "3px solid #27272a",
          borderTopColor: "#3b82f6",
          borderRadius: "50%",
          animation: "splash-spin 1s linear infinite",
        }}
      />

      <style>{`
        @keyframes splash-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
