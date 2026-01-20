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
  Building2,
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
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        return (
          <Link key={item.href} href={item.href}>
            <motion.div
              whileTap={{ scale: 0.98 }}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
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
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background/80 backdrop-blur-lg z-50 safe-area-pb">
      <nav className="flex justify-around py-2">
        {navItems.slice(0, 5).map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-1",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs">{item.label}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
