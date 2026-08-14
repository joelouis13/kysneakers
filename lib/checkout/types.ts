import type { Currency } from "@/lib/currency/config";
import type { OrderStatus, PaymentMethod, PaymentStatus } from "@/types/database";

export type CouponPreviewFailureReason =
  | "not_found"
  | "expired"
  | "not_started"
  | "below_minimum"
  | "usage_limit_reached";

export type CouponPreview =
  | {
      valid: true;
      code: string;
      discount: number;
      description: string;
    }
  | {
      valid: false;
      reason: CouponPreviewFailureReason;
      message: string;
    };

export type OrderItemSummary = {
  productName: string;
  size: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

export type OrderPaymentSummary = {
  id: string;
  status: PaymentStatus;
  method: PaymentMethod;
  providerMessage: string | null;
};

export type OrderStatusPayload = {
  orderId: string;
  orderNumber: string;
  status: OrderStatus;
  customerEmail: string;
  customerPhone: string;
  subtotal: number;
  discountTotal: number;
  deliveryFee: number;
  total: number;
  currency: Currency;
  vatRate: number;
  vatAmount: number;
  createdAt: string;
  items: OrderItemSummary[];
  payment: OrderPaymentSummary | null;
};

export type PlaceOrderResult =
  | { error: string }
  | { success: true; order: OrderStatusPayload; requiresOtp: boolean; redirectUrl?: string };
