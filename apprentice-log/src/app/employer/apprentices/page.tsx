"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { useOrgApprentices } from "@/hooks/use-organization";
import { ApprenticeCard } from "@/components/employer/apprentice-card";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Search, UserPlus, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function ApprenticesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filterAttention = searchParams.get("filter") === "attention";
  const { organization } = useAuth();
  const { apprentices, isLoading } = useOrgApprentices(organization?.id);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter apprentices based on search and attention filter
  const filteredApprentices = apprentices.filter((a) => {
    const matchesSearch =
      !searchQuery ||
      a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.full_name?.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterAttention) {
      if (!a.last_entry_date) return matchesSearch;
      const daysSince = Math.floor(
        (Date.now() - new Date(a.last_entry_date).getTime()) / (1000 * 60 * 60 * 24)
      );
      return matchesSearch && daysSince > 7;
    }

    return matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full max-w-md rounded-xl" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Apprentices</h1>
          <p className="text-muted-foreground">
            View and manage your organization's apprentices
          </p>
        </div>
        <Link href="/employer/team/invite">
          <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md shadow-orange-500/20">
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Apprentice
          </Button>
        </Link>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-500" />
          <Input
            type="search"
            placeholder="Search apprentices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-gray-200 focus:border-orange-300 focus:ring-orange-500/20 rounded-xl"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={!filterAttention ? "default" : "outline"}
            size="sm"
            onClick={() => router.push("/employer/apprentices")}
            className={cn(
              "rounded-xl",
              !filterAttention
                ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md shadow-orange-500/20"
                : "border-gray-200 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200"
            )}
          >
            All
          </Button>
          <Button
            variant={filterAttention ? "default" : "outline"}
            size="sm"
            onClick={() => router.push("/employer/apprentices?filter=attention")}
            className={cn(
              "rounded-xl",
              filterAttention
                ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-md shadow-amber-500/20"
                : "border-gray-200 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200"
            )}
          >
            <AlertCircle className="h-4 w-4 mr-1" />
            Needs Attention
          </Button>
        </div>
      </motion.div>

      {/* Apprentice List */}
      {filteredApprentices.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-orange-500" />
              </div>
              {apprentices.length === 0 ? (
                <>
                  <p className="text-gray-600">No apprentices yet</p>
                  <Link href="/employer/team/invite">
                    <Button variant="link" className="mt-2 text-orange-600 hover:text-orange-700">
                      Invite your first apprentice
                    </Button>
                  </Link>
                </>
              ) : (
                <p className="text-muted-foreground">
                  No apprentices match your search
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {filteredApprentices.map((apprentice, index) => (
            <ApprenticeCard
              key={apprentice.id}
              apprentice={apprentice}
              index={index}
              onClick={() => router.push(`/employer/apprentices/${apprentice.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
