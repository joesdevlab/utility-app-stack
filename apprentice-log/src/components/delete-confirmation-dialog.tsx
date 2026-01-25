"use client";

import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";

interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  variant?: "single" | "all";
  entryPreview?: {
    date?: string;
    hours?: number;
    siteName?: string;
  };
}

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  title = "Delete Entry?",
  description = "This will permanently delete this entry. This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
  isLoading = false,
  variant = "single",
  entryPreview,
}: DeleteConfirmationDialogProps) {
  const handleConfirm = () => {
    // Haptic feedback on mobile
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton={!isLoading}>
        <DialogHeader>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-100"
          >
            {variant === "all" ? (
              <AlertTriangle className="h-7 w-7 text-rose-600" />
            ) : (
              <Trash2 className="h-7 w-7 text-rose-600" />
            )}
          </motion.div>
          <DialogTitle className="text-center text-xl">
            {title}
          </DialogTitle>
          <DialogDescription className="text-center">
            {description}
          </DialogDescription>
        </DialogHeader>

        {/* Entry Preview for single deletions */}
        {variant === "single" && entryPreview && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-4 rounded-lg bg-gray-50 p-3 text-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-gray-600">
                {entryPreview.date || "Unknown date"}
              </span>
              {entryPreview.hours && (
                <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
                  {entryPreview.hours}h
                </span>
              )}
            </div>
            {entryPreview.siteName && (
              <p className="mt-1 text-gray-500 truncate">
                {entryPreview.siteName}
              </p>
            )}
          </motion.div>
        )}

        {/* Warning for delete all */}
        {variant === "all" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-4 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm"
          >
            <div className="flex gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-amber-800">
                This will delete all your logbook entries. Make sure you have exported any important data first.
              </p>
            </div>
          </motion.div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="flex-1 sm:flex-none"
          >
            {cancelText}
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 sm:flex-none bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 shadow-lg shadow-rose-500/25"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                {confirmText}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
