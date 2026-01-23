"use client";

import { motion } from "framer-motion";

interface AppStoreBadgesProps {
  className?: string;
  googlePlayUrl?: string;
  showComingSoon?: boolean;
}

export function AppStoreBadges({
  className = "",
  googlePlayUrl = "https://play.google.com/store/apps/details?id=nz.apprenticelog.app",
  showComingSoon = true,
}: AppStoreBadgesProps) {
  return (
    <div className={`flex flex-col sm:flex-row items-center gap-4 ${className}`}>
      {/* Google Play Store Badge */}
      <a
        href={googlePlayUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative"
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-3 bg-black text-white rounded-xl px-5 py-3 min-w-[180px] transition-shadow hover:shadow-lg"
        >
          {/* Google Play Icon */}
          <svg viewBox="0 0 24 24" className="h-8 w-8 flex-shrink-0" fill="currentColor">
            <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.303 2.303-8.633-8.635z" />
          </svg>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider opacity-80">Get it on</span>
            <span className="text-lg font-semibold -mt-0.5">Google Play</span>
          </div>
        </motion.div>
      </a>

      {/* Apple App Store Badge - Coming Soon */}
      {showComingSoon && (
        <div className="relative">
          <div className="flex items-center gap-3 bg-gray-100 text-gray-400 rounded-xl px-5 py-3 min-w-[180px] cursor-not-allowed border border-gray-200">
            {/* Apple Icon */}
            <svg viewBox="0 0 24 24" className="h-8 w-8 flex-shrink-0" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider">Coming Soon</span>
              <span className="text-lg font-semibold -mt-0.5">App Store</span>
            </div>
          </div>
          {/* Coming Soon Badge */}
          <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            Q1 2026
          </div>
        </div>
      )}
    </div>
  );
}

// Compact version for footer or smaller spaces
export function AppStoreBadgesCompact({
  className = "",
  googlePlayUrl = "https://play.google.com/store/apps/details?id=nz.apprenticelog.app",
}: {
  className?: string;
  googlePlayUrl?: string;
}) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <a
        href={googlePlayUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity"
        title="Download on Google Play"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6 block" fill="currentColor">
          <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.303 2.303-8.633-8.635z" />
        </svg>
      </a>
      <span
        className="flex items-center justify-center text-gray-400 cursor-not-allowed"
        title="Coming soon to App Store"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6 block" fill="currentColor">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
        </svg>
      </span>
    </div>
  );
}
