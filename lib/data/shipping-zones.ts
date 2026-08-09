/**
 * Mirrors the zones seeded in `supabase/seed.sql`'s `shipping_zones` table.
 * Used by the cart's delivery zone selector until it reads from a live
 * Supabase project.
 */

export type ShippingZone = {
  name: string;
  deliveryFee: number;
  estimatedDaysMin: number;
  estimatedDaysMax: number;
};

export const shippingZones: ShippingZone[] = [
  { name: "Accra", deliveryFee: 25, estimatedDaysMin: 1, estimatedDaysMax: 2 },
  { name: "Kumasi", deliveryFee: 35, estimatedDaysMin: 2, estimatedDaysMax: 3 },
  { name: "Takoradi", deliveryFee: 40, estimatedDaysMin: 2, estimatedDaysMax: 4 },
  { name: "Cape Coast", deliveryFee: 35, estimatedDaysMin: 2, estimatedDaysMax: 3 },
  { name: "Tamale", deliveryFee: 50, estimatedDaysMin: 3, estimatedDaysMax: 5 },
  { name: "Other Regions", deliveryFee: 60, estimatedDaysMin: 3, estimatedDaysMax: 6 },
];

export function getShippingZone(name: string): ShippingZone | undefined {
  return shippingZones.find((z) => z.name === name);
}
