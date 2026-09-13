"use server";

import type { Currency } from "@/lib/currency/config";
import { resolveProductPrice } from "@/lib/currency/product-price";
import { formatCurrency } from "@/lib/currency/format";
import { convert, convertBetween, getExchangeRates, type ExchangeRates } from "@/lib/currency/rates";
import { getVatRate, vatPortionOfInclusiveAmount } from "@/lib/currency/vat";
import { channelForMethod, initiatePayment } from "@/lib/moolre/client";
import { MoolreConfigError } from "@/lib/moolre/config";
import { isValidGhPhone, toLocalPhone } from "@/lib/moolre/phone";
import { createCheckoutSession } from "@/lib/stripe/client";
import { StripeConfigError } from "@/lib/stripe/config";
import { createServiceRoleClient, createClient } from "@/lib/supabase/server";
import { getProductsBySlugs } from "@/lib/catalog/queries";
import type { PaymentMethod, PaymentStatus } from "@/types/database";

import { FLAT_DELIVERY_FEE, FLAT_INTERNATIONAL_DELIVERY_FEE_USD, MIN_ORDER_TOTAL_EUR } from "./constants";
import { generateOrderNumber } from "./order-number";
import { getOrderById, getOrderByNumber } from "./queries";
import {
  checkoutSchema,
  orderLookupSchema,
  otpSchema,
  type CheckoutValues,
} from "./schemas";
import type { OrderStatusPayload, PlaceOrderResult } from "./types";

type ServiceClient = ReturnType<typeof createServiceRoleClient>;

/** Shared by placeOrder/submitPaymentOtp/retryPayment — the one place the Moolre call + payment-row update happens. */
async function attemptMoolrePayment(
  serviceClient: ServiceClient,
  payment: { id: string; amount: number; method: PaymentMethod; payerPhone: string },
  otpcode?: string
): Promise<{ status: PaymentStatus; providerMessage: string | null; requiresOtp: boolean; redirectUrl?: string }> {
  const localPayer = toLocalPhone(payment.payerPhone);
  if (!localPayer) {
    const result = { status: "failed" as PaymentStatus, providerMessage: "Invalid payer phone number.", requiresOtp: false };
    await serviceClient
      .from("payments")
      .update({ status: result.status, provider_message: result.providerMessage })
      .eq("id", payment.id);
    return result;
  }

  let status: PaymentStatus = "initiated";
  let providerMessage: string | null = null;
  let providerReference: string | null = null;
  let requiresOtp = false;

  try {
    const response = await initiatePayment({
      payer: localPayer,
      amount: String(payment.amount),
      externalref: payment.id,
      channel: channelForMethod(payment.method),
      ...(otpcode ? { otpcode } : {}),
    });

    if (response.code === "TP14") {
      // OTP-required responses also carry a "data" field, but it's always
      // the literal placeholder "all" — not a transaction id — so this check
      // must come before the "data" in response check below, or every
      // OTP-required payment gets misread as a successful push initiation.
      status = "pending";
      providerMessage = "TP14";
      requiresOtp = true;
    } else if ("data" in response) {
      status = "pending";
      providerReference = response.data;
      providerMessage = "TR099";
    } else {
      status = "failed";
      providerMessage = response.message ?? response.code;
    }
  } catch (err) {
    status = "failed";
    providerMessage =
      err instanceof MoolreConfigError
        ? err.message
        : "Payment gateway error. Please try again.";
  }

  await serviceClient
    .from("payments")
    .update({
      status,
      ...(providerReference ? { provider_reference: providerReference } : {}),
      provider_message: providerMessage,
    })
    .eq("id", payment.id);

  return { status, providerMessage, requiresOtp };
}

/** International (non-Ghana) path — creates a hosted Stripe Checkout Session and hands back its URL to redirect to. */
async function attemptStripePayment(
  serviceClient: ServiceClient,
  payment: {
    id: string;
    orderId: string;
    orderNumber: string;
    amount: number;
    currency: Currency;
    customerEmail: string;
  },
  lineItems: { name: string; quantity: number; unitAmount: number }[]
): Promise<{ status: PaymentStatus; providerMessage: string | null; requiresOtp: boolean; redirectUrl?: string }> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  try {
    const session = await createCheckoutSession({
      paymentId: payment.id,
      orderId: payment.orderId,
      orderNumber: payment.orderNumber,
      currency: payment.currency,
      lineItems,
      customerEmail: payment.customerEmail,
      successUrl: `${siteUrl}/checkout/confirmation/${payment.orderNumber}?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${siteUrl}/checkout`,
    });

    await serviceClient
      .from("payments")
      .update({ provider: "stripe", provider_reference: session.sessionId, status: "pending" })
      .eq("id", payment.id);

    return { status: "pending", providerMessage: null, requiresOtp: false, redirectUrl: session.url };
  } catch (err) {
    const message =
      err instanceof StripeConfigError ? err.message : "Payment gateway error. Please try again.";
    await serviceClient
      .from("payments")
      .update({ provider: "stripe", status: "failed", provider_message: message })
      .eq("id", payment.id);
    return { status: "failed", providerMessage: message, requiresOtp: false };
  }
}

export async function placeOrder(values: CheckoutValues): Promise<PlaceOrderResult> {
  const parsed = checkoutSchema.safeParse(values);
  if (!parsed.success) return { error: "Please check your details and try again." };
  const data = parsed.data;
  const isGhana = data.currency === "GHS";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const uniqueSlugs = [...new Set(data.items.map((i) => i.productSlug))];
  const products = await getProductsBySlugs(supabase, uniqueSlugs);
  const productBySlug = new Map(products.map((p) => [p.slug, p]));

  // Stock checks, and coupon minimum-purchase/discount math, stay GHS-based
  // (the canonical prices and coupon thresholds are stored in) — but the
  // actual charged line items are resolved directly in the order's currency
  // below, per line, since an admin-set EUR price generally isn't a simple
  // multiple of the GHS price and can't be derived by bulk-converting a GHS
  // subtotal after the fact.
  const lineItemsGhs: {
    product_id: string;
    product_size_id: string;
    product_name: string;
    size: string;
    sku: string;
    unit_price: number;
    quantity: number;
    line_total: number;
  }[] = [];

  for (const item of data.items) {
    const product = productBySlug.get(item.productSlug);
    if (!product) return { error: `A product in your cart is no longer available.` };
    const size = product.sizes.find((s) => s.size === item.size);
    if (!size || size.stock < item.quantity) {
      return {
        error: `Only ${size?.stock ?? 0} left in size ${item.size} for ${product.name} — please update your cart.`,
      };
    }
    lineItemsGhs.push({
      product_id: product.id,
      product_size_id: size.id,
      product_name: product.name,
      size: item.size,
      sku: product.sku,
      unit_price: product.effectivePrice,
      quantity: item.quantity,
      line_total: product.effectivePrice * item.quantity,
    });
  }

  const subtotalGhs = lineItemsGhs.reduce((sum, li) => sum + li.line_total, 0);
  const serviceClient = createServiceRoleClient();

  let discountTotalGhs = 0;
  let couponId: string | null = null;
  if (data.couponCode) {
    const { data: coupon } = await serviceClient
      .from("coupons")
      .select("id,discount_type,discount_value,minimum_purchase,starts_at,expires_at")
      .ilike("code", data.couponCode.trim())
      .maybeSingle();
    if (!coupon) return { error: "This coupon is no longer available." };

    const now = new Date();
    if (coupon.starts_at && new Date(coupon.starts_at) > now) {
      return { error: "This coupon isn't active yet." };
    }
    if (coupon.expires_at && new Date(coupon.expires_at) < now) {
      return { error: "This coupon has expired." };
    }
    if (subtotalGhs < coupon.minimum_purchase) {
      return { error: `This coupon requires a minimum purchase of GHS ${coupon.minimum_purchase}.` };
    }

    const { data: claimed } = await serviceClient.rpc("increment_coupon_usage", {
      p_coupon_id: coupon.id,
    });
    if (!claimed) {
      return { error: "This coupon is no longer available. Please remove it and try again." };
    }

    couponId = coupon.id;
    discountTotalGhs =
      coupon.discount_type === "percentage"
        ? Math.round(subtotalGhs * (coupon.discount_value / 100))
        : Math.min(coupon.discount_value, subtotalGhs);
  }

  // Needed for conversions out of GHS, and for the USD-denominated minimum
  // order check below regardless of currency.
  const rates: ExchangeRates = await getExchangeRates();

  const deliveryFeeGhs =
    data.deliveryMethod === "pickup"
      ? 0
      : data.deliveryMethod === "delivery"
        ? FLAT_DELIVERY_FEE
        : convertBetween(FLAT_INTERNATIONAL_DELIVERY_FEE_USD, "USD", "GHS", rates!);

  // Per-line currency resolution: admin-set EUR price wins when the order is
  // EUR and one exists on the product; otherwise falls back to live FX
  // conversion from GHS. Same function checkout-form.tsx's live preview uses,
  // so what the customer saw and what actually gets charged can't drift.
  const lineItems = data.items.map((item, i) => {
    const product = productBySlug.get(item.productSlug)!;
    const unitPrice = resolveProductPrice(product.effectivePrice, product.eurEffectivePrice, data.currency, rates!);
    return { ...lineItemsGhs[i], unit_price: unitPrice, line_total: unitPrice * item.quantity };
  });

  const subtotal = lineItems.reduce((sum, li) => sum + li.line_total, 0);
  const discountTotal = isGhana ? discountTotalGhs : convert(discountTotalGhs, data.currency, rates!);
  const deliveryFee = isGhana ? deliveryFeeGhs : convert(deliveryFeeGhs, data.currency, rates!);
  const total = Math.max(0, subtotal - discountTotal) + deliveryFee;

  const minOrderTotal = convertBetween(MIN_ORDER_TOTAL_EUR, "EUR", data.currency, rates);
  if (total < minOrderTotal) {
    return { error: `The minimum order amount is ${formatCurrency(minOrderTotal, data.currency)}.` };
  }

  let shippingAddressId: string | null = null;
  let shippingSnapshot: {
    recipient_name: string;
    phone: string;
    region: string | null;
    city: string;
    street_address: string;
    landmark: string | null;
    country: string | null;
    postal_code: string | null;
  };

  if (data.shipping.addressId) {
    const { data: addr } = await serviceClient
      .from("addresses")
      .select("*")
      .eq("id", data.shipping.addressId)
      .maybeSingle();
    if (!addr || (user && addr.profile_id !== user.id)) {
      return { error: "Selected address could not be found." };
    }
    shippingAddressId = addr.id;
    shippingSnapshot = {
      recipient_name: addr.recipient_name,
      phone: addr.phone,
      region: addr.region,
      city: addr.city,
      street_address: addr.street_address,
      landmark: addr.landmark,
      country: null,
      postal_code: null,
    };
  } else {
    const s = data.shipping;
    if (!s.recipientName || !s.phone || !s.city || !s.streetAddress) {
      return { error: "Enter a complete shipping address." };
    }
    if (isGhana && !s.region) {
      return { error: "Enter a region." };
    }
    if (!isGhana && !s.country) {
      return { error: "Enter a country." };
    }
    shippingSnapshot = {
      recipient_name: s.recipientName,
      phone: s.phone,
      region: s.region ?? null,
      city: s.city,
      street_address: s.streetAddress,
      landmark: s.landmark ?? null,
      country: s.country ?? null,
      postal_code: s.postalCode ?? null,
    };
  }

  // VAT liability is derived from the shipping address's country (server-
  // recorded snapshot, not the raw client-submitted value — same string the
  // checkout UI's displayed VAT breakdown was computed from, so what's shown
  // and what's recorded always agree). Currently only Netherlands has a
  // configured rate; everywhere else (including Ghana, which has no country
  // on its shipping address) is 0. total is already VAT-inclusive by design,
  // so this only extracts the portion already in it — it never changes the total.
  const vatRate = getVatRate(shippingSnapshot.country ?? "");
  const vatAmount = vatPortionOfInclusiveAmount(total, vatRate);

  let orderId: string | null = null;
  let orderNumber = generateOrderNumber();
  let createdAt = "";
  for (let attempt = 0; attempt < 5 && !orderId; attempt++) {
    const { data: inserted, error } = await serviceClient
      .from("orders")
      .insert({
        order_number: orderNumber,
        profile_id: user?.id ?? null,
        customer_name: data.customerName,
        customer_email: data.customerEmail,
        customer_phone: data.customerPhone,
        shipping_address_id: shippingAddressId,
        shipping_recipient_name: shippingSnapshot.recipient_name,
        shipping_phone: shippingSnapshot.phone,
        shipping_region: shippingSnapshot.region,
        shipping_city: shippingSnapshot.city,
        shipping_street_address: shippingSnapshot.street_address,
        shipping_landmark: shippingSnapshot.landmark,
        shipping_country: shippingSnapshot.country,
        shipping_postal_code: shippingSnapshot.postal_code,
        delivery_fee: deliveryFee,
        subtotal,
        discount_total: discountTotal,
        coupon_id: couponId,
        total,
        currency: data.currency,
        vat_rate: vatRate,
        vat_amount: vatAmount,
        notes: data.notes ?? null,
      })
      .select("id,order_number,created_at")
      .single();

    if (!error && inserted) {
      orderId = inserted.id;
      orderNumber = inserted.order_number;
      createdAt = inserted.created_at;
      break;
    }
    if (error?.code === "23505") {
      orderNumber = generateOrderNumber();
      continue;
    }
    return { error: "Something went wrong creating your order. Please try again." };
  }
  if (!orderId) return { error: "Something went wrong creating your order. Please try again." };

  const { error: itemsError } = await serviceClient
    .from("order_items")
    .insert(lineItems.map((li) => ({ order_id: orderId!, ...li })));
  if (itemsError) {
    return { error: "Something went wrong saving your order. Please contact support." };
  }

  if (user && data.shipping.saveAddress && !data.shipping.addressId && isGhana) {
    const { count } = await serviceClient
      .from("addresses")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", user.id);
    await serviceClient.from("addresses").insert({
      profile_id: user.id,
      recipient_name: shippingSnapshot.recipient_name,
      phone: shippingSnapshot.phone,
      region: shippingSnapshot.region ?? "",
      city: shippingSnapshot.city,
      street_address: shippingSnapshot.street_address,
      landmark: shippingSnapshot.landmark,
      is_default: (count ?? 0) === 0,
    });
  }

  const paymentMethod: PaymentMethod = isGhana ? data.paymentMethod : "card";

  const { data: paymentRow, error: paymentError } = await serviceClient
    .from("payments")
    .insert({
      order_id: orderId,
      method: paymentMethod,
      amount: total,
      currency: data.currency,
      payer_phone: isGhana ? (toLocalPhone(data.payerPhone ?? "") ?? data.payerPhone ?? null) : null,
      status: "initiated",
    })
    .select("id")
    .single();
  if (paymentError || !paymentRow) {
    return {
      error: `Order ${orderNumber} was created, but payment could not be started. Please contact support.`,
    };
  }

  let attempt: { status: PaymentStatus; providerMessage: string | null; requiresOtp: boolean; redirectUrl?: string };

  if (isGhana) {
    if (!data.payerPhone) {
      attempt = { status: "failed", providerMessage: "Enter your Mobile Money number.", requiresOtp: false };
      await serviceClient
        .from("payments")
        .update({ status: attempt.status, provider_message: attempt.providerMessage })
        .eq("id", paymentRow.id);
    } else {
      attempt = await attemptMoolrePayment(serviceClient, {
        id: paymentRow.id,
        amount: total,
        method: paymentMethod,
        payerPhone: data.payerPhone,
      });
    }
  } else {
    attempt = await attemptStripePayment(
      serviceClient,
      {
        id: paymentRow.id,
        orderId,
        orderNumber,
        amount: total,
        currency: data.currency,
        customerEmail: data.customerEmail,
      },
      lineItems.map((li) => ({ name: `${li.product_name} (${li.size})`, quantity: li.quantity, unitAmount: li.unit_price }))
    );
  }

  const order: OrderStatusPayload = {
    orderId,
    orderNumber,
    status: "pending_payment",
    customerName: data.customerName,
    customerEmail: data.customerEmail,
    customerPhone: data.customerPhone,
    subtotal,
    discountTotal,
    deliveryFee,
    total,
    currency: data.currency,
    vatRate,
    vatAmount,
    createdAt,
    items: lineItems.map((li) => ({
      productName: li.product_name,
      size: li.size,
      sku: li.sku,
      unitPrice: li.unit_price,
      quantity: li.quantity,
      lineTotal: li.line_total,
    })),
    payment: {
      id: paymentRow.id,
      status: attempt.status,
      method: paymentMethod,
      providerMessage: attempt.providerMessage,
    },
  };

  return { success: true, order, requiresOtp: attempt.requiresOtp, redirectUrl: attempt.redirectUrl };
}

export async function submitPaymentOtp(paymentId: string, otp: string): Promise<PlaceOrderResult> {
  const parsed = otpSchema.safeParse({ otp });
  if (!parsed.success) return { error: "Enter a valid code." };

  const serviceClient = createServiceRoleClient();
  const { data: payment } = await serviceClient
    .from("payments")
    .select("id,order_id,amount,method,payer_phone")
    .eq("id", paymentId)
    .maybeSingle();
  if (!payment || !payment.payer_phone) return { error: "Payment not found." };

  const attempt = await attemptMoolrePayment(
    serviceClient,
    { id: payment.id, amount: payment.amount, method: payment.method, payerPhone: payment.payer_phone },
    parsed.data.otp
  );

  const order = await getOrderById(serviceClient, payment.order_id);
  if (!order) return { error: "Order not found." };
  order.payment = { id: payment.id, status: attempt.status, method: payment.method, providerMessage: attempt.providerMessage };

  return { success: true, order, requiresOtp: attempt.requiresOtp };
}

export async function retryPayment(paymentId: string, payerPhone?: string): Promise<PlaceOrderResult> {
  const serviceClient = createServiceRoleClient();
  const { data: payment } = await serviceClient
    .from("payments")
    .select("id,order_id,amount,method,payer_phone")
    .eq("id", paymentId)
    .maybeSingle();
  if (!payment) return { error: "Payment not found." };

  let phone = payment.payer_phone;
  if (payerPhone) {
    if (!isValidGhPhone(payerPhone)) return { error: "Enter a valid Ghana MoMo number." };
    phone = payerPhone;
    await serviceClient.from("payments").update({ payer_phone: phone }).eq("id", paymentId);
  }
  if (!phone) return { error: "Enter your Mobile Money number." };

  const attempt = await attemptMoolrePayment(serviceClient, {
    id: payment.id,
    amount: payment.amount,
    method: payment.method,
    payerPhone: phone,
  });

  const order = await getOrderById(serviceClient, payment.order_id);
  if (!order) return { error: "Order not found." };
  order.payment = { id: payment.id, status: attempt.status, method: payment.method, providerMessage: attempt.providerMessage };

  return { success: true, order, requiresOtp: attempt.requiresOtp };
}

export async function lookupOrderStatus(
  orderNumber: string,
  contact: string
): Promise<{ error: string } | { order: OrderStatusPayload }> {
  const parsed = orderLookupSchema.safeParse({ orderNumber, contact });
  if (!parsed.success) return { error: "Enter your order number and contact details." };

  const serviceClient = createServiceRoleClient();
  const order = await getOrderByNumber(serviceClient, parsed.data.orderNumber.trim());
  if (!order) return { error: "We couldn't find an order matching those details." };

  const normalizedContact = parsed.data.contact.trim().toLowerCase();
  const localPhone = toLocalPhone(parsed.data.contact);
  const emailMatches = order.customerEmail.toLowerCase() === normalizedContact;
  const phoneMatches = localPhone !== null && order.customerPhone === localPhone;

  if (!emailMatches && !phoneMatches) {
    return { error: "We couldn't find an order matching those details." };
  }

  return { order };
}
