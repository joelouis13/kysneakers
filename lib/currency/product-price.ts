import type { Currency } from "./config";
import { convert, type ExchangeRates } from "./rates";

/**
 * The single place "what does this product actually cost in this order's
 * currency" is decided — shared by checkout-form.tsx's live subtotal display
 * and placeOrder's actual charge computation, so the two can never drift.
 * Admin-set EUR price wins when it exists; everything else falls back to
 * live FX conversion from the canonical GHS price.
 */
export function resolveProductPrice(
  ghsPrice: number,
  eurPrice: number | null,
  currency: Currency,
  rates: ExchangeRates
): number {
  if (currency === "GHS") return ghsPrice;
  if (currency === "EUR" && eurPrice != null) return eurPrice;
  return convert(ghsPrice, currency, rates);
}
