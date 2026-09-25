"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2, Search } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ReviewForm } from "@/components/shop/review-form";
import { queryProducts } from "@/lib/catalog/queries";
import type { ProductSummary } from "@/lib/catalog/types";
import { createClient } from "@/lib/supabase/client";

function useProductSearch(query: string) {
  const supabase = useMemo(() => createClient(), []);
  const trimmed = query.trim();

  return useQuery({
    queryKey: ["write-review", "product-search", trimmed],
    queryFn: async () => (await queryProducts(supabase, { q: trimmed, perPage: 8 })).products,
    enabled: trimmed.length > 1,
  });
}

function ProductPicker({ onSelect }: { onSelect: (product: ProductSummary) => void }) {
  const [query, setQuery] = useState("");
  const { data: products, isFetching } = useProductSearch(query);

  return (
    <div>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for the product you want to review..."
          className="pl-9"
          autoFocus
        />
      </div>

      {isFetching && (
        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Searching...
        </div>
      )}

      {!isFetching && query.trim().length > 1 && products?.length === 0 && (
        <p className="mt-4 text-sm text-muted-foreground">No products match &quot;{query}&quot;.</p>
      )}

      {products && products.length > 0 && (
        <div className="mt-4 space-y-2">
          {products.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => onSelect(product)}
              className="flex w-full items-center gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:border-primary"
            >
              <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-muted">
                {product.primaryImageUrl && (
                  <Image src={product.primaryImageUrl} alt="" fill sizes="48px" className="object-cover" />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{product.name}</p>
                {product.brandName && (
                  <p className="text-xs text-muted-foreground">{product.brandName}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function WriteReviewFlow() {
  const [selected, setSelected] = useState<ProductSummary | null>(null);

  if (!selected) {
    return <ProductPicker onSelect={setSelected} />;
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-border p-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-muted">
            {selected.primaryImageUrl && (
              <Image src={selected.primaryImageUrl} alt="" fill sizes="48px" className="object-cover" />
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{selected.name}</p>
            {selected.brandName && <p className="text-xs text-muted-foreground">{selected.brandName}</p>}
          </div>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => setSelected(null)}>
          Change product
        </Button>
      </div>

      <ReviewForm productId={selected.id} productSlug={selected.slug} />
    </div>
  );
}
