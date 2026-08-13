import { CreditCard, MapPin, Truck } from "lucide-react";

import { cn } from "@/lib/utils";

export type CheckoutStep = "shipping" | "delivery" | "payment";

const STEPS: { key: CheckoutStep; label: string; icon: typeof MapPin }[] = [
  { key: "shipping", label: "Shipping", icon: MapPin },
  { key: "delivery", label: "Delivery", icon: Truck },
  { key: "payment", label: "Payment", icon: CreditCard },
];

export function CheckoutSteps({ current }: { current: CheckoutStep }) {
  const currentIndex = STEPS.findIndex((s) => s.key === current);

  return (
    <div className="flex items-center justify-center">
      {STEPS.map((step, index) => {
        const Icon = step.icon;
        const isDone = index < currentIndex;
        const isActive = index === currentIndex;
        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  "flex size-10 items-center justify-center rounded-full transition-colors",
                  isActive || isDone
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <Icon className="size-5" />
              </span>
              <span
                className={cn(
                  "text-xs font-medium",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <span
                className={cn(
                  "mx-2 h-px w-10 shrink-0 sm:mx-4 sm:w-24",
                  isDone ? "bg-primary" : "bg-border"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
