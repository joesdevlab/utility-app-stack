"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";

// Animated counter hook
export function useAnimatedCounter(end: number, duration = 1000, enabled = true) {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);
  const startTime = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      setCount(end);
      return;
    }

    countRef.current = 0;
    startTime.current = null;

    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(easeOutQuart * end);

      if (current !== countRef.current) {
        countRef.current = current;
        setCount(current);
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration, enabled]);

  return count;
}

export function formatCurrency(amount: number, currency = "NZD") {
  return new Intl.NumberFormat("en-NZ", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number) {
  return new Intl.NumberFormat("en-NZ").format(num);
}

// Animated Number Component
export function AnimatedNumber({
  value,
  format = "number",
  className = "",
  duration = 1000,
}: {
  value: number;
  format?: "number" | "currency" | "percent";
  className?: string;
  duration?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const animatedValue = useAnimatedCounter(value, duration, isInView);

  const formatted =
    format === "currency"
      ? formatCurrency(animatedValue)
      : format === "percent"
      ? `${animatedValue}%`
      : formatNumber(animatedValue);

  return (
    <span ref={ref} className={className}>
      {formatted}
    </span>
  );
}

// Stat Card with animations
export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendLabel,
  color = "orange",
  size = "default",
  delay = 0,
  format = "number",
}: {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ElementType;
  trend?: number;
  trendLabel?: string;
  color?: "orange" | "green" | "blue" | "purple" | "red" | "yellow";
  size?: "default" | "large";
  delay?: number;
  format?: "number" | "currency" | "percent" | "text";
}) {
  const colorClasses = {
    orange: "from-orange-500 to-orange-600 shadow-orange-500/25",
    green: "from-emerald-500 to-emerald-600 shadow-emerald-500/25",
    blue: "from-blue-500 to-blue-600 shadow-blue-500/25",
    purple: "from-blue-500 to-blue-600 shadow-blue-500/25",
    red: "from-rose-500 to-rose-600 shadow-rose-500/25",
    yellow: "from-amber-500 to-amber-600 shadow-amber-500/25",
  };

  const bgGlowClasses = {
    orange: "bg-orange-500/5",
    green: "bg-emerald-500/5",
    blue: "bg-blue-500/5",
    purple: "bg-blue-500/5",
    red: "bg-rose-500/5",
    yellow: "bg-amber-500/5",
  };

  const isPositive = trend !== undefined && trend >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
    >
      <Card className={`group relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
        <div className={`absolute inset-0 ${bgGlowClasses[color]} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

        <CardContent className={`relative ${size === "large" ? "pt-8 pb-6" : "pt-6"}`}>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <div className="flex items-baseline gap-2">
                {typeof value === "number" && format !== "text" ? (
                  <AnimatedNumber
                    value={value}
                    format={format as "number" | "currency" | "percent"}
                    className={`font-bold text-gray-900 ${size === "large" ? "text-4xl" : "text-2xl"}`}
                    duration={800}
                  />
                ) : (
                  <p className={`font-bold text-gray-900 ${size === "large" ? "text-4xl" : "text-2xl"}`}>
                    {value}
                  </p>
                )}
                {trend !== undefined && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: delay + 0.3 }}
                  >
                    <Badge
                      className={`${
                        isPositive
                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                          : "bg-rose-100 text-rose-700 hover:bg-rose-100"
                      }`}
                    >
                      {isPositive ? (
                        <ArrowUpRight className="h-3 w-3 mr-0.5" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 mr-0.5" />
                      )}
                      {Math.abs(trend)}%
                    </Badge>
                  </motion.div>
                )}
              </div>
              {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
              {trendLabel && <p className="text-xs text-muted-foreground">{trendLabel}</p>}
            </div>
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400 }}
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} shadow-lg flex items-center justify-center`}
            >
              <Icon className="h-6 w-6 text-white" />
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// SVG Line Chart
export function LineChart({
  data,
  height = 120,
  showLabels = true,
  color = "orange",
}: {
  data: { label: string; value: number }[];
  height?: number;
  showLabels?: boolean;
  color?: "orange" | "green" | "blue";
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  if (data.length === 0) return null;

  const max = Math.max(...data.map((d) => d.value), 1);
  const min = 0;
  const range = max - min || 1;

  const padding = { top: 20, right: 20, bottom: showLabels ? 30 : 10, left: 20 };
  const width = 100;
  const chartHeight = height - padding.top - padding.bottom;
  const chartWidth = width - padding.left - padding.right;

  const points = data.map((d, i) => ({
    x: padding.left + (i / (data.length - 1)) * chartWidth,
    y: padding.top + chartHeight - ((d.value - min) / range) * chartHeight,
    value: d.value,
    label: d.label,
  }));

  const pathD = points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(" ");

  const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`;

  const colorClasses = {
    orange: { stroke: "#f97316", fill: "url(#orangeGradient)", dot: "#ea580c" },
    green: { stroke: "#10b981", fill: "url(#greenGradient)", dot: "#059669" },
    blue: { stroke: "#3b82f6", fill: "url(#blueGradient)", dot: "#2563eb" },
  };

  return (
    <div ref={ref} className="relative w-full" style={{ height }}>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="greenGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="blueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
          <line
            key={ratio}
            x1={padding.left}
            y1={padding.top + chartHeight * (1 - ratio)}
            x2={width - padding.right}
            y2={padding.top + chartHeight * (1 - ratio)}
            stroke="#e5e7eb"
            strokeWidth="0.3"
            strokeDasharray="2,2"
          />
        ))}

        <motion.path
          d={areaD}
          fill={colorClasses[color].fill}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        />

        <motion.path
          d={pathD}
          fill="none"
          stroke={colorClasses[color].stroke}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={isInView ? { pathLength: 1 } : {}}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
        />

        {points.map((point, i) => (
          <motion.g
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.3, delay: 0.5 + i * 0.1 }}
          >
            <circle
              cx={point.x}
              cy={point.y}
              r={hoveredIndex === i ? 4 : 3}
              fill="white"
              stroke={colorClasses[color].dot}
              strokeWidth="2"
              className="cursor-pointer transition-all duration-200"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          </motion.g>
        ))}
      </svg>

      {showLabels && (
        <div className="flex justify-between px-5 text-xs text-muted-foreground mt-1">
          {data.map((d, i) => (
            <span key={i} className={hoveredIndex === i ? "text-gray-900 font-medium" : ""}>
              {d.label}
            </span>
          ))}
        </div>
      )}

      <AnimatePresence>
        {hoveredIndex !== null && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-0 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-3 py-1.5 rounded-lg text-sm shadow-lg z-10"
          >
            <p className="font-semibold">{formatCurrency(points[hoveredIndex].value)}</p>
            <p className="text-gray-400 text-xs">{points[hoveredIndex].label}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Bar Chart
export function BarChart({
  data,
  height = 100,
}: {
  data: { label: string; value: number; color?: string }[];
  height?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  if (data.length === 0) return null;
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div ref={ref} className="flex items-end gap-2" style={{ height }}>
      {data.map((item, i) => (
        <motion.div
          key={i}
          className="flex-1 flex flex-col items-center gap-2"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: i * 0.1 }}
        >
          <motion.div
            className={`w-full rounded-t-lg ${item.color || "bg-gradient-to-t from-orange-500 to-orange-400"} relative group cursor-pointer`}
            initial={{ height: 0 }}
            animate={isInView ? { height: `${(item.value / max) * 100}%` } : {}}
            transition={{ duration: 0.6, delay: 0.2 + i * 0.1, ease: "easeOut" }}
            style={{ minHeight: 4 }}
            whileHover={{ scale: 1.05 }}
          >
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {formatNumber(item.value)}
            </div>
          </motion.div>
          <span className="text-xs text-muted-foreground">{item.label}</span>
        </motion.div>
      ))}
    </div>
  );
}

// Donut Chart
export function DonutChart({
  data,
  size = 160,
}: {
  data: { label: string; value: number; color: string }[];
  size?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const total = data.reduce((sum, d) => sum + d.value, 0);
  const radius = size / 2 - 20;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercentage = 0;
  const segments = data.map((d) => {
    const percentage = total > 0 ? d.value / total : 0;
    const offset = accumulatedPercentage;
    accumulatedPercentage += percentage;
    return {
      ...d,
      percentage,
      offset,
      strokeDasharray: `${percentage * circumference} ${circumference}`,
      strokeDashoffset: -offset * circumference,
    };
  });

  return (
    <div ref={ref} className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {segments.map((segment, i) => (
          <motion.circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={segment.color}
            strokeWidth={hoveredIndex === i ? 24 : 20}
            strokeDasharray={segment.strokeDasharray}
            strokeDashoffset={segment.strokeDashoffset}
            className="cursor-pointer transition-all duration-200"
            initial={{ strokeDasharray: `0 ${circumference}` }}
            animate={isInView ? { strokeDasharray: segment.strokeDasharray } : {}}
            transition={{ duration: 0.8, delay: 0.2 + i * 0.15, ease: "easeOut" }}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          />
        ))}
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <AnimatedNumber value={total} className="text-2xl font-bold text-gray-900" />
        <span className="text-xs text-muted-foreground">Total</span>
      </div>

      <AnimatePresence>
        {hoveredIndex !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-3 py-1.5 rounded-lg text-sm shadow-lg"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: segments[hoveredIndex].color }}
              />
              <span>{segments[hoveredIndex].label}</span>
              <span className="font-semibold">{segments[hoveredIndex].value}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Health Badge
export function HealthBadge({ status }: { status: "healthy" | "at-risk" | "critical" }) {
  const config = {
    healthy: { icon: CheckCircle2, color: "bg-emerald-100 text-emerald-700", label: "Healthy" },
    "at-risk": { icon: AlertTriangle, color: "bg-amber-100 text-amber-700", label: "At Risk" },
    critical: { icon: XCircle, color: "bg-rose-100 text-rose-700", label: "Critical" },
  };
  const { icon: Icon, color, label } = config[status];

  return (
    <Badge className={`${color} gap-1`}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}

// Progress Ring
export function ProgressRing({ value, max, size = 60, color = "orange" }: { value: number; max: number; size?: number; color?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const percentage = max > 0 ? (value / max) * 100 : 0;
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const colors: Record<string, string> = {
    orange: "#f97316",
    green: "#10b981",
    red: "#ef4444",
    blue: "#3b82f6",
  };

  return (
    <div ref={ref} className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e5e7eb" strokeWidth="6" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors[color] || colors.orange}
          strokeWidth="6"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={isInView ? { strokeDashoffset: offset } : {}}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-semibold">{Math.round(percentage)}%</span>
      </div>
    </div>
  );
}

// CSV Export function
export function exportToCSV(data: MRRData, filename: string) {
  const rows: string[][] = [
    ["Metric", "Value", "Notes"],
    ["MRR (Current)", `$${data.mrr.current}`, "Monthly Recurring Revenue"],
    ["MRR (New)", `$${data.mrr.new}`, "New subscriptions this month"],
    ["MRR (Churned)", `$${data.mrr.churned}`, "Lost revenue this month"],
    ["MRR (Net)", `$${data.mrr.net}`, "Net change this month"],
    ["Growth Rate", `${data.mrr.growthRate}%`, "Month-over-month growth"],
    ["ARR", `$${data.mrr.arr}`, "Annual Run Rate"],
    ["NRR", `${data.mrr.nrr}%`, "Net Revenue Retention"],
    [""],
    ["Total Customers", data.customers.total.toString(), ""],
    ["Paying Customers", data.customers.paying.toString(), ""],
    ["Free Tier", data.customers.free.toString(), ""],
    ["Churned", data.customers.churned.toString(), ""],
    ["Churn Rate", `${data.customers.churnRate}%`, ""],
    ["LTV", `$${data.customers.ltv}`, "Lifetime Value"],
    ["ARPU", `$${data.customers.arpu}`, "Avg Revenue Per User"],
    [""],
    ["New Signups (This Month)", data.acquisition.thisMonth.toString(), ""],
    ["Conversion Rate", `${data.acquisition.conversionRate}%`, "Free to paid"],
    [""],
    ["Total Users", data.usage.totalUsers.toString(), ""],
    ["Total Apprentices", data.usage.totalApprentices.toString(), ""],
    ["Total Entries", data.usage.totalEntries.toString(), ""],
    ["Entries (30d)", data.usage.entriesLast30Days.toString(), ""],
    ["Active Users (30d)", data.usage.activeUsersLast30Days.toString(), ""],
  ];

  if (data.customerHealth.length > 0) {
    rows.push([""]);
    rows.push(["Customer Health"]);
    rows.push(["Name", "Apprentices", "Entries (30d)", "Health Score", "Status"]);
    data.customerHealth.forEach(c => {
      rows.push([c.name, c.apprentices.toString(), c.entriesLast30Days.toString(), c.healthScore.toString(), c.healthStatus]);
    });
  }

  const csvContent = rows.map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

// MRR Data Type
export interface MRRData {
  mrr: {
    current: number;
    new: number;
    churned: number;
    net: number;
    lastMonth: number;
    growthRate: number;
    arr: number;
    nrr: number;
  };
  customers: {
    total: number;
    paying: number;
    free: number;
    trialing: number;
    churned: number;
    churnRate: number;
    ltv: number;
    arpu: number;
  };
  acquisition: {
    thisMonth: number;
    lastMonth: number;
    twoMonthsAgo: number;
    conversionRate: number;
    conversionsThisMonth: number;
  };
  usage: {
    totalUsers: number;
    totalApprentices: number;
    avgApprenticesPerPayingOrg: number;
    totalEntries: number;
    entriesLast30Days: number;
    entriesLast7Days: number;
    activeUsersLast30Days: number;
  };
  monthlyTrend: Array<{
    month: string;
    mrr: number;
    customers: number;
    newSignups: number;
  }>;
  customerHealth: Array<{
    id: string;
    name: string;
    status: string;
    apprentices: number;
    entriesLast30Days: number;
    healthScore: number;
    healthStatus: "healthy" | "at-risk" | "critical";
    currentPeriodEnd: string;
    createdAt: string;
  }>;
  recentActivity: Array<{
    id: string;
    name: string;
    plan: string;
    status: string;
    createdAt: string;
    type: string;
  }>;
  config: {
    pricePerMonth: number;
    currency: string;
  };
}

// Demo data
export const DEMO_DATA: MRRData = {
  mrr: {
    current: 4351, new: 522, churned: 87, net: 435, lastMonth: 3916,
    growthRate: 11.1, arr: 52212, nrr: 108.5,
  },
  customers: {
    total: 187, paying: 151, free: 28, trialing: 8, churned: 12,
    churnRate: 2.3, ltv: 1261, arpu: 23.27,
  },
  acquisition: {
    thisMonth: 24, lastMonth: 19, twoMonthsAgo: 15,
    conversionRate: 68.4, conversionsThisMonth: 18,
  },
  usage: {
    totalUsers: 847, totalApprentices: 612, avgApprenticesPerPayingOrg: 4.1,
    totalEntries: 28453, entriesLast30Days: 3847, entriesLast7Days: 892,
    activeUsersLast30Days: 423,
  },
  monthlyTrend: [
    { month: "Aug '25", mrr: 2320, customers: 80, newSignups: 12 },
    { month: "Sep '25", mrr: 2842, customers: 98, newSignups: 18 },
    { month: "Oct '25", mrr: 3248, customers: 112, newSignups: 14 },
    { month: "Nov '25", mrr: 3596, customers: 124, newSignups: 12 },
    { month: "Dec '25", mrr: 3916, customers: 135, newSignups: 11 },
    { month: "Jan '26", mrr: 4351, customers: 151, newSignups: 24 },
  ],
  customerHealth: [
    { id: "1", name: "BuildRight Construction", status: "active", apprentices: 8, entriesLast30Days: 156, healthScore: 92, healthStatus: "healthy", currentPeriodEnd: "2026-02-15", createdAt: "2025-03-10" },
    { id: "2", name: "Smith & Sons Electrical", status: "active", apprentices: 5, entriesLast30Days: 89, healthScore: 78, healthStatus: "healthy", currentPeriodEnd: "2026-02-08", createdAt: "2025-04-22" },
    { id: "3", name: "Auckland Plumbing Co", status: "active", apprentices: 12, entriesLast30Days: 234, healthScore: 95, healthStatus: "healthy", currentPeriodEnd: "2026-01-28", createdAt: "2025-02-15" },
    { id: "4", name: "Kiwi Carpentry Ltd", status: "active", apprentices: 3, entriesLast30Days: 42, healthScore: 65, healthStatus: "at-risk", currentPeriodEnd: "2026-02-20", createdAt: "2025-06-01" },
    { id: "5", name: "Pacific Trade Services", status: "active", apprentices: 6, entriesLast30Days: 78, healthScore: 71, healthStatus: "healthy", currentPeriodEnd: "2026-02-12", createdAt: "2025-05-18" },
    { id: "6", name: "Wellington Builders", status: "active", apprentices: 4, entriesLast30Days: 23, healthScore: 45, healthStatus: "at-risk", currentPeriodEnd: "2026-02-25", createdAt: "2025-07-08" },
    { id: "7", name: "South Island HVAC", status: "active", apprentices: 7, entriesLast30Days: 112, healthScore: 82, healthStatus: "healthy", currentPeriodEnd: "2026-02-03", createdAt: "2025-04-10" },
    { id: "8", name: "Canterbury Electricians", status: "active", apprentices: 9, entriesLast30Days: 167, healthScore: 88, healthStatus: "healthy", currentPeriodEnd: "2026-02-18", createdAt: "2025-03-25" },
    { id: "9", name: "North Shore Plumbing", status: "active", apprentices: 2, entriesLast30Days: 8, healthScore: 28, healthStatus: "critical", currentPeriodEnd: "2026-01-30", createdAt: "2025-08-15" },
    { id: "10", name: "Hamilton Trade Academy", status: "active", apprentices: 15, entriesLast30Days: 312, healthScore: 98, healthStatus: "healthy", currentPeriodEnd: "2026-02-22", createdAt: "2025-01-20" },
    { id: "11", name: "Otago Construction Group", status: "active", apprentices: 6, entriesLast30Days: 87, healthScore: 74, healthStatus: "healthy", currentPeriodEnd: "2026-02-10", createdAt: "2025-05-05" },
    { id: "12", name: "Bay of Plenty Builders", status: "active", apprentices: 4, entriesLast30Days: 15, healthScore: 35, healthStatus: "critical", currentPeriodEnd: "2026-02-28", createdAt: "2025-09-01" },
  ],
  recentActivity: [
    { id: "1", name: "Taranaki Electrical Services", plan: "pro", status: "active", createdAt: "2026-01-24", type: "upgrade" },
    { id: "2", name: "Waikato Plumbers Union", plan: "free", status: "active", createdAt: "2026-01-23", type: "signup" },
    { id: "3", name: "Northland Carpentry Co", plan: "pro", status: "active", createdAt: "2026-01-22", type: "upgrade" },
    { id: "4", name: "Central Otago Builders", plan: "free", status: "active", createdAt: "2026-01-21", type: "signup" },
    { id: "5", name: "Hawke's Bay Trade School", plan: "pro", status: "active", createdAt: "2026-01-20", type: "upgrade" },
    { id: "6", name: "Marlborough Construction", plan: "free", status: "active", createdAt: "2026-01-19", type: "signup" },
    { id: "7", name: "Gisborne Electrical Ltd", plan: "pro", status: "active", createdAt: "2026-01-18", type: "upgrade" },
    { id: "8", name: "Southland Trade Services", plan: "free", status: "active", createdAt: "2026-01-17", type: "signup" },
  ],
  config: { pricePerMonth: 29, currency: "NZD" },
};
