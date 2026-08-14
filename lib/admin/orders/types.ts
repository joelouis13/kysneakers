import type { Currency } from "@/lib/currency/config";
import type { OrderStatus, PaymentMethod, PaymentStatus } from "@/types/database";

export type AdminOrderListItem = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  status: OrderStatus;
  total: number;
  currency: Currency;
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
  payerPhone: string | null;
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
  shippingRegion: string | null;
  shippingCity: string;
  shippingStreetAddress: string;
  shippingLandmark: string | null;
  shippingCountry: string | null;
  shippingPostalCode: string | null;
  subtotal: number;
  discountTotal: number;
  deliveryFee: number;
  total: number;
  currency: Currency;
  vatRate: number;
  vatAmount: number;
  notes: string | null;
  createdAt: string;
  items: AdminOrderItem[];
  payments: AdminOrderPayment[];
};
