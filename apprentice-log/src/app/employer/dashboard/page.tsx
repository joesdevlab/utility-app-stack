"use client";

import { useAuth } from "@/components/auth-provider";
import { useOrganization, useOrgApprentices } from "@/hooks/use-organization";
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
  const { organization } = useAuth();
  const { stats, isLoading: statsLoading } = useOrganization();
  const { apprentices, isLoading: apprenticesLoading } = useOrgApprentices(organization?.id);

  // Filter apprentices needing attention (no entry in 7+ days)
  const apprenticesNeedingAttention = apprentices.filter((a) => {
    if (!a.last_entry_date) return true;
    const daysSince = Math.floor(
      (Date.now() - new Date(a.last_entry_date).getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSince > 7;
  });

  if (statsLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your organization's apprentices and activity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Apprentices"
          value={stats?.member_count || 0}
          icon={<Users className="h-5 w-5" />}
        />
        <StatsCard
          title="Hours This Week"
          value={stats?.hours_this_week || 0}
          description={`${stats?.entries_this_week || 0} entries logged`}
          icon={<Clock className="h-5 w-5" />}
        />
        <StatsCard
          title="Hours This Month"
          value={stats?.hours_this_month || 0}
          description={`${stats?.entries_this_month || 0} entries logged`}
          icon={<FileText className="h-5 w-5" />}
        />
        <StatsCard
          title="Needs Attention"
          value={apprenticesNeedingAttention.length}
          description="Inactive 7+ days"
          icon={<AlertCircle className="h-5 w-5" />}
          className={apprenticesNeedingAttention.length > 0 ? "border-amber-500/50" : ""}
        />
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link href="/employer/team/invite">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Invite Apprentice
          </Button>
        </Link>
        <Link href="/employer/reports">
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </Link>
      </div>

      {/* Apprentices Needing Attention */}
      {apprenticesNeedingAttention.length > 0 && (
        <Card className="border-amber-500/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-amber-600">
              <AlertCircle className="h-5 w-5" />
              Needs Attention
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {apprenticesNeedingAttention.slice(0, 3).map((apprentice) => (
              <ApprenticeCard
                key={apprentice.id}
                apprentice={apprentice}
                onClick={() => router.push(`/employer/apprentices/${apprentice.id}`)}
              />
            ))}
            {apprenticesNeedingAttention.length > 3 && (
              <Link href="/employer/apprentices?filter=attention">
                <Button variant="ghost" className="w-full">
                  View all {apprenticesNeedingAttention.length} apprentices
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>All Apprentices</CardTitle>
            <Link href="/employer/apprentices">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {apprenticesLoading ? (
            <>
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </>
          ) : apprentices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No apprentices yet</p>
              <Link href="/employer/team/invite">
                <Button variant="link" className="mt-2">
                  Invite your first apprentice
                </Button>
              </Link>
            </div>
          ) : (
            apprentices.slice(0, 5).map((apprentice) => (
              <ApprenticeCard
                key={apprentice.id}
                apprentice={apprentice}
                onClick={() => router.push(`/employer/apprentices/${apprentice.id}`)}
              />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
