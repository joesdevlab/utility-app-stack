"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAdminData } from "@/components/admin/admin-layout";
import {
  StatCard,
  AnimatedNumber,
  LineChart,
  BarChart,
  DonutChart,
  ProgressRing,
  formatCurrency,
} from "@/components/admin/admin-charts";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Crown,
  Building2,
  Users,
  UserPlus,
  Zap,
  Target,
  Repeat,
  BarChart3,
  PieChart,
  Clock,
  Calendar,
} from "lucide-react";

export default function AdminOverviewPage() {
  const { displayData } = useAdminData();

  const chartData = displayData.monthlyTrend.map((m) => ({ label: m.month, value: m.mrr }));

  const donutData = [
    { label: "Paying", value: displayData.customers.paying, color: "#10b981" },
    { label: "Free", value: displayData.customers.free, color: "#3b82f6" },
    { label: "Trialing", value: displayData.customers.trialing, color: "#f59e0b" },
    { label: "Churned", value: displayData.customers.churned, color: "#ef4444" },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-8">
      {/* Hero MRR Card + Top Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="lg:col-span-2 relative overflow-hidden border-0 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IGZpbGw9InVybCgjZ3JpZCkiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiLz48L3N2Zz4=')] opacity-50" />

          <CardContent className="relative pt-8 pb-6 text-white">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <p className="text-orange-100 font-medium">Monthly Recurring Revenue</p>
                  <Badge className="bg-white/20 text-white border-0 text-xs">
                    <Calendar className="h-3 w-3 mr-1" />
                    Live
                  </Badge>
                </div>
                <div className="flex items-baseline gap-3">
                  <AnimatedNumber
                    value={displayData.mrr.current}
                    format="currency"
                    className="text-5xl font-bold"
                    duration={1200}
                  />
                  {displayData.mrr.growthRate !== 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Badge className="bg-white/20 text-white hover:bg-white/30 border-0">
                        {displayData.mrr.growthRate >= 0 ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {displayData.mrr.growthRate >= 0 ? "+" : ""}
                        {displayData.mrr.growthRate}%
                      </Badge>
                    </motion.div>
                  )}
                </div>
              </div>
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center"
              >
                <DollarSign className="h-8 w-8 text-white" />
              </motion.div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/20 grid grid-cols-3 gap-6">
              {[
                { label: "New MRR", value: displayData.mrr.new, prefix: "+" },
                { label: "Churned", value: displayData.mrr.churned, prefix: "-" },
                { label: "Net", value: displayData.mrr.net, prefix: displayData.mrr.net >= 0 ? "+" : "" },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                >
                  <p className="text-orange-100 text-xs font-medium">{item.label}</p>
                  <p className="text-xl font-semibold mt-1">
                    {item.prefix}
                    <AnimatedNumber value={Math.abs(item.value)} format="currency" duration={1000} />
                  </p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        <StatCard
          title="Annual Run Rate"
          value={displayData.mrr.arr}
          format="currency"
          subtitle="Projected yearly revenue"
          icon={TrendingUp}
          color="green"
          size="large"
          delay={0.2}
        />

        <StatCard
          title="Paying Customers"
          value={displayData.customers.paying}
          subtitle={`${displayData.customers.free} on free tier`}
          icon={Crown}
          color="purple"
          size="large"
          delay={0.3}
        />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard title="NRR" value={`${displayData.mrr.nrr}%`} format="text" subtitle="Net Revenue Retention" icon={Repeat} color={displayData.mrr.nrr >= 100 ? "green" : "red"} delay={0.1} />
        <StatCard title="Churn Rate" value={`${displayData.customers.churnRate}%`} format="text" subtitle="Monthly customer churn" icon={TrendingDown} color={displayData.customers.churnRate > 5 ? "red" : "green"} delay={0.15} />
        <StatCard title="LTV" value={displayData.customers.ltv} format="currency" subtitle="Customer lifetime value" icon={Target} color="blue" delay={0.2} />
        <StatCard title="ARPU" value={displayData.customers.arpu} format="currency" subtitle="Avg revenue per user" icon={DollarSign} color="purple" delay={0.25} />
        <StatCard title="Conversion Rate" value={`${displayData.acquisition.conversionRate}%`} format="text" subtitle={`${displayData.acquisition.conversionsThisMonth} this month`} icon={Zap} color="orange" delay={0.3} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-white" />
                </div>
                MRR Trend
              </CardTitle>
              <CardDescription>Last 6 months revenue growth</CardDescription>
            </CardHeader>
            <CardContent>
              <LineChart data={chartData} height={180} color="orange" />
              <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t">
                {displayData.monthlyTrend.slice(-3).map((m, i) => (
                  <motion.div
                    key={m.month}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + i * 0.1 }}
                    className="text-center p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50"
                  >
                    <p className="text-xs text-muted-foreground font-medium">{m.month}</p>
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(m.mrr)}</p>
                    <p className="text-xs text-muted-foreground">{m.customers} customers</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="hover:shadow-lg transition-shadow h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <PieChart className="h-4 w-4 text-white" />
                </div>
                Customer Mix
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <DonutChart data={donutData} size={180} />
              <div className="grid grid-cols-2 gap-3 mt-6 w-full">
                {donutData.map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                    <span className="text-sm font-semibold ml-auto">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Acquisition & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <UserPlus className="h-4 w-4 text-white" />
                </div>
                Acquisition
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart
                data={[
                  { label: "2 mo ago", value: displayData.acquisition.twoMonthsAgo, color: "bg-gradient-to-t from-blue-400 to-blue-300" },
                  { label: "Last mo", value: displayData.acquisition.lastMonth, color: "bg-gradient-to-t from-blue-500 to-blue-400" },
                  { label: "This mo", value: displayData.acquisition.thisMonth, color: "bg-gradient-to-t from-orange-500 to-orange-400" },
                ]}
                height={120}
              />
              <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                    <p className="text-2xl font-bold text-orange-600">{displayData.acquisition.conversionRate}%</p>
                  </div>
                  <ProgressRing value={displayData.acquisition.conversionRate} max={100} color="orange" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-white" />
                </div>
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                {displayData.recentActivity.slice(0, 8).map((activity, i) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + i * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-gray-50 to-transparent hover:from-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        activity.type === "upgrade"
                          ? "bg-gradient-to-br from-emerald-100 to-emerald-50"
                          : "bg-gradient-to-br from-blue-100 to-blue-50"
                      }`}>
                        {activity.type === "upgrade" ? (
                          <Crown className="h-5 w-5 text-emerald-600" />
                        ) : (
                          <Building2 className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-900">{activity.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(activity.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={
                        activity.type === "upgrade"
                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                          : "bg-blue-100 text-blue-700 hover:bg-blue-100"
                      }
                    >
                      {activity.type === "upgrade" ? "Upgraded" : "Signed Up"}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
