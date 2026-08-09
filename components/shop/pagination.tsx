import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

type RawSearchParams = { [key: string]: string | string[] | undefined };

function hrefForPage(pathname: string, searchParams: RawSearchParams, page: number): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (value === undefined) continue;
    params.set(key, Array.isArray(value) ? value.join(",") : value);
  }
  if (page <= 1) params.delete("page");
  else params.set("page", String(page));
  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

function pageNumbers(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);

  const result: (number | "ellipsis")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) result.push("ellipsis");
    result.push(p);
    prev = p;
  }
  return result;
}

export function Pagination({
  pathname,
  searchParams,
  page,
  totalPages,
}: {
  pathname: string;
  searchParams: RawSearchParams;
  page: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-1.5">
      <Link
        href={hrefForPage(pathname, searchParams, page - 1)}
        aria-disabled={page <= 1}
        aria-label="Previous page"
        className={cn(
          "flex size-9 items-center justify-center rounded-md border border-border text-foreground transition-colors hover:border-primary",
          page <= 1 && "pointer-events-none opacity-40"
        )}
      >
        <ChevronLeft className="size-4" />
      </Link>

      {pageNumbers(page, totalPages).map((p, i) =>
        p === "ellipsis" ? (
          <span key={`ellipsis-${i}`} className="px-1 text-sm text-muted-foreground">
            &hellip;
          </span>
        ) : (
          <Link
            key={p}
            href={hrefForPage(pathname, searchParams, p)}
            aria-current={p === page}
            className={cn(
              "flex size-9 items-center justify-center rounded-md border text-sm font-medium transition-colors",
              p === page
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-foreground hover:border-primary"
            )}
          >
            {p}
          </Link>
        )
      )}

      <Link
        href={hrefForPage(pathname, searchParams, page + 1)}
        aria-disabled={page >= totalPages}
        aria-label="Next page"
        className={cn(
          "flex size-9 items-center justify-center rounded-md border border-border text-foreground transition-colors hover:border-primary",
          page >= totalPages && "pointer-events-none opacity-40"
        )}
      >
        <ChevronRight className="size-4" />
      </Link>
    </nav>
  );
}
