"use client";

import { X } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCouponPreview } from "@/lib/checkout/hooks";
import { getCouponPreview } from "@/lib/checkout/queries";
import { useCart } from "@/lib/cart/cart-context";
import { createClient } from "@/lib/supabase/client";

export function CouponForm({ subtotal }: { subtotal: number }) {
  const { couponCode, applyCoupon, removeCoupon } = useCart();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const { data: appliedPreview } = useCouponPreview(couponCode ?? "", subtotal);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!code.trim()) return;

    setIsChecking(true);
    const supabase = createClient();
    const result = await getCouponPreview(supabase, code.trim(), subtotal);
    setIsChecking(false);

    if (!result.valid) {
      setError(result.message);
      return;
    }
    applyCoupon(result.code);
    setCode("");
  }

  if (couponCode) {
    return (
      <div className="flex items-center justify-between rounded-md border border-primary/30 bg-accent px-3 py-2">
        <div>
          <p className="text-sm font-medium text-foreground">{couponCode} applied</p>
          {appliedPreview?.valid && (
            <p className="text-xs text-muted-foreground">{appliedPreview.description}</p>
          )}
          {appliedPreview && !appliedPreview.valid && (
            <p className="text-xs text-destructive">{appliedPreview.message}</p>
          )}
        </div>
        <button
          type="button"
          aria-label="Remove coupon"
          onClick={removeCoupon}
          className="text-muted-foreground hover:text-destructive"
        >
          <X className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-1.5">
      <div className="flex gap-2">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Coupon code"
          className="h-9"
          aria-invalid={!!error}
        />
        <Button type="submit" variant="outline" size="sm" disabled={isChecking}>
          Apply
        </Button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </form>
  );
}
