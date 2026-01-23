"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Save, Loader2, Camera } from "lucide-react";
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
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md mx-auto">
      <Card>
        <CardContent className="pt-6 space-y-4">
          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {/* Site & Supervisor */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                placeholder="e.g., 123 Main St"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supervisor">Supervisor</Label>
              <Input
                id="supervisor"
                placeholder="e.g., John Smith"
                value={supervisor}
                onChange={(e) => setSupervisor(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <Label>Tasks</Label>
            <Badge variant="secondary" className="bg-blue-500/10 text-blue-600">
              {totalHours}h total
            </Badge>
          </div>

          {tasks.map((task, index) => (
            <div
              key={index}
              className="rounded-lg border bg-muted/30 p-3 space-y-3"
            >
              <div className="flex items-start gap-2">
                <div className="flex-1 space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Description *</Label>
                    <Input
                      placeholder="What did you do?"
                      value={task.description}
                      onChange={(e) =>
                        handleUpdateTask(index, "description", e.target.value)
                      }
                      required={index === 0}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Hours</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.5"
                        value={task.hours || ""}
                        onChange={(e) =>
                          handleUpdateTask(
                            index,
                            "hours",
                            parseFloat(e.target.value) || 0
                          )
                        }
                      />
                    </div>
                    <div className="space-y-1 col-span-2">
                      <Label className="text-xs">Tools (comma separated)</Label>
                      <Input
                        placeholder="e.g., Drill, Saw"
                        value={task.tools.join(", ")}
                        onChange={(e) => handleToolsChange(index, e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Skills (comma separated)</Label>
                    <Input
                      placeholder="e.g., Framing, Measuring"
                      value={task.skills.join(", ")}
                      onChange={(e) => handleSkillsChange(index, e.target.value)}
                    />
                  </div>
                </div>
                {tasks.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleRemoveTask(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleAddTask}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </CardContent>
      </Card>

      {/* Notes & Safety */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Additional notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="safety">Safety Observations</Label>
            <textarea
              id="safety"
              className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="PPE worn, safety measures..."
              value={safetyObservations}
              onChange={(e) => setSafetyObservations(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Photos */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-2">
            <Camera className="h-4 w-4 text-orange-500" />
            <Label>Photos</Label>
          </div>
          <PhotoUpload
            photos={photos}
            onPhotosChange={setPhotos}
            maxPhotos={5}
            disabled={isProcessing}
          />
        </CardContent>
      </Card>

      <Button
        type="submit"
        className="w-full bg-blue-500 hover:bg-blue-600"
        disabled={isProcessing || tasks.every((t) => !t.description.trim())}
      >
        {isProcessing ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Save className="h-4 w-4 mr-2" />
        )}
        Save Entry
      </Button>
    </form>
  );
}
