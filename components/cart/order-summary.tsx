"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const currency = new Intl.NumberFormat("en-GH", {
  style: "currency",
  currency: "GHS",
  maximumFractionDigits: 0,
});

export function OrderSummary({
  subtotal,
  discount,
  deliveryFee,
  total,
  itemCount,
}: {
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  itemCount: number;
}) {
  const router = useRouter();

  return (
    <div className="rounded-xl border border-border p-6">
      <h2 className="font-heading text-xl tracking-wide text-foreground">Order Summary</h2>

      <div className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})</span>
          <span className="text-foreground">{currency.format(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-muted-foreground">
            <span>Discount</span>
            <span className="text-secondary">-{currency.format(discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-muted-foreground">
          <span>Delivery Fee</span>
          <span className="text-foreground">{currency.format(deliveryFee)}</span>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="flex justify-between text-base font-semibold text-foreground">
        <span>Total</span>
        <span>{currency.format(total)}</span>
      </div>

      <Button
        size="lg"
        variant="secondary"
        className="mt-6 w-full"
        onClick={() => router.push("/checkout")}
      >
        Proceed to Checkout
      </Button>
    </div>
  );
}
