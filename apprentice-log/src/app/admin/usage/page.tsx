"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { useAdminData } from "@/components/admin/admin-layout";
import { StatCard, AnimatedNumber } from "@/components/admin/admin-charts";
import { Users, Building2, Activity, FileText, Zap } from "lucide-react";

export default function AdminUsagePage() {
  const { displayData } = useAdminData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Platform Usage</h1>
        <p className="text-muted-foreground">User activity and engagement metrics</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={displayData.usage.totalUsers} icon={Users} color="orange" delay={0.1} />
        <StatCard title="Apprentices" value={displayData.usage.totalApprentices} subtitle="In organizations" icon={Users} color="green" delay={0.2} />
        <StatCard title="Avg/Org" value={displayData.usage.avgApprenticesPerPayingOrg} format="text" subtitle="Apprentices" icon={Building2} color="blue" delay={0.3} />
        <StatCard title="Active (30d)" value={displayData.usage.activeUsersLast30Days} icon={Activity} color="purple" delay={0.4} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: FileText, value: displayData.usage.totalEntries, label: "Total Entries", color: "from-orange-500 to-orange-400" },
          { icon: Activity, value: displayData.usage.entriesLast30Days, label: "Entries (30d)", color: "from-emerald-500 to-emerald-400" },
          { icon: Zap, value: displayData.usage.entriesLast7Days, label: "Entries (7d)", color: "from-blue-500 to-blue-400" },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow group">
              <CardContent className="pt-8 pb-6 text-center">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${item.color} shadow-lg flex items-center justify-center mb-4`}
                >
                  <item.icon className="h-7 w-7 text-white" />
                </motion.div>
                <AnimatedNumber value={item.value} className="text-3xl font-bold text-gray-900" />
                <p className="text-sm text-muted-foreground mt-1">{item.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
