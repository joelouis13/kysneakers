import { z } from "zod";

import { SUPPORTED_CURRENCIES } from "@/lib/currency/config";

const shippingSchema = z
  .object({
    addressId: z.string().uuid().optional(),
    recipientName: z.string().min(2, "Enter a recipient name").optional(),
    phone: z.string().min(7, "Enter a valid phone number").optional(),
    region: z.string().optional(),
    city: z.string().min(2, "Enter a city").optional(),
    streetAddress: z.string().min(4, "Enter a street address").optional(),
    houseAddress: z.string().optional(),
    landmark: z.string().optional(),
    country: z.string().optional(),
    postalCode: z.string().optional(),
    saveAddress: z.boolean().optional(),
  })
  .refine(
    (v) => !!v.addressId || !!(v.recipientName && v.phone && v.city && v.streetAddress),
    {
      message: "Enter a complete shipping address or select a saved one.",
      path: ["recipientName"],
    }
  );

export const checkoutSchema = z.object({
  currency: z.enum(SUPPORTED_CURRENCIES),
  customerName: z.string().min(2, "Enter your full name"),
  customerEmail: z.string().email("Enter a valid email address"),
  customerPhone: z.string().min(7, "Enter a valid phone number"),
  shipping: shippingSchema,
  deliveryMethod: z.enum(["pickup", "delivery", "international"], {
    message: "Select a delivery method",
  }),
  paymentMethod: z.enum(["mtn_momo", "telecel_cash", "airteltigo_money", "card"]),
  payerPhone: z.string().optional(),
  couponCode: z.string().optional(),
  notes: z.string().max(500).optional(),
  items: z
    .array(
      z.object({
        productSlug: z.string(),
        size: z.string(),
        quantity: z.number().int().min(1),
      })
    )
    .min(1, "Your cart is empty"),
});

export type CheckoutValues = z.infer<typeof checkoutSchema>;

export const otpSchema = z.object({
  otp: z.string().min(4, "Enter the code you received"),
});

export type OtpValues = z.infer<typeof otpSchema>;

export const orderLookupSchema = z.object({
  orderNumber: z.string().min(5, "Enter your order number"),
  contact: z.string().min(3, "Enter the email or phone used at checkout"),
});

export type OrderLookupValues = z.infer<typeof orderLookupSchema>;
