"use client";

import { Card, CardContent } from "@/components/ui/card";

export function MedicineCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-lg bg-muted animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-32 bg-muted animate-pulse rounded" />
            <div className="h-4 w-48 bg-muted animate-pulse rounded" />
            <div className="flex gap-2">
              <div className="h-5 w-16 bg-muted animate-pulse rounded-full" />
              <div className="h-5 w-12 bg-muted animate-pulse rounded-full" />
            </div>
          </div>
          <div className="text-right space-y-1">
            <div className="h-6 w-16 bg-muted animate-pulse rounded" />
            <div className="h-4 w-12 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function MedicineListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <MedicineCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ScanHistorySkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-4 w-24 bg-muted animate-pulse rounded" />
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-muted animate-pulse" />
          <div className="h-4 w-32 bg-muted animate-pulse rounded" />
          <div className="h-px flex-1 bg-muted animate-pulse" />
        </div>
        <MedicineListSkeleton count={2} />
      </div>
    </div>
  );
}

export function FavoritesSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-4 w-20 bg-muted animate-pulse rounded" />
      <MedicineListSkeleton count={4} />
    </div>
  );
}
