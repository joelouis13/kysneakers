"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ProductBrand, ProductCategoryRef } from "@/lib/catalog/types";
import { cn } from "@/lib/utils";

export function ProductFilters({
  brands,
  categories,
}: {
  brands: ProductBrand[];
  categories: ProductCategoryRef[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");

  const view = searchParams.get("view") === "deleted" ? "deleted" : "active";

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
        placeholder="Search name or SKU..."
        className="w-56"
      />

      <Select
        value={searchParams.get("status") ?? "all"}
        onValueChange={(v) =>
          updateParams((params) => (v === "all" ? params.delete("status") : params.set("status", v)))
        }
      >
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="draft">Draft</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="out_of_stock">Out of Stock</SelectItem>
          <SelectItem value="archived">Archived</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("brand") ?? "all"}
        onValueChange={(v) =>
          updateParams((params) => (v === "all" ? params.delete("brand") : params.set("brand", v)))
        }
      >
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Brands</SelectItem>
          {brands.map((b) => (
            <SelectItem key={b.id} value={b.id}>
              {b.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("category") ?? "all"}
        onValueChange={(v) =>
          updateParams((params) => (v === "all" ? params.delete("category") : params.set("category", v)))
        }
      >
        <SelectTrigger className="w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="ml-auto flex rounded-md border border-border p-0.5">
        {(["active", "deleted"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => updateParams((params) => (v === "active" ? params.delete("view") : params.set("view", v)))}
            className={cn(
              "rounded px-3 py-1.5 text-xs font-medium capitalize transition-colors",
              view === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}
