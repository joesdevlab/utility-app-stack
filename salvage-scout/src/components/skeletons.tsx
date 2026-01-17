"use client";

import { Card } from "@/components/ui/card";

export function ListingCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      {/* Image skeleton */}
      <div className="relative">
        <div className="w-full aspect-video bg-muted animate-pulse" />
        {/* Badges skeleton */}
        <div className="absolute top-3 left-3 flex gap-2">
          <div className="h-5 w-20 bg-muted/50 animate-pulse rounded-full" />
          <div className="h-5 w-16 bg-muted/50 animate-pulse rounded-full" />
        </div>
      </div>
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        <div className="h-5 w-48 bg-muted animate-pulse rounded" />
        <div className="space-y-1">
          <div className="h-4 w-full bg-muted animate-pulse rounded" />
          <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-muted animate-pulse rounded" />
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
          </div>
          <div className="h-8 w-20 bg-muted animate-pulse rounded" />
        </div>
      </div>
    </Card>
  );
}

export function ListingListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <ListingCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProfileStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="text-center p-4 rounded-lg bg-muted/50">
          <div className="h-6 w-6 mx-auto bg-muted animate-pulse rounded mb-2" />
          <div className="h-6 w-8 mx-auto bg-muted animate-pulse rounded mb-1" />
          <div className="h-3 w-16 mx-auto bg-muted animate-pulse rounded" />
        </div>
      ))}
    </div>
  );
}
