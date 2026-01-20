"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Wrench, BookOpen, ShieldCheck, Copy, Check, Calendar, MapPin, User } from "lucide-react";
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
    <Card className="w-full overflow-hidden border-gray-200 hover:shadow-lg hover:border-orange-200 transition-all">
      {/* Header with gradient */}
      <CardHeader className="pb-3 bg-gradient-to-r from-orange-50/80 to-transparent border-b border-orange-100/50">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-sm">
                <Calendar className="h-4 w-4 text-white" />
              </div>
              <h3 className="font-bold text-gray-900">{formattedDate}</h3>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1 bg-orange-100 px-2 py-0.5 rounded-full">
                <Clock className="h-3.5 w-3.5 text-orange-600" />
                <span className="font-semibold text-orange-600">
                  {entry.totalHours}h
                </span>
              </div>
              {entry.siteName && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  <span className="truncate max-w-[120px]">{entry.siteName}</span>
                </div>
              )}
              {entry.supervisor && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <User className="h-3.5 w-3.5" />
                  <span className="truncate max-w-[100px]">{entry.supervisor}</span>
                </div>
              )}
            </div>
          </div>
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              variant={copied ? "default" : "outline"}
              size="sm"
              onClick={handleCopy}
              className={`shrink-0 h-9 rounded-lg ${
                copied
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "border-orange-200 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300"
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

      <CardContent className="pt-4 space-y-3">
        {/* Tasks */}
        <div className="space-y-2">
          {entry.tasks.map((task, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-100 p-3 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-sm text-gray-800 leading-snug flex-1">
                  {task.description}
                </p>
                <Badge className="shrink-0 bg-orange-100 text-orange-700 border-0 font-semibold">
                  {task.hours}h
                </Badge>
              </div>

              {(task.tools.length > 0 || task.skills.length > 0) && (
                <div className="flex flex-wrap gap-1.5">
                  {task.tools.map((tool, i) => (
                    <Badge
                      key={`tool-${i}`}
                      variant="outline"
                      className="text-xs font-medium border-amber-200 bg-amber-50 text-amber-700"
                    >
                      <Wrench className="h-3 w-3 mr-1" />
                      {tool}
                    </Badge>
                  ))}
                  {task.skills.map((skill, i) => (
                    <Badge
                      key={`skill-${i}`}
                      variant="outline"
                      className="text-xs font-medium border-blue-200 bg-blue-50 text-blue-700"
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
          <div className="text-sm text-muted-foreground bg-gray-50 rounded-lg p-3 border border-gray-100">
            <span className="font-medium text-gray-600">Notes: </span>
            {entry.notes}
          </div>
        )}

        {/* Safety Observations */}
        {entry.safetyObservations && (
          <div className="flex items-start gap-2.5 rounded-xl bg-green-50 border border-green-100 p-3">
            <div className="w-6 h-6 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-3.5 w-3.5 text-green-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-green-700 mb-0.5">Safety</p>
              <p className="text-sm text-green-700">
                {entry.safetyObservations}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
