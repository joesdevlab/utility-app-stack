"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DollarSign,
  TrendingUp,
  Building2,
  Users,
  FileText,
  Calendar,
  Crown,
  Activity,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface MRRData {
  revenue: {
    mrr: number;
    arr: number;
    currency: string;
    pricePerMonth: number;
  };
  organizations: {
    total: number;
    pro: number;
    free: number;
    activeSubscriptions: number;
    newThisMonth: number;
    lastMonthNew: number;
  };
  usage: {
    totalUsers: number;
    totalApprentices: number;
    totalEntries: number;
    entriesLast30Days: number;
  };
  subscriptions: Array<{
    id: string;
    name: string;
    plan: string;
    status: string;
    stripeCustomerId: string;
    stripeSubscriptionId: string;
    currentPeriodEnd: string;
    createdAt: string;
  }>;
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = "orange",
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: number;
  color?: "orange" | "green" | "blue" | "purple";
}) {
  const colorClasses = {
    orange: "from-orange-500 to-orange-600 shadow-orange-500/20",
    green: "from-green-500 to-green-600 shadow-green-500/20",
    blue: "from-blue-500 to-blue-600 shadow-blue-500/20",
    purple: "from-purple-500 to-purple-600 shadow-purple-500/20",
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-gray-900">{value}</p>
              {trend !== undefined && trend > 0 && (
                <Badge className="bg-green-100 text-green-700">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  +{trend}
                </Badge>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} shadow-lg flex items-center justify-center`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState<MRRData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/mrr");
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to fetch data");
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-red-600 font-medium">{error}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Make sure you're logged in with an admin account.
            </p>
            <Button onClick={fetchData} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NZ", {
      style: "currency",
      currency: "NZD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-muted-foreground">Apprentice Log MRR & Analytics</p>
          </div>
          <Button onClick={fetchData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </motion.div>

        {/* Revenue Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Monthly Recurring Revenue"
              value={formatCurrency(data.revenue.mrr)}
              subtitle={`${data.organizations.activeSubscriptions} active subscriptions`}
              icon={DollarSign}
              color="green"
            />
            <StatCard
              title="Annual Run Rate"
              value={formatCurrency(data.revenue.arr)}
              subtitle="Projected annual revenue"
              icon={TrendingUp}
              color="blue"
            />
            <StatCard
              title="Price per Seat"
              value={formatCurrency(data.revenue.pricePerMonth)}
              subtitle="Per employer per month"
              icon={Crown}
              color="purple"
            />
            <StatCard
              title="Conversion Rate"
              value={data.organizations.total > 0
                ? `${Math.round((data.organizations.pro / data.organizations.total) * 100)}%`
                : "0%"
              }
              subtitle="Free to Pro conversion"
              icon={Activity}
              color="orange"
            />
          </div>
        </motion.div>

        {/* Organizations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Organizations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Organizations"
              value={data.organizations.total}
              trend={data.organizations.newThisMonth}
              subtitle={`+${data.organizations.newThisMonth} this month`}
              icon={Building2}
              color="orange"
            />
            <StatCard
              title="Pro Subscribers"
              value={data.organizations.pro}
              subtitle="Paying employers"
              icon={Crown}
              color="green"
            />
            <StatCard
              title="Free Tier"
              value={data.organizations.free}
              subtitle="Potential upgrades"
              icon={Users}
              color="blue"
            />
            <StatCard
              title="Growth"
              value={data.organizations.lastMonthNew > 0
                ? `+${Math.round(((data.organizations.newThisMonth - data.organizations.lastMonthNew) / data.organizations.lastMonthNew) * 100)}%`
                : "+0%"
              }
              subtitle="vs last month"
              icon={TrendingUp}
              color="purple"
            />
          </div>
        </motion.div>

        {/* Usage Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Platform Usage</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Users"
              value={data.usage.totalUsers}
              icon={Users}
              color="orange"
            />
            <StatCard
              title="Active Apprentices"
              value={data.usage.totalApprentices}
              subtitle="In organizations"
              icon={Users}
              color="green"
            />
            <StatCard
              title="Total Entries"
              value={data.usage.totalEntries.toLocaleString()}
              icon={FileText}
              color="blue"
            />
            <StatCard
              title="Entries (30 days)"
              value={data.usage.entriesLast30Days.toLocaleString()}
              subtitle="Platform activity"
              icon={Calendar}
              color="purple"
            />
          </div>
        </motion.div>

        {/* Subscribers Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-orange-500" />
                Pro Subscribers
              </CardTitle>
              <CardDescription>
                Active paying customers with their subscription status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.subscriptions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No Pro subscribers yet
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Organization</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Plan</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Joined</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Renews</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.subscriptions.map((sub) => (
                        <tr key={sub.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-900">{sub.name}</td>
                          <td className="py-3 px-4">
                            <Badge className="bg-orange-100 text-orange-700 capitalize">
                              {sub.plan}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={
                              sub.status === "active" ? "bg-green-100 text-green-700" :
                              sub.status === "trialing" ? "bg-blue-100 text-blue-700" :
                              "bg-gray-100 text-gray-700"
                            }>
                              {sub.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {new Date(sub.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {sub.currentPeriodEnd
                              ? new Date(sub.currentPeriodEnd).toLocaleDateString()
                              : "-"
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
