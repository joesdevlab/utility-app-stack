"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { useOrgApprentices } from "@/hooks/use-organization";
import { ApprenticeCard } from "@/components/employer/apprentice-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Search, UserPlus, AlertCircle } from "lucide-react";
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
        <Skeleton className="h-10 w-full max-w-md" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Apprentices</h1>
          <p className="text-muted-foreground">
            View and manage your organization's apprentices
          </p>
        </div>
        <Link href="/employer/team/invite">
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Apprentice
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search apprentices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={!filterAttention ? "default" : "outline"}
            size="sm"
            onClick={() => router.push("/employer/apprentices")}
          >
            All
          </Button>
          <Button
            variant={filterAttention ? "default" : "outline"}
            size="sm"
            onClick={() => router.push("/employer/apprentices?filter=attention")}
          >
            <AlertCircle className="h-4 w-4 mr-1" />
            Needs Attention
          </Button>
        </div>
      </div>

      {/* Apprentice List */}
      {filteredApprentices.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
            {apprentices.length === 0 ? (
              <>
                <p className="text-muted-foreground">No apprentices yet</p>
                <Link href="/employer/team/invite">
                  <Button variant="link" className="mt-2">
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
      ) : (
        <div className="space-y-3">
          {filteredApprentices.map((apprentice) => (
            <ApprenticeCard
              key={apprentice.id}
              apprentice={apprentice}
              onClick={() => router.push(`/employer/apprentices/${apprentice.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
