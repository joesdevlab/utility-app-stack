"use client";

export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-blue-500 focus:text-white focus:rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
    >
      Skip to main content
    </a>
  );
}
