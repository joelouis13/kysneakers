export const SUPPORTED_CURRENCIES = ["GHS", "USD", "EUR", "GBP"] as const;
export type Currency = (typeof SUPPORTED_CURRENCIES)[number];

const EUROZONE_COUNTRIES = new Set([
  "AT", "BE", "CY", "EE", "FI", "FR", "DE", "GR", "IE", "IT",
  "LV", "LT", "LU", "MT", "NL", "PT", "SK", "SI", "ES",
]);

/** Countries outside this map (and outside the Eurozone) default to USD. */
const COUNTRY_TO_CURRENCY: Record<string, Currency> = {
  GH: "GHS",
  GB: "GBP",
  US: "USD",
};

export function getCurrencyForCountry(countryCode: string): Currency {
  const code = countryCode.toUpperCase();
  if (COUNTRY_TO_CURRENCY[code]) return COUNTRY_TO_CURRENCY[code];
  if (EUROZONE_COUNTRIES.has(code)) return "EUR";
  return "USD";
}
