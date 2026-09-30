import type { Currency } from "./config";
import { convert, convertBetween, type ExchangeRates } from "./rates";

/**
 * The single place "what does this product actually cost in this order's
 * currency" is decided — shared by checkout-form.tsx's live subtotal display
 * and placeOrder's actual charge computation, so the two can never drift.
 * Admin-set EUR price is the authoritative international price when it
 * exists, so every non-GHS currency converts from it (not from the GHS
 * price) — otherwise a GBP/USD customer would be charged based on the GHS
 * conversion while an EUR customer pays the deliberately-set override,
 * two unrelated numbers for the same product.
 */
export function resolveProductPrice(
  ghsPrice: number,
  eurPrice: number | null,
  currency: Currency,
  rates: ExchangeRates
): number {
  if (currency === "GHS") return ghsPrice;
  if (eurPrice == null) return convert(ghsPrice, currency, rates);
  return currency === "EUR" ? eurPrice : convertBetween(eurPrice, "EUR", currency, rates);
}
