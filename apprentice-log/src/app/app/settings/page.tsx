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
import { User, Bell, Download, HelpCircle, ExternalLink, LogOut, LucideIcon, Loader2, Crown, CreditCard, Zap, Building2, Clock, Shield, ShieldCheck, ShieldOff } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useSubscription } from "@/hooks";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

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
  const { subscription, isLoading: subLoading, openPortal } = useSubscription();
  const [mfaSetupOpen, setMfaSetupOpen] = useState(false);
  const [isDisablingMFA, setIsDisablingMFA] = useState(false);
  const supabase = createClient();
  const searchParams = useSearchParams();
  const success = searchParams.get("success");

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

  const handleManageSubscription = async () => {
    try {
      await openPortal();
    } catch {
      toast.error("Failed to open billing portal");
    }
  };

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
          label: "About BCITO Logbooks",
          description: "Learn about apprentice requirements",
          external: "https://bcito.org.nz",
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

        {/* Success message */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl"
          >
            <p className="text-green-800 font-medium flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                <Crown className="h-4 w-4 text-green-600" />
              </div>
              Welcome to Premium! You now have unlimited entries.
            </p>
          </motion.div>
        )}

        <div className="space-y-4">
          {/* Subscription Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className={`overflow-hidden border-gray-200 ${
              subscription.isPremium
                ? "bg-gradient-to-br from-orange-50 via-white to-amber-50 border-orange-200"
                : "hover:border-orange-200 transition-colors"
            }`}>
              <CardHeader className={`pb-2 ${subscription.isPremium ? "bg-gradient-to-r from-orange-100/50 to-transparent" : ""}`}>
                <CardTitle className="text-sm font-semibold text-gray-500 flex items-center gap-2">
                  {subscription.isPremium ? (
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-sm">
                      <Crown className="h-3.5 w-3.5 text-white" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Zap className="h-3.5 w-3.5 text-gray-500" />
                    </div>
                  )}
                  Subscription
                </CardTitle>
              </CardHeader>
              <CardContent>
                {subLoading ? (
                  <div className="flex items-center gap-3 py-2">
                    <div className="h-6 w-6 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
                    <span className="text-sm text-muted-foreground">Loading subscription...</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xl text-gray-900">
                            {subscription.isPremium ? "Premium" : "Free"}
                          </span>
                          {subscription.isPremium && (
                            <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-sm">
                              Active
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {subscription.isPremium
                            ? "Unlimited entries forever"
                            : `${subscription.entriesRemaining} of 10 entries remaining this month`}
                        </p>
                      </div>
                    </div>

                    {/* Progress bar for free users */}
                    {!subscription.isPremium && (
                      <div className="space-y-2">
                        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(subscription.entriesThisMonth / 10) * 100}%` }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {subscription.entriesThisMonth} entries used this month
                        </p>
                      </div>
                    )}

                    {/* Cancel notice */}
                    {subscription.cancelAtPeriodEnd && subscription.currentPeriodEnd && (
                      <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                        <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                          <Clock className="h-3.5 w-3.5 text-amber-600" />
                        </div>
                        <p className="text-sm text-amber-700">
                          Your subscription ends on{" "}
                          <span className="font-semibold">
                            {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                          </span>
                        </p>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-2 pt-1">
                      {subscription.isPremium ? (
                        <Button
                          variant="outline"
                          onClick={handleManageSubscription}
                          className="flex-1 h-11 rounded-xl border-orange-200 hover:border-orange-300 hover:bg-orange-50"
                        >
                          <CreditCard className="h-4 w-4 mr-2 text-orange-500" />
                          Manage Billing
                        </Button>
                      ) : (
                        <Link href="/pricing" className="flex-1">
                          <Button className="w-full h-11 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/25">
                            <Crown className="h-4 w-4 mr-2" />
                            Upgrade to Premium
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

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
