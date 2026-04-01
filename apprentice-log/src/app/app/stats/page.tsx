"use client";

import { useMemo } from "react";
import { useAuth } from "@/components/auth-provider";
import { AuthForm } from "@/components/auth-form";
import { AppShell } from "@/components/app-shell";
import { useEntries } from "@/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Clock, Target, Flame, Wrench, BookOpen, Calendar, TrendingUp, ShieldCheck } from "lucide-react";
import { LogoSpinner } from "@/components/animated-logo";
import type { LogbookEntry } from "@/types";

interface WeekData {
  label: string;
  hours: number;
  entries: number;
}

function getWeekLabel(date: Date): string {
  const day = date.getDate();
  const month = date.toLocaleDateString("en-NZ", { month: "short" });
  return `${day} ${month}`;
}

function calculateStats(entries: LogbookEntry[]) {
  const now = new Date();
  const today = now.toISOString().split("T")[0];

  // Total hours
  const totalHours = entries.reduce(
    (sum, e) => sum + (e.totalHours || e.hours || 0),
    0
  );

  // Hours this week
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday
  const weekStartStr = weekStart.toISOString().split("T")[0];
  const thisWeekEntries = entries.filter((e) => e.date >= weekStartStr);
  const weekHours = thisWeekEntries.reduce(
    (sum, e) => sum + (e.totalHours || e.hours || 0),
    0
  );

  // Hours this month
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const thisMonthEntries = entries.filter((e) => e.date >= monthStart);
  const monthHours = thisMonthEntries.reduce(
    (sum, e) => sum + (e.totalHours || e.hours || 0),
    0
  );

  // Current streak (consecutive days with entries, ending today or yesterday)
  const entryDates = new Set(entries.map((e) => e.date));
  let streak = 0;
  const checkDate = new Date(now);
  // Start from today, if no entry today start from yesterday
  if (!entryDates.has(today)) {
    checkDate.setDate(checkDate.getDate() - 1);
  }
  while (entryDates.has(checkDate.toISOString().split("T")[0])) {
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // Skills breakdown
  const skillCounts = new Map<string, number>();
  for (const entry of entries) {
    for (const task of entry.tasks || []) {
      for (const skill of task.skills || []) {
        skillCounts.set(skill, (skillCounts.get(skill) || 0) + 1);
      }
    }
  }
  const topSkills = [...skillCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  // Tools breakdown
  const toolCounts = new Map<string, number>();
  for (const entry of entries) {
    for (const task of entry.tasks || []) {
      for (const tool of task.tools || []) {
        toolCounts.set(tool, (toolCounts.get(tool) || 0) + 1);
      }
    }
  }
  const topTools = [...toolCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  // Weekly hours for last 8 weeks (bar chart data)
  const weeklyData: WeekData[] = [];
  for (let i = 7; i >= 0; i--) {
    const wStart = new Date(now);
    wStart.setDate(wStart.getDate() - wStart.getDay() + 1 - i * 7);
    const wEnd = new Date(wStart);
    wEnd.setDate(wEnd.getDate() + 6);
    const wStartStr = wStart.toISOString().split("T")[0];
    const wEndStr = wEnd.toISOString().split("T")[0];

    const weekEntries = entries.filter(
      (e) => e.date >= wStartStr && e.date <= wEndStr
    );
    const hours = weekEntries.reduce(
      (sum, e) => sum + (e.totalHours || e.hours || 0),
      0
    );

    weeklyData.push({
      label: getWeekLabel(wStart),
      hours,
      entries: weekEntries.length,
    });
  }

  // Unique sites
  const uniqueSites = [...new Set(entries.map((e) => e.siteName).filter(Boolean))];

  // Average hours per entry
  const avgHours = entries.length > 0 ? totalHours / entries.length : 0;

  return {
    totalHours,
    weekHours,
    monthHours,
    totalEntries: entries.length,
    streak,
    topSkills,
    topTools,
    weeklyData,
    uniqueSites,
    avgHours,
  };
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color = "orange",
}: {
  icon: typeof Clock;
  label: string;
  value: string;
  sub?: string;
  color?: "orange" | "blue" | "green" | "purple";
}) {
  const colorMap = {
    orange: "from-orange-50 to-orange-100/50 text-orange-600",
    blue: "from-blue-50 to-blue-100/50 text-blue-600",
    green: "from-green-50 to-green-100/50 text-green-600",
    purple: "from-purple-50 to-purple-100/50 text-purple-600",
  };

  return (
    <Card className="border-gray-200">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${colorMap[color]}`}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        </div>
        {sub && (
          <p className="text-xs text-gray-400 mt-2">{sub}</p>
        )}
      </CardContent>
    </Card>
  );
}

function BarChart({ data, maxHeight = 80 }: { data: WeekData[]; maxHeight?: number }) {
  const maxHours = Math.max(...data.map((d) => d.hours), 1);

  return (
    <div className="flex items-end gap-2 h-[120px] px-1">
      {data.map((week, i) => {
        const height = (week.hours / maxHours) * maxHeight;
        const isCurrentWeek = i === data.length - 1;

        return (
          <div key={week.label} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[10px] text-gray-400 font-medium">
              {week.hours > 0 ? `${week.hours.toFixed(0)}h` : ""}
            </span>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: Math.max(height, 2) }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className={`w-full rounded-t-md ${
                isCurrentWeek
                  ? "bg-gradient-to-t from-orange-500 to-orange-400"
                  : week.hours > 0
                  ? "bg-gradient-to-t from-orange-200 to-orange-100"
                  : "bg-gray-100"
              }`}
            />
            <span className={`text-[9px] ${isCurrentWeek ? "text-orange-600 font-semibold" : "text-gray-400"}`}>
              {week.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function StatsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { entries, isLoading } = useEntries(user?.id);

  const stats = useMemo(() => calculateStats(entries), [entries]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50/30 to-background">
        <LogoSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-20">
          <LogoSpinner size="md" />
        </div>
      </AppShell>
    );
  }

  if (entries.length === 0) {
    return (
      <AppShell>
        <div className="px-4 py-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-50 flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-orange-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">No entries yet</h2>
          <p className="text-sm text-gray-500">
            Start recording your work to see progress stats here.
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="px-4 pb-28 space-y-4">
        {/* Key Stats Grid */}
        <motion.div
          className="grid grid-cols-2 gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <StatCard
            icon={Clock}
            label="Total Hours"
            value={stats.totalHours.toFixed(1)}
            sub={`${stats.avgHours.toFixed(1)}h avg per entry`}
            color="orange"
          />
          <StatCard
            icon={Calendar}
            label="Total Entries"
            value={String(stats.totalEntries)}
            sub={`${stats.uniqueSites.length} site${stats.uniqueSites.length !== 1 ? "s" : ""}`}
            color="blue"
          />
          <StatCard
            icon={Flame}
            label="Current Streak"
            value={`${stats.streak} day${stats.streak !== 1 ? "s" : ""}`}
            color="green"
          />
          <StatCard
            icon={Target}
            label="This Month"
            value={`${stats.monthHours.toFixed(1)}h`}
            sub={`${stats.weekHours.toFixed(1)}h this week`}
            color="purple"
          />
        </motion.div>

        {/* Weekly Hours Chart */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-orange-500" />
                Weekly Hours
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <BarChart data={stats.weeklyData} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Skills Breakdown */}
        {stats.topSkills.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-blue-500" />
                  Skills & Competencies
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="flex flex-wrap gap-2">
                  {stats.topSkills.map(([skill, count]) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="bg-blue-50 text-blue-700 border-blue-200 text-xs"
                    >
                      {skill}
                      <span className="ml-1 text-blue-400">{count}</span>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Tools Breakdown */}
        {stats.topTools.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-green-500" />
                  Tools & Equipment
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="flex flex-wrap gap-2">
                  {stats.topTools.map(([tool, count]) => (
                    <Badge
                      key={tool}
                      variant="secondary"
                      className="bg-green-50 text-green-700 border-green-200 text-xs"
                    >
                      {tool}
                      <span className="ml-1 text-green-400">{count}</span>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Sites Worked */}
        {stats.uniqueSites.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card className="border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-purple-500" />
                  Sites Worked
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="flex flex-wrap gap-2">
                  {stats.uniqueSites.map((site) => (
                    <Badge
                      key={site}
                      variant="secondary"
                      className="bg-purple-50 text-purple-700 border-purple-200 text-xs"
                    >
                      {site}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </AppShell>
  );
}
