"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, FileText, ChevronRight, AlertCircle } from "lucide-react";
import type { ApprenticeWithStats } from "@/types";

interface ApprenticeCardProps {
  apprentice: ApprenticeWithStats;
  onClick?: () => void;
}

export function ApprenticeCard({ apprentice, onClick }: ApprenticeCardProps) {
  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return email[0].toUpperCase();
  };

  const daysSinceLastEntry = apprentice.last_entry_date
    ? Math.floor(
        (Date.now() - new Date(apprentice.last_entry_date).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  const needsAttention = daysSinceLastEntry !== null && daysSinceLastEntry > 7;

  return (
    <motion.div whileTap={{ scale: 0.98 }}>
      <Card
        className={`cursor-pointer transition-colors hover:bg-muted/50 ${
          needsAttention ? "border-amber-500/50" : ""
        }`}
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {getInitials(apprentice.full_name, apprentice.email)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium truncate">
                  {apprentice.full_name || apprentice.email}
                </h3>
                {needsAttention && (
                  <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                )}
              </div>
              {apprentice.full_name && (
                <p className="text-sm text-muted-foreground truncate">
                  {apprentice.email}
                </p>
              )}
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>{apprentice.entries_count} entries</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{apprentice.total_hours}h total</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {apprentice.last_entry_date && (
                <Badge
                  variant={needsAttention ? "destructive" : "secondary"}
                  className="shrink-0"
                >
                  {daysSinceLastEntry === 0
                    ? "Today"
                    : daysSinceLastEntry === 1
                    ? "Yesterday"
                    : `${daysSinceLastEntry}d ago`}
                </Badge>
              )}
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
