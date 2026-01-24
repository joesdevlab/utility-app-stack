"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Building2,
  Users,
  FileText,
  Crown,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  BarChart3,
  PieChart,
  Zap,
  Target,
  Heart,
  UserPlus,
  Sparkles,
  Calendar,
  FlaskConical,
  Download,
  Repeat,
} from "lucide-react";

interface MRRData {
  mrr: {
    current: number;
    new: number;
    churned: number;
    net: number;
    lastMonth: number;
    growthRate: number;
    arr: number;
    nrr: number; // Net Revenue Retention
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

// Demo data that shows what the dashboard looks like at scale
const DEMO_DATA: MRRData = {
  mrr: {
    current: 4351,
    new: 522,
    churned: 87,
    net: 435,
    lastMonth: 3916,
    growthRate: 11.1,
    arr: 52212,
    nrr: 108.5, // Net Revenue Retention (>100% means expansion revenue)
  },
  customers: {
    total: 187,
    paying: 151,
    free: 28,
    trialing: 8,
    churned: 12,
    churnRate: 2.3,
    ltv: 1261,
    arpu: 23.27,
  },
  acquisition: {
    thisMonth: 24,
    lastMonth: 19,
    twoMonthsAgo: 15,
    conversionRate: 68.4,
    conversionsThisMonth: 18,
  },
  usage: {
    totalUsers: 847,
    totalApprentices: 612,
    avgApprenticesPerPayingOrg: 4.1,
    totalEntries: 28453,
    entriesLast30Days: 3847,
    entriesLast7Days: 892,
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
  config: {
    pricePerMonth: 29,
    currency: "NZD",
  },
};

// Animated counter hook
function useAnimatedCounter(end: number, duration = 1000, enabled = true) {
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

      // Easing function for smooth animation
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

function formatCurrency(amount: number, currency = "NZD", animated = false) {
  return new Intl.NumberFormat("en-NZ", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatNumber(num: number) {
  return new Intl.NumberFormat("en-NZ").format(num);
}

// Animated Number Component
function AnimatedNumber({
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
function StatCard({
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
    purple: "from-violet-500 to-violet-600 shadow-violet-500/25",
    red: "from-rose-500 to-rose-600 shadow-rose-500/25",
    yellow: "from-amber-500 to-amber-600 shadow-amber-500/25",
  };

  const bgGlowClasses = {
    orange: "bg-orange-500/5",
    green: "bg-emerald-500/5",
    blue: "bg-blue-500/5",
    purple: "bg-violet-500/5",
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
      <Card className={`group relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-${color}-200 hover:-translate-y-1`}>
        {/* Subtle gradient glow */}
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
              {subtitle && (
                <p className="text-xs text-muted-foreground">{subtitle}</p>
              )}
              {trendLabel && (
                <p className="text-xs text-muted-foreground">{trendLabel}</p>
              )}
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

// Beautiful SVG Line Chart
function LineChart({
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

        {/* Grid lines */}
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

        {/* Area fill */}
        <motion.path
          d={areaD}
          fill={colorClasses[color].fill}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        />

        {/* Line */}
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

        {/* Data points */}
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

      {/* Labels */}
      {showLabels && (
        <div className="flex justify-between px-5 text-xs text-muted-foreground mt-1">
          {data.map((d, i) => (
            <span key={i} className={hoveredIndex === i ? "text-gray-900 font-medium" : ""}>
              {d.label}
            </span>
          ))}
        </div>
      )}

      {/* Tooltip */}
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
function BarChart({
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
            {/* Tooltip */}
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
function DonutChart({
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
  const segments = data.map((d, i) => {
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

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <AnimatedNumber value={total} className="text-2xl font-bold text-gray-900" />
        <span className="text-xs text-muted-foreground">Total</span>
      </div>

      {/* Hover tooltip */}
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

function HealthBadge({ status }: { status: "healthy" | "at-risk" | "critical" }) {
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
function ProgressRing({ value, max, size = 60, color = "orange" }: { value: number; max: number; size?: number; color?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const percentage = max > 0 ? (value / max) * 100 : 0;
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const colors = {
    orange: "#f97316",
    green: "#10b981",
    red: "#ef4444",
    blue: "#3b82f6",
  };

  return (
    <div ref={ref} className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="6"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors[color as keyof typeof colors] || colors.orange}
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

// Loading skeleton
function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-orange-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-80 rounded-xl lg:col-span-2" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// CSV Export function
function exportToCSV(data: MRRData, filename: string) {
  const rows: string[][] = [
    ["Metric", "Value", "Notes"],
    ["MRR (Current)", `$${data.mrr.current}`, "Monthly Recurring Revenue"],
    ["MRR (New)", `$${data.mrr.new}`, "New subscriptions this month"],
    ["MRR (Churned)", `$${data.mrr.churned}`, "Lost revenue this month"],
    ["MRR (Net)", `$${data.mrr.net}`, "Net change this month"],
    ["MRR (Last Month)", `$${data.mrr.lastMonth}`, "Previous month MRR"],
    ["Growth Rate", `${data.mrr.growthRate}%`, "Month-over-month growth"],
    ["ARR", `$${data.mrr.arr}`, "Annual Run Rate"],
    ["NRR", `${data.mrr.nrr}%`, "Net Revenue Retention"],
    [""],
    ["Total Customers", data.customers.total.toString(), ""],
    ["Paying Customers", data.customers.paying.toString(), ""],
    ["Free Tier", data.customers.free.toString(), ""],
    ["Trialing", data.customers.trialing.toString(), ""],
    ["Churned", data.customers.churned.toString(), ""],
    ["Churn Rate", `${data.customers.churnRate}%`, ""],
    ["LTV", `$${data.customers.ltv}`, "Lifetime Value"],
    ["ARPU", `$${data.customers.arpu}`, "Avg Revenue Per User"],
    [""],
    ["New Signups (This Month)", data.acquisition.thisMonth.toString(), ""],
    ["New Signups (Last Month)", data.acquisition.lastMonth.toString(), ""],
    ["Conversion Rate", `${data.acquisition.conversionRate}%`, "Free to paid"],
    [""],
    ["Total Users", data.usage.totalUsers.toString(), ""],
    ["Total Apprentices", data.usage.totalApprentices.toString(), ""],
    ["Total Entries", data.usage.totalEntries.toString(), ""],
    ["Entries (30d)", data.usage.entriesLast30Days.toString(), ""],
    ["Entries (7d)", data.usage.entriesLast7Days.toString(), ""],
    ["Active Users (30d)", data.usage.activeUsersLast30Days.toString(), ""],
  ];

  // Add customer health data
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

export default function AdminDashboard() {
  const [data, setData] = useState<MRRData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [useDemoData, setUseDemoData] = useState(false);

  const fetchData = async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/mrr");
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to fetch data");
      }
      const result = await response.json();
      setData(result);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-orange-50/30 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="max-w-md w-full shadow-xl">
            <CardContent className="pt-8 pb-6 text-center space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-rose-100 to-rose-50 flex items-center justify-center"
              >
                <XCircle className="h-10 w-10 text-rose-600" />
              </motion.div>
              <div>
                <p className="text-rose-600 font-semibold text-lg">{error}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Make sure you&apos;re logged in with an admin account.
                </p>
              </div>
              <Button
                onClick={() => fetchData()}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (!data && !useDemoData) return null;

  // Use demo data when toggle is on, otherwise use real data
  const displayData = useDemoData ? DEMO_DATA : data!;

  const chartData = displayData.monthlyTrend.map((m) => ({ label: m.month, value: m.mrr }));
  const customerChartData = displayData.monthlyTrend.map((m) => ({ label: m.month, value: m.customers }));

  const healthyCounts = displayData.customerHealth.filter((c) => c.healthStatus === "healthy").length;
  const atRiskCounts = displayData.customerHealth.filter((c) => c.healthStatus === "at-risk").length;
  const criticalCounts = displayData.customerHealth.filter((c) => c.healthStatus === "critical").length;

  const donutData = [
    { label: "Paying", value: displayData.customers.paying, color: "#10b981" },
    { label: "Free", value: displayData.customers.free, color: "#3b82f6" },
    { label: "Trialing", value: displayData.customers.trialing, color: "#f59e0b" },
    { label: "Churned", value: displayData.customers.churned, color: "#ef4444" },
  ].filter((d) => d.value > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-orange-50/30">
      {/* Demo Mode Banner */}
      <AnimatePresence>
        {useDemoData && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="bg-gradient-to-r from-violet-600 via-purple-600 to-violet-600 text-white py-2.5 px-4 text-center text-sm font-medium"
          >
            <div className="flex items-center justify-center gap-2">
              <FlaskConical className="h-4 w-4" />
              <span>Demo Mode Active - Showing sample data for 150+ paying customers</span>
              <button
                onClick={() => setUseDemoData(false)}
                className="ml-2 px-2 py-0.5 rounded bg-white/20 hover:bg-white/30 transition-colors text-xs"
              >
                Show Real Data
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ rotate: -180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/25 flex items-center justify-center"
              >
                <Sparkles className="h-6 w-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  SaaS Dashboard
                </h1>
                <p className="text-muted-foreground flex items-center gap-2">
                  <span>Apprentice Log Analytics</span>
                  {lastUpdated && (
                    <span className="text-xs flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {lastUpdated.toLocaleTimeString()}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="flex items-center gap-4">
            {/* Demo Data Toggle */}
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200">
              <FlaskConical className={`h-4 w-4 ${useDemoData ? "text-violet-600" : "text-gray-400"}`} />
              <Label htmlFor="demo-mode" className={`text-sm font-medium cursor-pointer ${useDemoData ? "text-violet-700" : "text-gray-500"}`}>
                Demo Data
              </Label>
              <Switch
                id="demo-mode"
                checked={useDemoData}
                onCheckedChange={setUseDemoData}
                className="data-[state=checked]:bg-violet-600"
              />
            </div>
            <Button
              onClick={() => exportToCSV(displayData, `apprentice-log-metrics-${new Date().toISOString().split("T")[0]}.csv`)}
              variant="outline"
              size="sm"
              className="gap-2 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button
              onClick={() => fetchData(true)}
              variant="outline"
              size="sm"
              className="gap-2 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200"
              disabled={isRefreshing || useDemoData}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </Button>
          </motion.div>
        </motion.div>

        {/* Hero MRR Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-4 gap-4"
        >
          <Card className="lg:col-span-2 relative overflow-hidden border-0 shadow-2xl">
            {/* Animated gradient background */}
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
        </motion.div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white/80 backdrop-blur-sm border shadow-sm p-1">
            <TabsTrigger value="overview" className="gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="customers" className="gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              <Users className="h-4 w-4" />
              Customers
            </TabsTrigger>
            <TabsTrigger value="health" className="gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              <Heart className="h-4 w-4" />
              Health
            </TabsTrigger>
            <TabsTrigger value="usage" className="gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              <Activity className="h-4 w-4" />
              Usage
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <StatCard
                title="NRR"
                value={`${displayData.mrr.nrr}%`}
                format="text"
                subtitle="Net Revenue Retention"
                icon={Repeat}
                color={displayData.mrr.nrr >= 100 ? "green" : "red"}
                delay={0.1}
              />
              <StatCard
                title="Churn Rate"
                value={`${displayData.customers.churnRate}%`}
                format="text"
                subtitle="Monthly customer churn"
                icon={TrendingDown}
                color={displayData.customers.churnRate > 5 ? "red" : "green"}
                delay={0.15}
              />
              <StatCard
                title="LTV"
                value={displayData.customers.ltv}
                format="currency"
                subtitle="Customer lifetime value"
                icon={Target}
                color="blue"
                delay={0.2}
              />
              <StatCard
                title="ARPU"
                value={displayData.customers.arpu}
                format="currency"
                subtitle="Avg revenue per user"
                icon={DollarSign}
                color="purple"
                delay={0.25}
              />
              <StatCard
                title="Conversion Rate"
                value={`${displayData.acquisition.conversionRate}%`}
                format="text"
                subtitle={`${displayData.acquisition.conversionsThisMonth} this month`}
                icon={Zap}
                color="orange"
                delay={0.3}
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="lg:col-span-2"
              >
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

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="hover:shadow-lg transition-shadow h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center">
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
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
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

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
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
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                activity.type === "upgrade"
                                  ? "bg-gradient-to-br from-emerald-100 to-emerald-50"
                                  : "bg-gradient-to-br from-blue-100 to-blue-50"
                              }`}
                            >
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
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers" className="space-y-6">
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
          </TabsContent>

          {/* Health Tab */}
          <TabsContent value="health" className="space-y-6">
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
          </TabsContent>

          {/* Usage Tab */}
          <TabsContent value="usage" className="space-y-6">
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
