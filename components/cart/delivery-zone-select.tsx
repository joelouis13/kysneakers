"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { shippingZones } from "@/lib/data/shipping-zones";

export function DeliveryZoneSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (zone: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Delivery Zone
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a delivery zone" />
        </SelectTrigger>
        <SelectContent>
          {shippingZones.map((zone) => (
            <SelectItem key={zone.name} value={zone.name}>
              {zone.name} — {zone.estimatedDaysMin}-{zone.estimatedDaysMax} days
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
