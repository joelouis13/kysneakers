/**
 * Demo coupon codes for the cart UI. The real `coupons` table (schema +
 * admin management) already exists — this is swapped for a server-validated
 * lookup once checkout (Phase 5) is built.
 */

export type DemoCoupon = {
  code: string;
  discountType: "percentage" | "fixed_amount";
  discountValue: number;
  minimumPurchase: number;
  description: string;
};

export const demoCoupons: DemoCoupon[] = [
  {
    code: "WELCOME10",
    discountType: "percentage",
    discountValue: 10,
    minimumPurchase: 0,
    description: "10% off your first order",
  },
  {
    code: "SAVE50",
    discountType: "fixed_amount",
    discountValue: 50,
    minimumPurchase: 300,
    description: "GHS 50 off orders over GHS 300",
  },
  {
    code: "KYS20",
    discountType: "percentage",
    discountValue: 20,
    minimumPurchase: 500,
    description: "20% off orders over GHS 500",
  },
];

export function findCoupon(code: string): DemoCoupon | undefined {
  const normalized = code.trim().toLowerCase();
  return demoCoupons.find((c) => c.code.toLowerCase() === normalized);
}

export function calculateDiscount(coupon: DemoCoupon, subtotal: number): number {
  if (subtotal < coupon.minimumPurchase) return 0;
  if (coupon.discountType === "percentage") {
    return Math.round(subtotal * (coupon.discountValue / 100));
  }
  return Math.min(coupon.discountValue, subtotal);
}
