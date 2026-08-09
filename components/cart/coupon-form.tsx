"use client";

import { X } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/lib/cart/cart-context";
import { findCoupon } from "@/lib/data/coupons";

export function CouponForm() {
  const { couponCode, applyCoupon, removeCoupon } = useCart();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!code.trim()) return;
    const ok = applyCoupon(code);
    if (!ok) {
      setError("Invalid or expired coupon code");
      return;
    }
    setCode("");
  }

  if (couponCode) {
    const coupon = findCoupon(couponCode);
    return (
      <div className="flex items-center justify-between rounded-md border border-primary/30 bg-accent px-3 py-2">
        <div>
          <p className="text-sm font-medium text-foreground">{couponCode} applied</p>
          {coupon && <p className="text-xs text-muted-foreground">{coupon.description}</p>}
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
        <Button type="submit" variant="outline" size="sm">
          Apply
        </Button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </form>
  );
}
