"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ImageIcon, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface PhotoGalleryProps {
  photos: string[];
  showCount?: boolean;
  maxVisible?: number;
}

interface SignedPhoto {
  path: string;
  url: string;
}

export function PhotoGallery({
  photos,
  showCount = true,
  maxVisible = 3,
}: PhotoGalleryProps) {
  const [signedPhotos, setSignedPhotos] = useState<SignedPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const supabase = createClient();

  // Load signed URLs for photos
  const loadPhotos = useCallback(async () => {
    if (photos.length === 0) {
      setSignedPhotos([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const signed: SignedPhoto[] = [];

    for (const path of photos) {
      const { data } = await supabase.storage
        .from("entry-photos")
        .createSignedUrl(path, 3600); // 1 hour expiry

      if (data?.signedUrl) {
        signed.push({ path, url: data.signedUrl });
      }
    }

    setSignedPhotos(signed);
    setIsLoading(false);
  }, [photos, supabase.storage]);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  if (photos.length === 0) return null;

  const visiblePhotos = signedPhotos.slice(0, maxVisible);
  const remainingCount = photos.length - maxVisible;

  return (
    <>
      {/* Thumbnail grid */}
      <div className="flex items-center gap-2 mt-3">
        <div className="flex items-center gap-1 text-muted-foreground mr-1">
          <ImageIcon className="h-3.5 w-3.5" />
        </div>

        {isLoading ? (
          <div className="flex gap-1">
            {Array.from({ length: Math.min(photos.length, maxVisible) }).map(
              (_, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-lg bg-gray-100 animate-pulse"
                />
              )
            )}
          </div>
        ) : (
          <div className="flex gap-1">
            {visiblePhotos.map((photo, index) => (
              <button
                key={photo.path}
                onClick={() => setLightboxIndex(index)}
                className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 hover:ring-2 hover:ring-orange-500 transition-all"
              >
                <img
                  src={photo.url}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}

            {remainingCount > 0 && (
              <button
                onClick={() => setLightboxIndex(maxVisible - 1)}
                className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600 hover:bg-gray-200 transition-colors"
              >
                +{remainingCount}
              </button>
            )}
          </div>
        )}

        {showCount && (
          <span className="text-xs text-muted-foreground ml-1">
            {photos.length} photo{photos.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <PhotoLightbox
            photos={signedPhotos}
            initialIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

interface PhotoLightboxProps {
  photos: SignedPhoto[];
  initialIndex: number;
  onClose: () => void;
}

function PhotoLightbox({ photos, initialIndex, onClose }: PhotoLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  }, [photos.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  }, [photos.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goToNext();
      if (e.key === "ArrowLeft") goToPrev();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, goToNext, goToPrev]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const currentPhoto = photos[currentIndex];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
      >
        <X className="h-6 w-6 text-white" />
      </button>

      {/* Previous button */}
      {photos.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            goToPrev();
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          <ChevronLeft className="h-6 w-6 text-white" />
        </button>
      )}

      {/* Next button */}
      {photos.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            goToNext();
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          <ChevronRight className="h-6 w-6 text-white" />
        </button>
      )}

      {/* Image */}
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className="max-w-[90vw] max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {currentPhoto ? (
          <img
            src={currentPhoto.url}
            alt={`Photo ${currentIndex + 1}`}
            className="max-w-full max-h-[85vh] object-contain rounded-lg"
          />
        ) : (
          <div className="w-64 h-64 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        )}
      </motion.div>

      {/* Photo counter */}
      {photos.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 rounded-full px-4 py-2">
          <span className="text-white text-sm">
            {currentIndex + 1} / {photos.length}
          </span>
        </div>
      )}

      {/* Thumbnail strip */}
      {photos.length > 1 && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2">
          {photos.map((photo, index) => (
            <button
              key={photo.path}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
              }}
              className={`w-12 h-12 rounded-lg overflow-hidden transition-all ${
                index === currentIndex
                  ? "ring-2 ring-orange-500 opacity-100"
                  : "opacity-50 hover:opacity-75"
              }`}
            >
              <img
                src={photo.url}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}
