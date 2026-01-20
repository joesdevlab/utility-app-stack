"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  FileText,
  Settings,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "Dashboard",
    href: "/employer/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Team",
    href: "/employer/team",
    icon: Users,
  },
  {
    label: "Apprentices",
    href: "/employer/apprentices",
    icon: UserCheck,
  },
  {
    label: "Reports",
    href: "/employer/reports",
    icon: FileText,
  },
  {
    label: "Settings",
    href: "/employer/settings",
    icon: Settings,
  },
  {
    label: "Billing",
    href: "/employer/billing",
    icon: CreditCard,
  },
];

export function EmployerNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {navItems.map((item, index) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        return (
          <Link key={item.href} href={item.href}>
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                isActive
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md shadow-orange-500/20"
                  : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "text-white")} />
              {item.label}
            </motion.div>
          </Link>
        );
      })}
    </nav>
  );
}

export function EmployerMobileNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur-lg z-50 safe-area-bottom">
      <nav className="flex justify-around py-2 max-w-md mx-auto">
        {navItems.slice(0, 5).map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-1 relative",
                  isActive ? "text-orange-500" : "text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className={cn("text-xs", isActive && "font-medium")}>{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="employerNavIndicator"
                    className="absolute -bottom-1 w-1 h-1 rounded-full bg-orange-500"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
