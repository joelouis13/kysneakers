"use client";

import type { ReactNode } from "react";

import { Separator } from "@/components/ui/separator";
import { useCurrency } from "@/lib/currency/currency-context";
import { formatCurrency } from "@/lib/currency/format";

export function OrderSummary({
  subtotal,
  discount,
  deliveryFee,
  total,
  itemCount,
  actionSlot,
}: {
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  itemCount: number;
  actionSlot?: ReactNode;
}) {
  const { currency, vatRate, formatFromGhs, convertFromGhs, vatPortion } = useCurrency();
  const vatAmount = vatRate > 0 ? vatPortion(convertFromGhs(total)) : 0;

  return (
    <div className="rounded-xl border border-border p-6">
      <h2 className="font-heading text-xl tracking-wide text-foreground">Order Summary</h2>

      <div className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})</span>
          <span className="text-foreground">{formatFromGhs(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-muted-foreground">
            <span>Discount</span>
            <span className="text-secondary">-{formatFromGhs(discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-muted-foreground">
          <span>Delivery Fee</span>
          <span className="text-foreground">{formatFromGhs(deliveryFee)}</span>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="flex justify-between text-base font-semibold text-foreground">
        <span>Total</span>
        <span>{formatFromGhs(total)}</span>
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
