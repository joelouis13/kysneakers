import type { Currency } from "./config";

const LOCALE_BY_CURRENCY: Record<Currency, string> = {
  GHS: "en-GH",
  USD: "en-US",
  EUR: "en-IE",
  GBP: "en-GB",
};

const formatters = new Map<Currency, Intl.NumberFormat>();

function getFormatter(currency: Currency): Intl.NumberFormat {
  let formatter = formatters.get(currency);
  if (!formatter) {
    formatter = new Intl.NumberFormat(LOCALE_BY_CURRENCY[currency], {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    });
    formatters.set(currency, formatter);
  }
  return formatter;
}

export function formatCurrency(amount: number, currency: Currency): string {
  return getFormatter(currency).format(amount);
}
