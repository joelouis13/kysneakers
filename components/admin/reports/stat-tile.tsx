import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * "warning" is reserved for tiles that represent an actual concerning state
 * (e.g. low stock) — not used decoratively across the row. Everything else
 * stays in plain text tokens per the design system, no per-metric hue.
 */
export function StatTile({
  label,
  value,
  sublabel,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string;
  sublabel?: string;
  icon: LucideIcon;
  tone?: "default" | "warning";
}) {
  return (
    <div className="rounded-xl border border-border p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <Icon className={cn("size-4", tone === "warning" ? "text-destructive" : "text-icon")} />
      </div>
      <p
        className={cn(
          "mt-2 font-heading text-3xl tracking-wide",
          tone === "warning" && Number(value) > 0 ? "text-destructive" : "text-foreground"
        )}
      >
        {value}
      </p>
      {sublabel && <p className="mt-1 text-xs text-muted-foreground">{sublabel}</p>}
    </div>
  );
}
