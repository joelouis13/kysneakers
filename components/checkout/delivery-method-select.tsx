"use client";

import { Check, Store, Truck } from "lucide-react";

import { FLAT_DELIVERY_FEE } from "@/lib/checkout/constants";
import { formatCurrency } from "@/lib/currency/format";
import { cn } from "@/lib/utils";

export type DeliveryMethod = "pickup" | "delivery";

const OPTIONS: {
  value: DeliveryMethod;
  label: string;
  description: string;
  price: string;
  icon: typeof Store;
}[] = [
  {
    value: "pickup",
    label: "Store Pickup",
    description: "Pick up from our store — ready in 24 hours",
    price: "FREE",
    icon: Store,
  },
  {
    value: "delivery",
    label: "Doorstep Delivery",
    description: "Delivered to your address",
    price: formatCurrency(FLAT_DELIVERY_FEE, "GHS"),
    icon: Truck,
  },
];

export function DeliveryMethodSelect({
  value,
  onChange,
}: {
  value: DeliveryMethod | null;
  onChange: (method: DeliveryMethod) => void;
}) {
  return (
    <div className="space-y-3">
      {OPTIONS.map((opt) => {
        const Icon = opt.icon;
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={selected}
            className={cn(
              "flex w-full items-center justify-between rounded-xl border p-4 text-left transition-colors",
              selected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
            )}
          >
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-full",
                  selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}
              >
                <Icon className="size-5" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-foreground">{opt.label}</span>
                <span className="block text-xs text-muted-foreground">{opt.description}</span>
              </span>
            </div>
            <span className="flex items-center gap-3">
              <span
                className={cn(
                  "text-sm font-semibold",
                  opt.value === "pickup" ? "text-secondary" : "text-foreground"
                )}
              >
                {opt.price}
              </span>
              <span
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full border",
                  selected ? "border-primary bg-primary text-primary-foreground" : "border-border"
                )}
              >
                {selected && <Check className="size-3" />}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
