import { z } from "zod";

import { isValidGhPhone } from "@/lib/moolre/phone";

const ghPhone = (message: string) => z.string().refine(isValidGhPhone, message);

const shippingSchema = z
  .object({
    addressId: z.string().uuid().optional(),
    recipientName: z.string().min(2, "Enter a recipient name").optional(),
    phone: ghPhone("Enter a valid Ghana phone number").optional(),
    region: z.string().min(2, "Enter a region").optional(),
    city: z.string().min(2, "Enter a city").optional(),
    streetAddress: z.string().min(4, "Enter a street address").optional(),
    landmark: z.string().optional(),
    saveAddress: z.boolean().optional(),
  })
  .refine(
    (v) =>
      !!v.addressId ||
      !!(v.recipientName && v.phone && v.region && v.city && v.streetAddress),
    {
      message: "Enter a complete shipping address or select a saved one.",
      path: ["recipientName"],
    }
  );

export const checkoutSchema = z.object({
  customerName: z.string().min(2, "Enter your full name"),
  customerEmail: z.string().email("Enter a valid email address"),
  customerPhone: ghPhone("Enter a valid Ghana phone number"),
  shipping: shippingSchema,
  shippingZoneId: z.string().uuid("Select a delivery zone"),
  paymentMethod: z.enum(["mtn_momo", "telecel_cash", "airteltigo_money"]),
  payerPhone: ghPhone("Enter a valid Ghana MoMo number"),
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
