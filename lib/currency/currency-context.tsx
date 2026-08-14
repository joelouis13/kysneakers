"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

import type { Currency } from "./config";
import { formatCurrency } from "./format";
import { convert, convertBetween, type ExchangeRates } from "./rates";
import { vatPortionOfInclusiveAmount } from "./vat";

type CurrencyContextValue = {
  currency: Currency;
  isGhana: boolean;
  rates: ExchangeRates;
  /** 0 unless the visitor's country has a configured VAT rate (currently just Netherlands, 0.21). */
  vatRate: number;
  /** Takes a canonical GHS amount (how all prices are stored), returns it formatted in the visitor's currency. */
  formatFromGhs: (amountInGhs: number) => string;
  /** Same conversion as formatFromGhs, but returns the raw number (for further math, e.g. VAT breakdown). */
  convertFromGhs: (amountInGhs: number) => number;
  /** Takes a USD-denominated amount (e.g. the flat international shipping fee), returns it formatted in the visitor's currency. */
  formatFromUsd: (amountInUsd: number) => string;
  /** VAT already included in `grossAmount` (display currency), for the "Includes VAT: X" breakdown line — doesn't change the total. */
  vatPortion: (grossAmount: number) => number;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({
  currency,
  rates,
  vatRate,
  children,
}: {
  currency: Currency;
  rates: ExchangeRates;
  vatRate: number;
  children: ReactNode;
}) {
  const value = useMemo<CurrencyContextValue>(
    () => ({
      currency,
      isGhana: currency === "GHS",
      rates,
      vatRate,
      formatFromGhs: (amountInGhs: number) => formatCurrency(convert(amountInGhs, currency, rates), currency),
      convertFromGhs: (amountInGhs: number) => convert(amountInGhs, currency, rates),
      formatFromUsd: (amountInUsd: number) =>
        formatCurrency(convertBetween(amountInUsd, "USD", currency, rates), currency),
      vatPortion: (grossAmount: number) => vatPortionOfInclusiveAmount(grossAmount, vatRate),
    }),
    [currency, rates, vatRate]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency(): CurrencyContextValue {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error("useCurrency must be used within a CurrencyProvider");
  return context;
}
