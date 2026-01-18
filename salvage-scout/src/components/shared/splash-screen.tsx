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
        <rect width="512" height="512" rx="96" fill="#f59e0b" />
        <path
          d="M256 128l-96 96h64v128h64v-128h64l-96-96z"
          fill="white"
        />
        <rect x="176" y="336" width="160" height="48" rx="8" fill="white" />
        <path
          d="M144 288l-32 32M368 288l32 32"
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
        Salvage Scout
      </h1>

      {/* Tagline */}
      <p
        style={{
          fontSize: "14px",
          color: "#a1a1aa",
          margin: "8px 0 0 0",
        }}
      >
        Free building materials nearby
      </p>

      {/* Loading indicator */}
      <div
        style={{
          marginTop: "32px",
          width: "32px",
          height: "32px",
          border: "3px solid #27272a",
          borderTopColor: "#f59e0b",
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
