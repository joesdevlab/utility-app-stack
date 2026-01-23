"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Camera, ImagePlus, X, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import {
  compressImage,
  generatePhotoFilename,
  getPhotoStoragePath,
  isValidImageType,
  createThumbnail,
} from "@/lib/image-utils";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth-provider";

interface PhotoUploadProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
  disabled?: boolean;
}

interface PhotoPreview {
  path: string;
  thumbnailUrl: string;
  isUploading?: boolean;
  isDeleting?: boolean;
}

export function PhotoUpload({
  photos,
  onPhotosChange,
  maxPhotos = 5,
  disabled = false,
}: PhotoUploadProps) {
  const { user } = useAuth();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<PhotoPreview[]>([]);
  const [isLoadingPreviews, setIsLoadingPreviews] = useState(false);

  // Load thumbnails for existing photos
  const loadExistingPhotos = useCallback(async () => {
    if (photos.length === 0 || previews.length === photos.length) return;

    setIsLoadingPreviews(true);
    const newPreviews: PhotoPreview[] = [];

    for (const path of photos) {
      const { data } = await supabase.storage
        .from("entry-photos")
        .createSignedUrl(path, 3600);

      newPreviews.push({
        path,
        thumbnailUrl: data?.signedUrl || "",
      });
    }

    setPreviews(newPreviews);
    setIsLoadingPreviews(false);
  }, [photos, previews.length, supabase.storage]);

  // Load previews when photos change
  useState(() => {
    if (photos.length > 0 && previews.length === 0) {
      loadExistingPhotos();
    }
  });

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0 || !user) return;

    const remainingSlots = maxPhotos - photos.length;
    if (remainingSlots <= 0) {
      toast.error(`Maximum ${maxPhotos} photos allowed`);
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    const invalidFiles = filesToProcess.filter((f) => !isValidImageType(f));

    if (invalidFiles.length > 0) {
      toast.error("Only JPEG, PNG, WebP, and HEIC images are allowed");
      return;
    }

    for (const file of filesToProcess) {
      await uploadPhoto(file);
    }
  };

  const uploadPhoto = async (file: File) => {
    if (!user) return;

    const filename = generatePhotoFilename();
    const storagePath = getPhotoStoragePath(user.id, filename);

    // Add temporary preview
    const tempThumbnail = await createThumbnail(file);
    const tempPreview: PhotoPreview = {
      path: storagePath,
      thumbnailUrl: tempThumbnail,
      isUploading: true,
    };
    setPreviews((prev) => [...prev, tempPreview]);

    try {
      // Compress image
      const compressed = await compressImage(file, {
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 0.85,
        maxSizeMB: 1,
      });

      // Upload to Supabase Storage
      const { error } = await supabase.storage
        .from("entry-photos")
        .upload(storagePath, compressed, {
          contentType: "image/jpeg",
          upsert: false,
        });

      if (error) {
        throw error;
      }

      // Update previews to mark as uploaded
      setPreviews((prev) =>
        prev.map((p) =>
          p.path === storagePath ? { ...p, isUploading: false } : p
        )
      );

      // Add to photos array
      onPhotosChange([...photos, storagePath]);
      toast.success("Photo added");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload photo");

      // Remove failed preview
      setPreviews((prev) => prev.filter((p) => p.path !== storagePath));
    }
  };

  const deletePhoto = async (path: string) => {
    // Mark as deleting
    setPreviews((prev) =>
      prev.map((p) => (p.path === path ? { ...p, isDeleting: true } : p))
    );

    try {
      // Delete from storage
      const { error } = await supabase.storage
        .from("entry-photos")
        .remove([path]);

      if (error) {
        throw error;
      }

      // Remove from previews
      setPreviews((prev) => prev.filter((p) => p.path !== path));

      // Update photos array
      onPhotosChange(photos.filter((p) => p !== path));
      toast.success("Photo removed");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete photo");

      // Unmark as deleting
      setPreviews((prev) =>
        prev.map((p) => (p.path === path ? { ...p, isDeleting: false } : p))
      );
    }
  };

  const canAddMore = photos.length < maxPhotos && !disabled;

  return (
    <div className="space-y-3">
      {/* Photo previews grid */}
      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          <AnimatePresence mode="popLayout">
            {previews.map((preview) => (
              <motion.div
                key={preview.path}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative aspect-square rounded-xl overflow-hidden bg-gray-100"
              >
                {preview.thumbnailUrl ? (
                  <img
                    src={preview.thumbnailUrl}
                    alt="Entry photo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                  </div>
                )}

                {/* Loading overlay */}
                {(preview.isUploading || preview.isDeleting) && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  </div>
                )}

                {/* Delete button */}
                {!preview.isUploading && !preview.isDeleting && !disabled && (
                  <button
                    onClick={() => deletePhoto(preview.path)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center transition-colors"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Upload buttons */}
      {canAddMore && (
        <div className="flex gap-2">
          {/* Camera button */}
          <Button
            type="button"
            variant="outline"
            className="flex-1 h-11 rounded-xl border-orange-200 hover:border-orange-300 hover:bg-orange-50"
            onClick={() => cameraInputRef.current?.click()}
          >
            <Camera className="h-4 w-4 mr-2 text-orange-500" />
            Take Photo
          </Button>

          {/* Gallery button */}
          <Button
            type="button"
            variant="outline"
            className="flex-1 h-11 rounded-xl border-orange-200 hover:border-orange-300 hover:bg-orange-50"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImagePlus className="h-4 w-4 mr-2 text-orange-500" />
            Add from Gallery
          </Button>

          {/* Hidden file inputs */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
            multiple
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
        </div>
      )}

      {/* Photo count / limit indicator */}
      {photos.length > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          {photos.length} of {maxPhotos} photos
        </p>
      )}

      {/* Max photos reached message */}
      {photos.length >= maxPhotos && (
        <div className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
          <p className="text-xs text-amber-700">
            Maximum {maxPhotos} photos reached. Remove a photo to add more.
          </p>
        </div>
      )}
    </div>
  );
}
