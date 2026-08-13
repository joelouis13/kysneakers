import type { Currency } from "./config";

export type ExchangeRates = Record<Currency, number>;

/**
 * Rough fallback rates (GHS -> target), only used if the live API is
 * unreachable. These will drift from reality over time — acceptable while
 * this is low-volume, worth revisiting before it's a meaningful revenue
 * path.
 */
const FALLBACK_RATES: ExchangeRates = {
  GHS: 1,
  USD: 0.065,
  EUR: 0.06,
  GBP: 0.051,
};

/** ECB-backed, free, no API key needed. Cached 1 hour via Next's fetch cache. */
export async function getExchangeRates(): Promise<ExchangeRates> {
  try {
    const res = await fetch("https://api.frankfurter.app/latest?from=GHS&to=USD,EUR,GBP", {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error(`Frankfurter API returned ${res.status}`);
    const data = (await res.json()) as { rates: Record<string, number> };
    return {
      GHS: 1,
      USD: data.rates.USD ?? FALLBACK_RATES.USD,
      EUR: data.rates.EUR ?? FALLBACK_RATES.EUR,
      GBP: data.rates.GBP ?? FALLBACK_RATES.GBP,
    };
  } catch {
    return FALLBACK_RATES;
  }
}

export function convert(amountInGhs: number, targetCurrency: Currency, rates: ExchangeRates): number {
  return amountInGhs * rates[targetCurrency];
}

/** General currency->currency conversion (e.g. a USD-denominated flat fee charged in EUR), via GHS as the pivot. */
export function convertBetween(
  amount: number,
  from: Currency,
  to: Currency,
  rates: ExchangeRates
): number {
  const amountInGhs = from === "GHS" ? amount : amount / rates[from];
  return to === "GHS" ? amountInGhs : amountInGhs * rates[to];
}
