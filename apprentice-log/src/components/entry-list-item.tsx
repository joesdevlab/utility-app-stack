"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  ChevronRight,
  ChevronDown,
  MapPin,
  Pencil,
  Trash2,
  Wrench,
  BookOpen,
  ShieldCheck,
  ImageIcon,
} from "lucide-react";
import type { LogbookEntry } from "@/types";

interface EntryListItemProps {
  entry: LogbookEntry;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  onEdit?: (entry: LogbookEntry) => void;
  onDelete?: (entryId: string) => void;
}

export function EntryListItem({
  entry,
  isExpanded = false,
  onToggleExpand,
  onEdit,
  onDelete,
}: EntryListItemProps) {
  const formattedDate = new Date(entry.date).toLocaleDateString("en-NZ", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  // Get first task description as preview
  const taskPreview =
    entry.tasks.length > 0
      ? entry.tasks[0].description
      : entry.formattedEntry?.slice(0, 60) || "No description";

  const taskCount = entry.tasks.length;
  const hasPhotos = entry.photos && entry.photos.length > 0;
  const hasSafety = !!entry.safetyObservations;

  return (
    <motion.div
      layout
      className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-orange-200 hover:shadow-md transition-all"
    >
      {/* Collapsed Row - Gmail style */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer"
        onClick={onToggleExpand}
      >
        {/* Date */}
        <div className="w-16 shrink-0">
          <span className="text-sm font-medium text-gray-900">{formattedDate.split(",")[0]}</span>
          <span className="text-xs text-gray-500 block">{formattedDate.split(" ").slice(1).join(" ")}</span>
        </div>

        {/* Site name or task preview */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {entry.siteName && (
              <span className="text-sm font-medium text-gray-900 truncate">
                {entry.siteName}
              </span>
            )}
            {!entry.siteName && (
              <span className="text-sm text-gray-600 truncate">
                {taskPreview}
              </span>
            )}
          </div>
          {entry.siteName && (
            <p className="text-xs text-gray-500 truncate mt-0.5">
              {taskPreview}
            </p>
          )}
        </div>

        {/* Indicators */}
        <div className="flex items-center gap-2 shrink-0">
          {hasPhotos && (
            <ImageIcon className="h-4 w-4 text-gray-400" />
          )}
          {hasSafety && (
            <ShieldCheck className="h-4 w-4 text-green-500" />
          )}
          {taskCount > 1 && (
            <Badge variant="outline" className="text-xs px-1.5 py-0 h-5 bg-gray-50">
              {taskCount} tasks
            </Badge>
          )}
        </div>

        {/* Hours badge */}
        <Badge className="shrink-0 bg-orange-100 text-orange-700 border-0 font-semibold text-sm">
          <Clock className="h-3 w-3 mr-1" />
          {entry.totalHours}h
        </Badge>

        {/* Expand/collapse indicator */}
        <div className="text-gray-400">
          {isExpanded ? (
            <ChevronDown className="h-5 w-5" />
          ) : (
            <ChevronRight className="h-5 w-5" />
          )}
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-gray-50/50">
              {/* Location & Supervisor */}
              {(entry.siteName || entry.supervisor) && (
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  {entry.siteName && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{entry.siteName}</span>
                    </div>
                  )}
                  {entry.supervisor && (
                    <div className="flex items-center gap-1">
                      <span className="text-gray-400">Supervisor:</span>
                      <span>{entry.supervisor}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Tasks */}
              <div className="space-y-2">
                {entry.tasks.map((task, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg border border-gray-100 p-3"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-sm text-gray-800 flex-1">
                        {task.description}
                      </p>
                      <Badge
                        variant="outline"
                        className="shrink-0 text-xs border-orange-200 text-orange-600"
                      >
                        {task.hours}h
                      </Badge>
                    </div>
                    {(task.tools.length > 0 || task.skills.length > 0) && (
                      <div className="flex flex-wrap gap-1">
                        {task.tools.map((tool, i) => (
                          <Badge
                            key={`tool-${i}`}
                            variant="outline"
                            className="text-xs border-amber-200 bg-amber-50 text-amber-700"
                          >
                            <Wrench className="h-2.5 w-2.5 mr-0.5" />
                            {tool}
                          </Badge>
                        ))}
                        {task.skills.map((skill, i) => (
                          <Badge
                            key={`skill-${i}`}
                            variant="outline"
                            className="text-xs border-blue-200 bg-blue-50 text-blue-700"
                          >
                            <BookOpen className="h-2.5 w-2.5 mr-0.5" />
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Notes */}
              {entry.notes && (
                <div className="mt-3 text-sm text-gray-600 bg-white rounded-lg border border-gray-100 p-3">
                  <span className="font-medium">Notes: </span>
                  {entry.notes}
                </div>
              )}

              {/* Safety */}
              {entry.safetyObservations && (
                <div className="mt-3 flex items-start gap-2 bg-green-50 rounded-lg border border-green-100 p-3">
                  <ShieldCheck className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-green-700">
                      Safety Observations
                    </p>
                    <p className="text-sm text-green-700">
                      {entry.safetyObservations}
                    </p>
                  </div>
                </div>
              )}

              {/* Photo indicator */}
              {hasPhotos && (
                <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                  <ImageIcon className="h-4 w-4" />
                  <span>{entry.photos!.length} photo{entry.photos!.length !== 1 ? "s" : ""}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(entry);
                    }}
                    className="h-8 text-gray-600 hover:text-orange-600 hover:border-orange-200"
                  >
                    <Pencil className="h-3.5 w-3.5 mr-1.5" />
                    Edit
                  </Button>
                )}
                {onDelete && entry.id && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(entry.id!);
                    }}
                    className="h-8 text-gray-600 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                    Delete
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// View mode toggle component
export function ViewModeToggle({
  viewMode,
  onViewModeChange,
}: {
  viewMode: "list" | "card";
  onViewModeChange: (mode: "list" | "card") => void;
}) {
  return (
    <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
      <button
        onClick={() => onViewModeChange("list")}
        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
          viewMode === "list"
            ? "bg-white text-orange-600 shadow-sm"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        List
      </button>
      <button
        onClick={() => onViewModeChange("card")}
        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
          viewMode === "card"
            ? "bg-white text-orange-600 shadow-sm"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        Cards
      </button>
    </div>
  );
}
