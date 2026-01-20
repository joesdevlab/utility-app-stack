"use client";

import { useAuth } from "@/components/auth-provider";
import { AuthForm } from "@/components/auth-form";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { User, Bell, Download, HelpCircle, ExternalLink, LogOut, LucideIcon, Loader2, Crown, CreditCard, Zap, Building2 } from "lucide-react";
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
  const { user, isLoading: authLoading, signOut } = useAuth();
  const { subscription, isLoading: subLoading, openPortal } = useSubscription();
  const supabase = createClient();
  const searchParams = useSearchParams();
  const success = searchParams.get("success");

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
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
      <div className="px-4 py-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Settings</h2>
          <p className="text-sm text-muted-foreground">
            Customize your experience
          </p>
        </div>

        {/* Success message */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl"
          >
            <p className="text-green-800 font-medium flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Welcome to Premium! You now have unlimited entries.
            </p>
          </motion.div>
        )}

        <div className="space-y-6">
          {/* Subscription Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className={subscription.isPremium ? "border-orange-200 bg-gradient-to-br from-orange-50 to-white" : ""}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  {subscription.isPremium ? (
                    <Crown className="h-4 w-4 text-orange-500" />
                  ) : (
                    <Zap className="h-4 w-4" />
                  )}
                  Subscription
                </CardTitle>
              </CardHeader>
              <CardContent>
                {subLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Loading...</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-lg">
                            {subscription.isPremium ? "Premium" : "Free"}
                          </span>
                          {subscription.isPremium && (
                            <Badge className="bg-orange-500 text-white">Active</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {subscription.isPremium
                            ? "Unlimited entries"
                            : `${subscription.entriesRemaining} of 10 entries remaining this month`}
                        </p>
                      </div>
                    </div>

                    {/* Progress bar for free users */}
                    {!subscription.isPremium && (
                      <div className="space-y-2">
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-orange-500 transition-all"
                            style={{
                              width: `${(subscription.entriesThisMonth / 10) * 100}%`,
                            }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {subscription.entriesThisMonth} entries used this month
                        </p>
                      </div>
                    )}

                    {/* Cancel notice */}
                    {subscription.cancelAtPeriodEnd && subscription.currentPeriodEnd && (
                      <p className="text-sm text-amber-600">
                        Your subscription will end on{" "}
                        {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                      </p>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      {subscription.isPremium ? (
                        <Button
                          variant="outline"
                          onClick={handleManageSubscription}
                          className="flex-1"
                        >
                          <CreditCard className="h-4 w-4 mr-2" />
                          Manage Billing
                        </Button>
                      ) : (
                        <Link href="/pricing" className="flex-1">
                          <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
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
                    const content = (
                      <>
                        <Icon className={`h-5 w-5 mr-3 ${
                          item.destructive ? "text-destructive" : "text-muted-foreground"
                        }`} />
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
                          <p className={`text-sm font-normal ${
                            item.destructive ? "text-destructive/70" : "text-muted-foreground"
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
                            className="w-full justify-start h-auto py-3 px-3"
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
                        className={`w-full justify-start h-auto py-3 px-3 ${
                          item.destructive ? "text-destructive hover:text-destructive" : ""
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
            className="text-center pt-8 pb-4"
          >
            <p className="text-sm text-muted-foreground">Apprentice Log v0.1.0</p>
            <p className="text-xs text-muted-foreground mt-1">
              Built for NZ tradies
            </p>
          </motion.div>
        </div>
      </div>
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
