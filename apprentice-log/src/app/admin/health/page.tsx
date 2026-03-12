"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAdminData } from "@/components/admin/admin-layout";
import { AnimatedNumber, HealthBadge, ProgressRing } from "@/components/admin/admin-charts";
import { CheckCircle2, AlertTriangle, XCircle, Heart, Users, Building2 } from "lucide-react";

export default function AdminHealthPage() {
  const { displayData } = useAdminData();

  const healthyCounts = displayData.customerHealth.filter((c) => c.healthStatus === "healthy").length;
  const atRiskCounts = displayData.customerHealth.filter((c) => c.healthStatus === "at-risk").length;
  const criticalCounts = displayData.customerHealth.filter((c) => c.healthStatus === "critical").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Customer Health</h1>
        <p className="text-muted-foreground">Activity-based health scores for paying customers</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { count: healthyCounts, status: "healthy", icon: CheckCircle2, color: "emerald", label: "Healthy" },
          { count: atRiskCounts, status: "at-risk", icon: AlertTriangle, color: "amber", label: "At Risk" },
          { count: criticalCounts, status: "critical", icon: XCircle, color: "rose", label: "Critical" },
        ].map((item, i) => (
          <motion.div
            key={item.status}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.1 }}
          >
            <Card className={`border-${item.color}-200 bg-gradient-to-br from-${item.color}-50/50 to-transparent hover:shadow-lg transition-all`}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-${item.color}-100 to-${item.color}-50 flex items-center justify-center`}>
                    <item.icon className={`h-7 w-7 text-${item.color}-600`} />
                  </div>
                  <div>
                    <AnimatedNumber value={item.count} className={`text-4xl font-bold text-${item.color}-700`} />
                    <p className={`text-sm text-${item.color}-600 font-medium`}>{item.label} Customers</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center">
              <Heart className="h-4 w-4 text-white" />
            </div>
            Customer Health Scores
          </CardTitle>
          <CardDescription>Based on activity and engagement in the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          {displayData.customerHealth.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-muted-foreground">No paying customers yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50/50">
                    <th className="text-left py-4 px-4 font-semibold text-gray-600">Customer</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-600">Health</th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-600">Score</th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-600">Apprentices</th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-600">Activity</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-600">Renews</th>
                  </tr>
                </thead>
                <tbody>
                  {displayData.customerHealth.map((customer, i) => (
                    <motion.tr
                      key={customer.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.05 }}
                      className="border-b hover:bg-orange-50/30 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-orange-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{customer.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Since {new Date(customer.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <HealthBadge status={customer.healthStatus} />
                      </td>
                      <td className="py-4 px-4 text-center">
                        <ProgressRing
                          value={customer.healthScore}
                          max={100}
                          size={50}
                          color={customer.healthScore >= 70 ? "green" : customer.healthScore >= 40 ? "orange" : "red"}
                        />
                      </td>
                      <td className="py-4 px-4 text-center font-medium">{customer.apprentices}</td>
                      <td className="py-4 px-4 text-center">
                        <span className="px-2 py-1 rounded-full bg-gray-100 text-sm">
                          {customer.entriesLast30Days} entries
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {customer.currentPeriodEnd ? new Date(customer.currentPeriodEnd).toLocaleDateString() : "-"}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
