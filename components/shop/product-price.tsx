"use client";

import { Badge } from "@/components/ui/badge";
import { useCurrency } from "@/lib/currency/currency-context";

/**
 * Client component so price conversion happens per-visitor at hydration,
 * not baked into this page's cached ISR HTML (which would leak one
 * visitor's currency to everyone else until the next revalidation).
 */
export function ProductPrice({
  regularPrice,
  salePrice,
}: {
  regularPrice: number;
  salePrice: number | null;
}) {
  const { formatFromGhs } = useCurrency();

  if (salePrice) {
    return (
      <>
        <span className="text-2xl font-semibold text-secondary">{formatFromGhs(salePrice)}</span>
        <span className="text-base text-muted-foreground line-through">
          {formatFromGhs(regularPrice)}
        </span>
        <Badge variant="sale">Sale</Badge>
      </>
    );
  }

  return <span className="text-2xl font-semibold text-foreground">{formatFromGhs(regularPrice)}</span>;
}
