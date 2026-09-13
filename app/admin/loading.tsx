import { Skeleton } from "@/components/ui/skeleton";

/**
 * Shown instantly on every admin navigation (Next's loading.js convention)
 * while the destination page's data fetches — sidebar/topbar stay put and
 * interactive since this only wraps the `children` slot in admin/layout.tsx.
 */
export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>

      <div className="space-y-3 rounded-xl border border-border p-4 sm:p-6">
        <Skeleton className="h-9 w-full max-w-sm" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}
