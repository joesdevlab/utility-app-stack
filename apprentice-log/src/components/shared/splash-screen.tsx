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
        backgroundColor: "#ffffff",
        opacity: isFading ? 0 : 1,
        transition: "opacity 0.5s ease-out",
        pointerEvents: isFading ? "none" : "auto",
      }}
    >
      {/* App Icon - Hard Hat */}
      <div
        style={{
          width: "80px",
          height: "80px",
          borderRadius: "20px",
          background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "24px",
          boxShadow: "0 10px 25px -5px rgba(249, 115, 22, 0.3)",
        }}
      >
        <svg
          width="44"
          height="44"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2 18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v2z" />
          <path d="M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5" />
          <path d="M4 15v-3a6 6 0 0 1 6-6h0" />
          <path d="M14 6h0a6 6 0 0 1 6 6v3" />
        </svg>
      </div>

      {/* App Name */}
      <h1
        style={{
          fontSize: "24px",
          fontWeight: 700,
          color: "#111827",
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
          color: "#6b7280",
          margin: "8px 0 0 0",
        }}
      >
        Voice-to-logbook for NZ apprentices
      </p>

      {/* Loading indicator */}
      <div
        style={{
          marginTop: "32px",
          width: "32px",
          height: "32px",
          border: "3px solid #fed7aa",
          borderTopColor: "#f97316",
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
