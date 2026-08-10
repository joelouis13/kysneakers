"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ShippingZone } from "@/lib/checkout/types";

export function DeliveryZoneSelect({
  zones,
  value,
  onChange,
}: {
  zones: ShippingZone[];
  value: string | null;
  onChange: (zoneId: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Delivery Zone
      </label>
      <Select value={value ?? undefined} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a delivery zone" />
        </SelectTrigger>
        <SelectContent>
          {zones.map((zone) => (
            <SelectItem key={zone.id} value={zone.id}>
              {zone.name} — {zone.estimatedDaysMin}-{zone.estimatedDaysMax} days
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
