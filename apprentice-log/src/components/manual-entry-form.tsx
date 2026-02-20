"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Save, Loader2, Camera, Calendar, MapPin, User, ClipboardList, FileText, ShieldCheck, Wrench, BookOpen, Clock } from "lucide-react";
import type { LogbookTask, LogbookEntry } from "@/types";
import { PhotoUpload } from "./photo-upload";

interface ManualEntryFormProps {
  onSubmit: (entry: Omit<LogbookEntry, "id" | "createdAt">) => void;
  isProcessing: boolean;
}

export function ManualEntryForm({ onSubmit, isProcessing }: ManualEntryFormProps) {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [tasks, setTasks] = useState<LogbookTask[]>([
    { description: "", hours: 0, tools: [], skills: [] },
  ]);
  const [notes, setNotes] = useState("");
  const [safetyObservations, setSafetyObservations] = useState("");
  const [siteName, setSiteName] = useState("");
  const [supervisor, setSupervisor] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);

  const handleAddTask = () => {
    setTasks([...tasks, { description: "", hours: 0, tools: [], skills: [] }]);
  };

  const handleRemoveTask = (index: number) => {
    if (tasks.length > 1) {
      setTasks(tasks.filter((_, i) => i !== index));
    }
  };

  const handleUpdateTask = (
    index: number,
    field: keyof LogbookTask,
    value: string | number | string[]
  ) => {
    const newTasks = [...tasks];
    newTasks[index] = { ...newTasks[index], [field]: value };
    setTasks(newTasks);
  };

  const handleToolsChange = (index: number, value: string) => {
    const tools = value
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    handleUpdateTask(index, "tools", tools);
  };

  const handleSkillsChange = (index: number, value: string) => {
    const skills = value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    handleUpdateTask(index, "skills", skills);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validTasks = tasks.filter((t) => t.description.trim());
    if (validTasks.length === 0) {
      return;
    }

    const totalHours = validTasks.reduce((sum, t) => sum + (t.hours || 0), 0);

    // Generate a formatted entry summary from tasks
    const taskSummaries = validTasks.map((t) => {
      const hours = t.hours ? ` (${t.hours}h)` : "";
      return `${t.description}${hours}`;
    });
    const formattedEntry = `Completed ${totalHours} hours of work: ${taskSummaries.join("; ")}.${
      safetyObservations ? ` Safety: ${safetyObservations}.` : ""
    }`;

    const entry: Omit<LogbookEntry, "id" | "createdAt"> = {
      date,
      tasks: validTasks,
      formattedEntry,
      totalHours,
      notes: notes || undefined,
      safetyObservations: safetyObservations || undefined,
      siteName: siteName || undefined,
      supervisor: supervisor || undefined,
      photos: photos.length > 0 ? photos : undefined,
    };

    onSubmit(entry);
  };

  const totalHours = tasks.reduce((sum, t) => sum + (t.hours || 0), 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full">
      {/* Date & Location Card */}
      <Card className="border-gray-200 shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3">
          <div className="flex items-center gap-2 text-white">
            <Calendar className="h-4 w-4" />
            <span className="text-sm font-semibold">Entry Details</span>
          </div>
        </div>
        <CardContent className="pt-4 space-y-4">
          {/* Date */}
          <div className="space-y-1.5">
            <Label htmlFor="date" className="text-xs font-semibold text-gray-500">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="h-11 rounded-xl border-gray-200 focus:border-blue-300 focus:ring-blue-200"
            />
          </div>

          {/* Site & Supervisor */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="siteName" className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Site Name
              </Label>
              <Input
                id="siteName"
                placeholder="e.g., 123 Main St"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="h-10 rounded-xl border-gray-200 focus:border-blue-300 focus:ring-blue-200 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="supervisor" className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                <User className="h-3 w-3" />
                Supervisor
              </Label>
              <Input
                id="supervisor"
                placeholder="e.g., John Smith"
                value={supervisor}
                onChange={(e) => setSupervisor(e.target.value)}
                className="h-10 rounded-xl border-gray-200 focus:border-blue-300 focus:ring-blue-200 text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Card */}
      <Card className="border-gray-200 shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <ClipboardList className="h-4 w-4" />
              <span className="text-sm font-semibold">Tasks</span>
            </div>
            <Badge className="bg-white/20 text-white border-0 font-bold">
              <Clock className="h-3 w-3 mr-1" />
              {totalHours}h total
            </Badge>
          </div>
        </div>
        <CardContent className="pt-4 space-y-3">
          <AnimatePresence>
            {tasks.map((task, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-xl bg-gradient-to-br from-gray-50 to-orange-50/30 border border-gray-100 p-3 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="w-6 h-6 rounded-lg bg-orange-500 text-white text-xs font-bold flex items-center justify-center shrink-0">
                    {index + 1}
                  </div>
                  {tasks.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0 h-6 w-6 text-gray-400 hover:text-red-500 hover:bg-red-50"
                      onClick={() => handleRemoveTask(index)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-gray-500">What did you do? *</Label>
                    <Input
                      placeholder="Describe the task..."
                      value={task.description}
                      onChange={(e) =>
                        handleUpdateTask(index, "description", e.target.value)
                      }
                      required={index === 0}
                      className="h-10 rounded-xl border-gray-200 focus:border-orange-300 focus:ring-orange-200 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Hours
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.5"
                        placeholder="0"
                        value={task.hours || ""}
                        onChange={(e) =>
                          handleUpdateTask(
                            index,
                            "hours",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="h-9 rounded-xl border-gray-200 focus:border-orange-300 focus:ring-orange-200 text-sm"
                      />
                    </div>
                    <div className="space-y-1 col-span-2">
                      <Label className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                        <Wrench className="h-3 w-3" />
                        Tools
                      </Label>
                      <Input
                        placeholder="Drill, Saw..."
                        value={task.tools.join(", ")}
                        onChange={(e) => handleToolsChange(index, e.target.value)}
                        className="h-9 rounded-xl border-gray-200 focus:border-orange-300 focus:ring-orange-200 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      Skills learned
                    </Label>
                    <Input
                      placeholder="Framing, Measuring..."
                      value={task.skills.join(", ")}
                      onChange={(e) => handleSkillsChange(index, e.target.value)}
                      className="h-9 rounded-xl border-gray-200 focus:border-orange-300 focus:ring-orange-200 text-sm"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <Button
            type="button"
            variant="outline"
            className="w-full h-10 rounded-xl border-dashed border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300"
            onClick={handleAddTask}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another Task
          </Button>
        </CardContent>
      </Card>

      {/* Notes & Safety Card */}
      <Card className="border-gray-200 shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-3">
          <div className="flex items-center gap-2 text-white">
            <FileText className="h-4 w-4" />
            <span className="text-sm font-semibold">Notes & Safety</span>
          </div>
        </div>
        <CardContent className="pt-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-xs font-semibold text-gray-500">Additional Notes</Label>
            <textarea
              id="notes"
              className="flex min-h-[70px] w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-300 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Any other details about your day..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="safety" className="text-xs font-semibold text-gray-500 flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-green-600" />
              Safety Observations
            </Label>
            <textarea
              id="safety"
              className="flex min-h-[70px] w-full rounded-xl border border-gray-200 bg-green-50/50 px-3 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-300 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="PPE worn, safety measures taken, hazards identified..."
              value={safetyObservations}
              onChange={(e) => setSafetyObservations(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Photos Card */}
      <Card className="border-gray-200 shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 to-violet-500 px-4 py-3">
          <div className="flex items-center gap-2 text-white">
            <Camera className="h-4 w-4" />
            <span className="text-sm font-semibold">Photos (Optional)</span>
          </div>
        </div>
        <CardContent className="pt-4">
          <PhotoUpload
            photos={photos}
            onPhotosChange={setPhotos}
            maxPhotos={5}
            disabled={isProcessing}
          />
        </CardContent>
      </Card>

      {/* Submit Button */}
      <motion.div
        whileTap={{ scale: 0.98 }}
      >
        <Button
          type="submit"
          className="w-full h-14 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/25 text-base font-semibold"
          disabled={isProcessing || tasks.every((t) => !t.description.trim())}
        >
          {isProcessing ? (
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          ) : (
            <Save className="h-5 w-5 mr-2" />
          )}
          Save Entry
        </Button>
      </motion.div>
    </form>
  );
}
