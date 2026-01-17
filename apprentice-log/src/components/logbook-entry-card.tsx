"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Wrench, BookOpen, ShieldCheck, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { LogbookEntry } from "@/types";

interface LogbookEntryCardProps {
  entry: LogbookEntry;
  compact?: boolean;
}

export function LogbookEntryCard({ entry, compact = false }: LogbookEntryCardProps) {
  const [copied, setCopied] = useState(false);

  const formatForCopy = () => {
    let text = `Date: ${entry.date}\n\n`;

    entry.tasks.forEach((task, index) => {
      text += `Task ${index + 1}: ${task.description}\n`;
      text += `Hours: ${task.hours}\n`;
      if (task.tools.length > 0) {
        text += `Tools: ${task.tools.join(", ")}\n`;
      }
      if (task.skills.length > 0) {
        text += `Skills: ${task.skills.join(", ")}\n`;
      }
      text += "\n";
    });

    text += `Total Hours: ${entry.totalHours}\n`;

    if (entry.notes) {
      text += `\nNotes: ${entry.notes}\n`;
    }

    if (entry.safetyObservations) {
      text += `\nSafety: ${entry.safetyObservations}\n`;
    }

    return text;
  };

  const handleCopy = async () => {
    const text = formatForCopy();
    await navigator.clipboard.writeText(text);
    setCopied(true);

    // Haptic feedback
    if ("vibrate" in navigator) {
      navigator.vibrate(10);
    }

    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedDate = new Date(entry.date).toLocaleDateString("en-NZ", {
    weekday: compact ? "short" : "long",
    month: compact ? "short" : "long",
    day: "numeric",
  });

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base truncate">{formattedDate}</h3>
            <div className="flex items-center gap-1.5 mt-1">
              <Clock className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium text-orange-500">
                {entry.totalHours}h
              </span>
            </div>
          </div>
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              variant={copied ? "default" : "outline"}
              size="sm"
              onClick={handleCopy}
              className={`shrink-0 h-9 ${
                copied ? "bg-green-500 hover:bg-green-600" : ""
              }`}
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1.5" />
                  Copy
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {/* Tasks */}
        <div className="space-y-2">
          {entry.tasks.map((task, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-xl bg-muted/50 p-3 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-sm leading-snug flex-1">
                  {task.description}
                </p>
                <Badge
                  variant="secondary"
                  className="shrink-0 bg-orange-500/10 text-orange-600 border-0"
                >
                  {task.hours}h
                </Badge>
              </div>

              {(task.tools.length > 0 || task.skills.length > 0) && (
                <div className="flex flex-wrap gap-1.5">
                  {task.tools.map((tool, i) => (
                    <Badge
                      key={`tool-${i}`}
                      variant="outline"
                      className="text-xs font-normal"
                    >
                      <Wrench className="h-3 w-3 mr-1" />
                      {tool}
                    </Badge>
                  ))}
                  {task.skills.map((skill, i) => (
                    <Badge
                      key={`skill-${i}`}
                      variant="outline"
                      className="text-xs font-normal bg-blue-500/5 border-blue-500/20"
                    >
                      <BookOpen className="h-3 w-3 mr-1" />
                      {skill}
                    </Badge>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Notes */}
        {entry.notes && (
          <p className="text-sm text-muted-foreground pl-1">
            {entry.notes}
          </p>
        )}

        {/* Safety Observations */}
        {entry.safetyObservations && (
          <div className="flex items-start gap-2 rounded-lg bg-green-500/5 p-3">
            <ShieldCheck className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
            <p className="text-sm text-green-700 dark:text-green-400">
              {entry.safetyObservations}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
