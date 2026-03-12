"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAdminData } from "@/components/admin/admin-layout";
import { StatCard, LineChart, formatCurrency } from "@/components/admin/admin-charts";
import { Building2, Crown, Users, TrendingDown } from "lucide-react";

export default function AdminCustomersPage() {
  const { displayData } = useAdminData();

  const customerChartData = displayData.monthlyTrend.map((m) => ({ label: m.month, value: m.customers }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Customers</h1>
        <p className="text-muted-foreground">Customer breakdown and growth trends</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Customers" value={displayData.customers.total} icon={Building2} color="orange" delay={0.1} />
        <StatCard title="Paying" value={displayData.customers.paying} subtitle={`${formatCurrency(displayData.config.pricePerMonth)}/mo`} icon={Crown} color="green" delay={0.2} />
        <StatCard title="Free Tier" value={displayData.customers.free} subtitle="Potential upgrades" icon={Users} color="blue" delay={0.3} />
        <StatCard title="Churned" value={displayData.customers.churned} subtitle={`${displayData.customers.churnRate}% rate`} icon={TrendingDown} color="red" delay={0.4} />
      </div>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle>Customer Growth</CardTitle>
          <CardDescription>Paying customers over time</CardDescription>
        </CardHeader>
        <CardContent>
          <LineChart data={customerChartData} height={160} color="green" />
        </CardContent>
      </Card>
    </div>
  );
}
