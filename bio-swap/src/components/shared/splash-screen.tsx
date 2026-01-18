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
        <rect width="512" height="512" rx="96" fill="#22c55e" />
        <path
          d="M160 256c0-53 43-96 96-96h0c53 0 96 43 96 96v96h-48v-96c0-26.5-21.5-48-48-48s-48 21.5-48 48v96h-48v-96z"
          fill="white"
        />
        <circle cx="256" cy="176" r="32" fill="white" />
        <path
          d="M208 352h96v32h-96z"
          fill="white"
        />
        <path
          d="M352 256l32-32M352 256l32 32M160 256l-32-32M160 256l-32 32"
          stroke="white"
          strokeWidth="16"
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
        Bio-Swap
      </h1>

      {/* Tagline */}
      <p
        style={{
          fontSize: "14px",
          color: "#a1a1aa",
          margin: "8px 0 0 0",
        }}
      >
        Find cheaper generic medicines
      </p>

      {/* Loading indicator */}
      <div
        style={{
          marginTop: "32px",
          width: "32px",
          height: "32px",
          border: "3px solid #27272a",
          borderTopColor: "#22c55e",
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
