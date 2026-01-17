"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { LogbookEntry, LogbookTask } from "@/types";

interface EntryEditSheetProps {
  entry: LogbookEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, updates: Partial<LogbookEntry>) => Promise<LogbookEntry | null>;
}

export function EntryEditSheet({
  entry,
  open,
  onOpenChange,
  onSave,
}: EntryEditSheetProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [date, setDate] = useState("");
  const [tasks, setTasks] = useState<LogbookTask[]>([]);
  const [notes, setNotes] = useState("");
  const [safetyObservations, setSafetyObservations] = useState("");
  const [siteName, setSiteName] = useState("");
  const [supervisor, setSupervisor] = useState("");

  useEffect(() => {
    if (entry) {
      setDate(entry.date);
      setTasks(entry.tasks || []);
      setNotes(entry.notes || "");
      setSafetyObservations(entry.safetyObservations || "");
      setSiteName(entry.siteName || "");
      setSupervisor(entry.supervisor || "");
    }
  }, [entry]);

  const handleAddTask = () => {
    setTasks([...tasks, { description: "", hours: 0, tools: [], skills: [] }]);
  };

  const handleRemoveTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
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

  const handleSave = async () => {
    if (!entry?.id) return;

    if (tasks.length === 0) {
      toast.error("Add at least one task");
      return;
    }

    if (tasks.some((t) => !t.description.trim())) {
      toast.error("All tasks need a description");
      return;
    }

    setIsSaving(true);
    try {
      const result = await onSave(entry.id, {
        date,
        tasks,
        notes: notes || undefined,
        safetyObservations: safetyObservations || undefined,
        siteName: siteName || undefined,
        supervisor: supervisor || undefined,
      });

      if (result) {
        toast.success("Entry updated");
        onOpenChange(false);
      } else {
        toast.error("Failed to update entry");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const totalHours = tasks.reduce((sum, task) => sum + (task.hours || 0), 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Entry</SheetTitle>
          <SheetDescription>
            Update the details of your logbook entry
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-4 px-4 overflow-y-auto">
          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Site & Supervisor */}
          <div className="grid grid-cols-2 gap-4">
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

          {/* Tasks */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Tasks</Label>
              <Badge variant="secondary" className="bg-blue-500/10 text-blue-600">
                {totalHours}h total
              </Badge>
            </div>

            {tasks.map((task, index) => (
              <Card key={index} className="p-3 space-y-3">
                <div className="flex items-start gap-2">
                  <div className="flex-1 space-y-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Description</Label>
                      <Input
                        placeholder="What did you do?"
                        value={task.description}
                        onChange={(e) =>
                          handleUpdateTask(index, "description", e.target.value)
                        }
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
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleRemoveTask(index)}
                    aria-label={`Remove task ${index + 1}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}

            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleAddTask}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Additional notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Safety Observations */}
          <div className="space-y-2">
            <Label htmlFor="safety">Safety Observations</Label>
            <textarea
              id="safety"
              className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Any safety observations..."
              value={safetyObservations}
              onChange={(e) => setSafetyObservations(e.target.value)}
            />
          </div>
        </div>

        <SheetFooter>
          <Button
            className="w-full bg-blue-500 hover:bg-blue-600"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
