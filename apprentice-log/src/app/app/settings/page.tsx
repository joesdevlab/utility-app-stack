"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { AuthForm } from "@/components/auth-form";
import { AppShell } from "@/components/app-shell";
import { MFASetup } from "@/components/mfa-setup";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import { User, Bell, Download, HelpCircle, ExternalLink, LogOut, LucideIcon, Loader2, Building2, Shield, ShieldCheck, ShieldOff, Trash2, Gift } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { ShareReferral } from "@/components/share-referral";

interface SettingItem {
  icon: LucideIcon;
  label: string;
  description: string;
  badge?: string;
  disabled?: boolean;
  onClick?: () => void;
  external?: string;
  href?: string;  // For internal navigation
  destructive?: boolean;
}

interface SettingsGroup {
  title: string;
  items: SettingItem[];
}

export default function SettingsPage() {
  const { user, isLoading: authLoading, signOut, mfaEnabled, getMFAFactors, unenrollMFA } = useAuth();
  const [mfaSetupOpen, setMfaSetupOpen] = useState(false);
  const [isDisablingMFA, setIsDisablingMFA] = useState(false);
  const supabase = createClient();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50/30 to-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  const handleExport = async () => {
    try {
      const { data, error } = await supabase
        .from("apprentice_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const csv = convertToCSV(data);
        downloadCSV(csv, "apprentice-log-export.csv");
        toast.success("Export downloaded!");
      } else {
        toast.info("No entries to export");
      }
    } catch (error) {
      toast.error("Failed to export entries");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
  };

  const handleToggleMFA = async () => {
    if (mfaEnabled) {
      // Disable MFA
      if (!confirm("Are you sure you want to disable two-factor authentication? This will make your account less secure.")) {
        return;
      }
      setIsDisablingMFA(true);
      try {
        const { factors, error: fetchError } = await getMFAFactors();
        if (fetchError) {
          toast.error("Failed to get MFA factors");
          return;
        }
        const verifiedFactor = factors.find(f => f.status === "verified");
        if (verifiedFactor) {
          const { error } = await unenrollMFA(verifiedFactor.id);
          if (error) {
            toast.error(error.message || "Failed to disable 2FA");
          } else {
            toast.success("Two-factor authentication disabled");
          }
        }
      } catch {
        toast.error("Failed to disable 2FA");
      } finally {
        setIsDisablingMFA(false);
      }
    } else {
      // Enable MFA - open setup dialog
      setMfaSetupOpen(true);
    }
  };

  const settingsGroups: SettingsGroup[] = [
    {
      title: "Account",
      items: [
        {
          icon: User,
          label: user.email || "Account",
          description: "Signed in and syncing to cloud",
        },
        {
          icon: Building2,
          label: "Employer Portal",
          description: "Manage your apprentices and team",
          href: "/employer",
        },
        {
          icon: LogOut,
          label: "Sign Out",
          description: "Sign out of your account",
          onClick: handleSignOut,
          destructive: true,
        },
        {
          icon: Trash2,
          label: "Delete Account",
          description: "Permanently delete your account and data",
          href: "/delete-account",
          destructive: true,
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
          onClick: handleExport,
        },
      ],
    },
    {
      title: "Help",
      items: [
        {
          icon: HelpCircle,
          label: "BCITO Compliance Guide",
          description: "Logbook requirements & best practices",
          href: "/app/bcito",
        },
      ],
    },
  ];

  return (
    <AppShell>
      <div className="px-4 py-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
            <User className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Settings</h2>
            <p className="text-sm text-muted-foreground">
              Customize your experience
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Security Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <Card className="overflow-hidden border-gray-200 hover:border-orange-100 transition-colors">
              <CardHeader className="pb-2 bg-gradient-to-r from-gray-50/80 to-transparent">
                <CardTitle className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Security
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                      mfaEnabled
                        ? "bg-gradient-to-br from-green-100 to-emerald-100"
                        : "bg-gray-100"
                    }`}>
                      {mfaEnabled ? (
                        <ShieldCheck className="h-5 w-5 text-green-600" />
                      ) : (
                        <Shield className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-gray-900">
                          Two-Factor Authentication
                        </span>
                        {mfaEnabled && (
                          <Badge className="bg-green-100 text-green-700 border-0 text-[10px]">
                            Enabled
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {mfaEnabled
                          ? "Your account is protected with 2FA"
                          : "Add an extra layer of security"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isDisablingMFA ? (
                      <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    ) : (
                      <Switch
                        checked={mfaEnabled}
                        onCheckedChange={handleToggleMFA}
                        className="data-[state=checked]:bg-green-500"
                      />
                    )}
                  </div>
                </div>
                {!mfaEnabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl"
                  >
                    <div className="flex items-start gap-2">
                      <ShieldOff className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-amber-700">
                          Enable 2FA to protect your account from unauthorized access
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {settingsGroups.map((group, groupIndex) => (
            <motion.div
              key={group.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + groupIndex * 0.08 }}
            >
              <Card className="overflow-hidden border-gray-200 hover:border-orange-100 transition-colors">
                <CardHeader className="pb-2 bg-gradient-to-r from-gray-50/80 to-transparent">
                  <CardTitle className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {group.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 p-2">
                  {group.items.map((item, itemIndex) => {
                    const Icon = item.icon;
                    const content = (
                      <>
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          item.destructive
                            ? "bg-red-50 group-hover:bg-red-100"
                            : item.href
                            ? "bg-blue-50 group-hover:bg-blue-100"
                            : "bg-gray-100 group-hover:bg-orange-100"
                        }`}>
                          <Icon className={`h-4.5 w-4.5 ${
                            item.destructive
                              ? "text-red-500"
                              : item.href
                              ? "text-blue-600"
                              : "text-gray-500 group-hover:text-orange-600"
                          }`} />
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`font-medium text-sm truncate ${
                              item.destructive ? "text-red-600" : "text-gray-900"
                            }`}>
                              {item.label}
                            </span>
                            {item.badge && (
                              <Badge variant="secondary" className="text-[10px] bg-gray-100 text-gray-500 border-0 font-medium shrink-0">
                                {item.badge}
                              </Badge>
                            )}
                            {item.external && (
                              <ExternalLink className="h-3 w-3 text-gray-400 shrink-0" />
                            )}
                          </div>
                          <p className={`text-xs font-normal truncate ${
                            item.destructive ? "text-red-400" : "text-muted-foreground"
                          }`}>
                            {item.description}
                          </p>
                        </div>
                      </>
                    );

                    if (item.href) {
                      return (
                        <Link key={item.label} href={item.href}>
                          <Button
                            variant="ghost"
                            className="w-full justify-start h-auto py-2.5 px-2.5 gap-3 rounded-xl hover:bg-blue-50/50 group"
                          >
                            {content}
                          </Button>
                        </Link>
                      );
                    }

                    return (
                      <Button
                        key={item.label}
                        variant="ghost"
                        className={`w-full justify-start h-auto py-2.5 px-2.5 gap-3 rounded-xl group ${
                          item.destructive
                            ? "hover:bg-red-50"
                            : "hover:bg-orange-50/50"
                        }`}
                        disabled={item.disabled}
                        onClick={() => {
                          if (item.onClick) {
                            item.onClick();
                          } else if (item.external) {
                            window.open(item.external, "_blank");
                          }
                        }}
                      >
                        {content}
                      </Button>
                    );
                  })}
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {/* Invite Friends Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <Card className="overflow-hidden border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center">
                      <Gift className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Invite Your Mates</p>
                      <p className="text-xs text-gray-600">Share with fellow apprentices</p>
                    </div>
                  </div>
                  <ShareReferral
                    trigger={
                      <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                        Share
                      </Button>
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* App Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center pt-6 pb-4"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 px-4 py-2 rounded-full mb-2">
              <span className="text-lg">🇳🇿</span>
              <span className="text-xs font-semibold text-orange-700">Made in NZ</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Apprentice Log v0.1.0
            </p>
          </motion.div>
        </div>
      </div>

      {/* MFA Setup Dialog */}
      <MFASetup
        open={mfaSetupOpen}
        onOpenChange={setMfaSetupOpen}
        onSuccess={() => {
          toast.success("Two-factor authentication enabled!");
        }}
      />
    </AppShell>
  );
}

function convertToCSV(entries: unknown[]): string {
  if (entries.length === 0) return "";

  const headers = ["Date", "Total Hours", "Formatted Entry", "Raw Transcript", "Site", "Supervisor"];
  const rows = entries.map((entry: any) => {
    return [
      entry.date,
      entry.hours || "",
      `"${(entry.formatted_entry || "").replace(/"/g, '""')}"`,
      `"${(entry.raw_transcript || "").replace(/"/g, '""')}"`,
      `"${entry.site_name || ""}"`,
      `"${entry.supervisor || ""}"`,
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
