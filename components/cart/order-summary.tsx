"use client";

import type { ReactNode } from "react";

import { Separator } from "@/components/ui/separator";
import { useCurrency } from "@/lib/currency/currency-context";
import { formatCurrency } from "@/lib/currency/format";

/**
 * All amount props are already resolved into the visitor's display currency
 * by the caller (via lib/currency/product-price.ts's resolveProductPrice
 * per line item) — this component only formats, it never converts. That
 * split matters once individual products carry a manual EUR price: a bulk
 * GHS-then-convert here would silently ignore those overrides.
 */
export function OrderSummary({
  subtotal,
  discount,
  deliveryFee,
  total,
  itemCount,
  actionSlot,
  vatIncluded,
}: {
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  itemCount: number;
  actionSlot?: ReactNode;
  /**
   * Whether this order's prices already have Dutch VAT baked in (product
   * prices are set VAT-inclusive by the admin, so there's nothing to
   * calculate here — this only controls whether the disclosure note shows).
   * Overrides the visitor's IP-detected default once the order's actual
   * country is known from a more authoritative source, e.g. the shipping
   * address typed in checkout.
   */
  vatIncluded?: boolean;
}) {
  const { currency, vatRate: detectedVatRate } = useCurrency();
  const showVatNote = vatIncluded ?? detectedVatRate > 0;

  return (
    <div className="rounded-xl border border-border p-6">
      <h2 className="font-heading text-xl tracking-wide text-foreground">Order Summary</h2>

      <div className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})</span>
          <span className="text-foreground">{formatCurrency(subtotal, currency)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-muted-foreground">
            <span>Discount</span>
            <span className="text-secondary">-{formatCurrency(discount, currency)}</span>
          </div>
        )}
        <div className="flex justify-between text-muted-foreground">
          <span>Delivery Fee</span>
          <span className="text-foreground">{formatCurrency(deliveryFee, currency)}</span>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="flex justify-between text-base font-semibold text-foreground">
        <span>Total</span>
        <span>{formatCurrency(total, currency)}</span>
      </div>

      {showVatNote && (
        <p className="mt-1.5 text-xs text-muted-foreground">VAT included in the total price.</p>
      )}

      {actionSlot && <div className="mt-6">{actionSlot}</div>}
    </div>
  );
}
