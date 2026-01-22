"use client";

import { motion } from "framer-motion";
import { useDashboardData } from "@/hooks/use-organization";
import { StatsCard } from "@/components/employer/stats-card";
import { ApprenticeCard } from "@/components/employer/apprentice-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Clock, FileText, AlertCircle, Plus, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EmployerDashboardPage() {
  const router = useRouter();
  // Single API call for all dashboard data (org + stats + apprentices)
  const { stats, apprentices, isLoading } = useDashboardData();

  // Filter apprentices needing attention (no entry in 7+ days)
  const apprenticesNeedingAttention = apprentices.filter((a) => {
    if (!a.last_entry_date) return true;
    const daysSince = Math.floor(
      (Date.now() - new Date(a.last_entry_date).getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSince > 7;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your organization's apprentices and activity
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Apprentices"
          value={stats?.member_count || 0}
          icon={<Users className="h-5 w-5" />}
          index={0}
        />
        <StatsCard
          title="Hours This Week"
          value={stats?.hours_this_week || 0}
          description={`${stats?.entries_this_week || 0} entries logged`}
          icon={<Clock className="h-5 w-5" />}
          index={1}
        />
        <StatsCard
          title="Hours This Month"
          value={stats?.hours_this_month || 0}
          description={`${stats?.entries_this_month || 0} entries logged`}
          icon={<FileText className="h-5 w-5" />}
          index={2}
        />
        <StatsCard
          title="Needs Attention"
          value={apprenticesNeedingAttention.length}
          description="Inactive 7+ days"
          icon={<AlertCircle className="h-5 w-5" />}
          className={apprenticesNeedingAttention.length > 0 ? "border-amber-500/50 bg-amber-50/30" : ""}
          index={3}
        />
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap gap-3"
      >
        <Link href="/employer/team/invite">
          <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md shadow-orange-500/20">
            <Plus className="h-4 w-4 mr-2" />
            Invite Apprentice
          </Button>
        </Link>
        <Link href="/employer/reports">
          <Button variant="outline" className="border-orange-200 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300">
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </Link>
      </motion.div>

      {/* Apprentices Needing Attention */}
      {apprenticesNeedingAttention.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-amber-500/50 bg-amber-50/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-amber-600">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                  <AlertCircle className="h-4 w-4" />
                </div>
                Needs Attention
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {apprenticesNeedingAttention.slice(0, 3).map((apprentice, index) => (
                <ApprenticeCard
                  key={apprentice.id}
                  apprentice={apprentice}
                  index={index}
                  onClick={() => router.push(`/employer/apprentices/${apprentice.id}`)}
                />
              ))}
              {apprenticesNeedingAttention.length > 3 && (
                <Link href="/employer/apprentices?filter=attention">
                  <Button variant="ghost" className="w-full hover:bg-amber-100 hover:text-amber-700">
                    View all {apprenticesNeedingAttention.length} apprentices
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3 border-b bg-gradient-to-r from-orange-50/50 to-transparent">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center">
                  <Users className="h-4 w-4 text-orange-600" />
                </div>
                <span className="text-gray-900">All Apprentices</span>
              </CardTitle>
              <Link href="/employer/apprentices">
                <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700 hover:bg-orange-50">
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {apprentices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-orange-500" />
                </div>
                <p className="text-gray-600">No apprentices yet</p>
                <Link href="/employer/team/invite">
                  <Button variant="link" className="mt-2 text-orange-600 hover:text-orange-700">
                    Invite your first apprentice
                  </Button>
                </Link>
              </div>
            ) : (
              apprentices.slice(0, 5).map((apprentice, index) => (
                <ApprenticeCard
                  key={apprentice.id}
                  apprentice={apprentice}
                  index={index}
                  onClick={() => router.push(`/employer/apprentices/${apprentice.id}`)}
                />
              ))
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
