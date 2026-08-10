import type { OrderStatus, PaymentMethod, PaymentStatus } from "@/types/database";

export type AdminOrderListItem = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
};

export type AdminOrderItem = {
  productName: string;
  size: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

export type AdminOrderPayment = {
  id: string;
  status: PaymentStatus;
  method: PaymentMethod;
  payerPhone: string;
  providerReference: string | null;
  providerMessage: string | null;
  verifiedAt: string | null;
  createdAt: string;
};

export type AdminOrderDetail = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  profileId: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingRecipientName: string;
  shippingPhone: string;
  shippingRegion: string;
  shippingCity: string;
  shippingStreetAddress: string;
  shippingLandmark: string | null;
  subtotal: number;
  discountTotal: number;
  deliveryFee: number;
  total: number;
  notes: string | null;
  createdAt: string;
  items: AdminOrderItem[];
  payments: AdminOrderPayment[];
};
