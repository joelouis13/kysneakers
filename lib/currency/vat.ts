/**
 * Country-keyed VAT rates. Only Netherlands is configured for now — every
 * other country (including the rest of the EU) is VAT-free until its real
 * rate is confirmed and added here. Ghana never applies VAT (Moolre orders
 * don't go through this at all — see getVatRate's GH short-circuit).
 */
const VAT_RATES: Partial<Record<string, number>> = {
  NL: 0.21,
};

export function getVatRate(countryCode: string): number {
  return VAT_RATES[countryCode.toUpperCase()] ?? 0;
}

/** Extracts the VAT portion from an already VAT-inclusive gross amount — doesn't change the total, just breaks it down. */
export function vatPortionOfInclusiveAmount(grossAmount: number, vatRate: number): number {
  if (vatRate <= 0) return 0;
  return grossAmount - grossAmount / (1 + vatRate);
}
