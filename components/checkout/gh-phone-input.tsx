import type { ComponentProps } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Purely visual "GH +233" prefix — the underlying input still accepts
 * whatever format lib/moolre/phone.ts's isValidGhPhone/toLocalPhone already
 * normalize (0-prefixed or +233-prefixed), so this doesn't change how the
 * value is captured or validated, just makes the Ghana-only constraint visible.
 */
export function GhPhoneInput({ className, ...props }: ComponentProps<"input">) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 rounded bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
        GH +233
      </span>
      <Input className={cn("pl-20", className)} placeholder="0XX XXX XXXX" {...props} />
    </div>
  );
}
