"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function InventoryFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");

  const lowStockOnly = searchParams.get("lowStock") === "1";

  function updateParams(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    router.push(`${pathname}?${params.toString()}`);
  }

  function submitSearch() {
    updateParams((params) => {
      if (q.trim()) params.set("q", q.trim());
      else params.delete("q");
    });
  }

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onBlur={submitSearch}
        onKeyDown={(e) => e.key === "Enter" && submitSearch()}
        placeholder="Search product name..."
        className="w-64"
      />

      <button
        type="button"
        onClick={() =>
          updateParams((params) => (lowStockOnly ? params.delete("lowStock") : params.set("lowStock", "1")))
        }
        className={cn(
          "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
          lowStockOnly
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border text-foreground hover:border-primary"
        )}
      >
        Low Stock Only
      </button>
    </div>
  );
}
