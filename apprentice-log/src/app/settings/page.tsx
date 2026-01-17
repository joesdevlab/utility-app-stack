"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { User, Bell, Download, HelpCircle, ExternalLink, LucideIcon } from "lucide-react";

interface SettingItem {
  icon: LucideIcon;
  label: string;
  description: string;
  badge?: string;
  disabled?: boolean;
  onClick?: () => void;
  external?: string;
}

interface SettingsGroup {
  title: string;
  items: SettingItem[];
}

export default function SettingsPage() {
  const settingsGroups: SettingsGroup[] = [
    {
      title: "Account",
      items: [
        {
          icon: User,
          label: "Sign in",
          description: "Sync entries across devices",
          badge: "Coming Soon",
          disabled: true,
        },
      ],
    },
    {
      title: "Notifications",
      items: [
        {
          icon: Bell,
          label: "Daily Reminder",
          description: "Get reminded at 3:30 PM to log your day",
          badge: "Coming Soon",
          disabled: true,
        },
      ],
    },
    {
      title: "Data",
      items: [
        {
          icon: Download,
          label: "Export Entries",
          description: "Download all entries as CSV",
          onClick: () => {
            const entries = localStorage.getItem("apprentice-log-entries");
            if (entries) {
              const data = JSON.parse(entries);
              const csv = convertToCSV(data);
              downloadCSV(csv, "apprentice-log-export.csv");
            }
          },
        },
      ],
    },
    {
      title: "Help",
      items: [
        {
          icon: HelpCircle,
          label: "About BCITO Logbooks",
          description: "Learn about apprentice requirements",
          external: "https://bcito.org.nz",
        },
      ],
    },
  ];

  return (
    <div className="px-4 py-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Settings</h2>
        <p className="text-sm text-muted-foreground">
          Customize your experience
        </p>
      </div>

      <div className="space-y-6">
        {settingsGroups.map((group, groupIndex) => (
          <motion.div
            key={group.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: groupIndex * 0.1 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {group.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.label}
                      variant="ghost"
                      className="w-full justify-start h-auto py-3 px-3"
                      disabled={item.disabled}
                      onClick={() => {
                        if (item.onClick) {
                          item.onClick();
                        } else if (item.external) {
                          window.open(item.external, "_blank");
                        }
                      }}
                    >
                      <Icon className="h-5 w-5 mr-3 text-muted-foreground" />
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.label}</span>
                          {item.badge && (
                            <Badge variant="secondary" className="text-xs">
                              {item.badge}
                            </Badge>
                          )}
                          {item.external && (
                            <ExternalLink className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground font-normal">
                          {item.description}
                        </p>
                      </div>
                    </Button>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {/* App Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center pt-8 pb-4"
        >
          <p className="text-sm text-muted-foreground">Apprentice Log v0.1.0</p>
          <p className="text-xs text-muted-foreground mt-1">
            Built for NZ tradies
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function convertToCSV(entries: unknown[]): string {
  if (entries.length === 0) return "";

  const headers = ["Date", "Total Hours", "Tasks", "Tools", "Skills", "Notes", "Safety"];
  const rows = entries.map((entry: any) => {
    const tasks = entry.tasks?.map((t: any) => t.description).join("; ") || "";
    const tools = entry.tasks?.flatMap((t: any) => t.tools || []).join(", ") || "";
    const skills = entry.tasks?.flatMap((t: any) => t.skills || []).join(", ") || "";
    return [
      entry.date,
      entry.totalHours,
      `"${tasks}"`,
      `"${tools}"`,
      `"${skills}"`,
      `"${entry.notes || ""}"`,
      `"${entry.safetyObservations || ""}"`,
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}

function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
