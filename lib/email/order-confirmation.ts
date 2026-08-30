import { formatCurrency } from "@/lib/currency/format";
import type { OrderStatusPayload } from "@/lib/checkout/types";

import { getFromEmail } from "./config";
import { getResendClient } from "./client";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildHtml(order: OrderStatusPayload, orderUrl: string): string {
  const rows = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 0;color:#111827;font-size:14px;">
            ${escapeHtml(item.productName)} · ${escapeHtml(item.size)} × ${item.quantity}
          </td>
          <td style="padding:8px 0;text-align:right;color:#111827;font-size:14px;">
            ${formatCurrency(item.lineTotal, order.currency)}
          </td>
        </tr>`
    )
    .join("");

  const summaryRow = (label: string, amount: string, bold = false) => `
    <tr>
      <td style="padding:4px 0;color:#4b5563;font-size:14px;${bold ? "font-weight:600;color:#111827;" : ""}">${label}</td>
      <td style="padding:4px 0;text-align:right;color:#4b5563;font-size:14px;${bold ? "font-weight:600;color:#111827;" : ""}">${amount}</td>
    </tr>`;

  return `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
    <h1 style="font-size:20px;color:#111827;margin:0 0 4px;">Order confirmed</h1>
    <p style="color:#4b5563;font-size:14px;margin:0 0 24px;">
      Hi ${escapeHtml(order.customerName)}, thanks for your order — here's your confirmation for
      <strong>${escapeHtml(order.orderNumber)}</strong>.
    </p>

    <table style="width:100%;border-collapse:collapse;border-top:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb;margin-bottom:16px;">
      ${rows}
    </table>

    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
      ${summaryRow("Subtotal", formatCurrency(order.subtotal, order.currency))}
      ${order.discountTotal > 0 ? summaryRow("Discount", `-${formatCurrency(order.discountTotal, order.currency)}`) : ""}
      ${summaryRow("Delivery Fee", formatCurrency(order.deliveryFee, order.currency))}
      ${order.vatAmount > 0 ? summaryRow(`VAT (${order.vatRate}%, included)`, formatCurrency(order.vatAmount, order.currency)) : ""}
      ${summaryRow("Total", formatCurrency(order.total, order.currency), true)}
    </table>

    <a href="${orderUrl}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:10px 20px;border-radius:8px;">
      Track your order
    </a>

    <p style="color:#9ca3af;font-size:12px;margin-top:32px;">
      Questions about your order? Reply to this email and we'll help out.
    </p>
  </div>`;
}

function buildText(order: OrderStatusPayload, orderUrl: string): string {
  const lines = order.items.map(
    (item) =>
      `- ${item.productName} · ${item.size} × ${item.quantity} — ${formatCurrency(item.lineTotal, order.currency)}`
  );

  return [
    `Order confirmed — ${order.orderNumber}`,
    ``,
    `Hi ${order.customerName}, thanks for your order.`,
    ``,
    ...lines,
    ``,
    `Subtotal: ${formatCurrency(order.subtotal, order.currency)}`,
    ...(order.discountTotal > 0 ? [`Discount: -${formatCurrency(order.discountTotal, order.currency)}`] : []),
    `Delivery Fee: ${formatCurrency(order.deliveryFee, order.currency)}`,
    ...(order.vatAmount > 0 ? [`VAT (${order.vatRate}%, included): ${formatCurrency(order.vatAmount, order.currency)}`] : []),
    `Total: ${formatCurrency(order.total, order.currency)}`,
    ``,
    `Track your order: ${orderUrl}`,
  ].join("\n");
}

/**
 * Fire-and-forget from the caller's perspective — never throws. Webhook
 * handlers must always return 200 to the payment provider regardless of
 * whether the confirmation email succeeds, so failures are swallowed here
 * (the payment/order state is already correctly persisted by that point).
 */
export async function sendOrderConfirmationEmail(order: OrderStatusPayload): Promise<void> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const orderUrl = `${siteUrl}/orders`;

  try {
    await getResendClient().emails.send({
      from: `KYSneakers <${getFromEmail()}>`,
      to: order.customerEmail,
      subject: `Order confirmed — ${order.orderNumber}`,
      html: buildHtml(order, orderUrl),
      text: buildText(order, orderUrl),
    });
  } catch (err) {
    console.error("Failed to send order confirmation email", order.orderNumber, err);
  }
}
