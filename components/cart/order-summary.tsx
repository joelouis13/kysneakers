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
  vat,
}: {
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  itemCount: number;
  actionSlot?: ReactNode;
  /**
   * Overrides the visitor's IP-detected VAT rate (from useCurrency) — pass
   * this once the order's actual VAT-liable country is known from a more
   * authoritative source, e.g. the shipping address the customer typed in
   * checkout, so the preview matches what placeOrder will actually charge.
   */
  vat?: { rate: number; amount: number };
}) {
  const { currency, vatRate: detectedVatRate, vatPortion } = useCurrency();
  const vatRate = vat?.rate ?? detectedVatRate;
  const vatAmount = vat ? vat.amount : vatRate > 0 ? vatPortion(total) : 0;

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

      {vatRate > 0 && (
        <p className="mt-1.5 text-xs text-muted-foreground">
          Includes VAT ({Math.round(vatRate * 100)}%): {formatCurrency(vatAmount, currency)}
        </p>
      )}

      {actionSlot && <div className="mt-6">{actionSlot}</div>}
    </div>
  );
}
