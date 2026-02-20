import { Skeleton } from "@/components/ui/skeleton";

export function LoadingCard() {
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton className="h-[125px] w-full rounded-xl bg-orange-100" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px] bg-orange-50" />
        <Skeleton className="h-4 w-[200px] bg-orange-50" />
      </div>
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="container py-8 space-y-6 bg-white min-h-screen">
      <Skeleton className="h-10 w-[300px] bg-orange-100" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <LoadingCard />
        <LoadingCard />
        <LoadingCard />
      </div>
    </div>
  );
}

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center bg-white ${className}`}>
      <div className="w-12 h-12 rounded-xl overflow-hidden mb-4 shadow-lg shadow-orange-500/20">
        <img src="/Logo-v1-128-128.png" alt="Apprentice Log" className="w-full h-full object-cover" />
      </div>
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500" />
    </div>
  );
}
