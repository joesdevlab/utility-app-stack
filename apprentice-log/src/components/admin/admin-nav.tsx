"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Users,
  Heart,
  Activity,
  Building2,
  Mail,
  LayoutDashboard,
} from "lucide-react";

const navItems = [
  { label: "Overview", href: "/admin/overview", icon: LayoutDashboard },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Health", href: "/admin/health", icon: Heart },
  { label: "Usage", href: "/admin/usage", icon: Activity },
  { label: "Employers", href: "/admin/employers", icon: Building2 },
  { label: "Emails", href: "/admin/emails", icon: Mail },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {navItems.map((item, index) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        return (
          <motion.div
            key={item.href}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                isActive
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md shadow-orange-500/25"
                  : "text-muted-foreground hover:bg-orange-50 hover:text-orange-600"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          </motion.div>
        );
      })}
    </nav>
  );
}

const mobileNavItems = [
  navItems[0], // Overview
  navItems[1], // Customers
  navItems[4], // Employers
  navItems[5], // Emails
  navItems[3], // Usage
];

export function AdminMobileNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur-lg z-50 safe-area-bottom md:hidden">
      <nav className="flex justify-around py-2 max-w-md mx-auto">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors relative",
                  isActive ? "text-orange-600" : "text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="admin-mobile-indicator"
                    className="absolute -bottom-1 w-1 h-1 rounded-full bg-orange-500"
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
