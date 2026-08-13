"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

import type { Currency } from "./config";
import { formatCurrency } from "./format";
import { convert, convertBetween, type ExchangeRates } from "./rates";

type CurrencyContextValue = {
  currency: Currency;
  isGhana: boolean;
  rates: ExchangeRates;
  /** Takes a canonical GHS amount (how all prices are stored), returns it formatted in the visitor's currency. */
  formatFromGhs: (amountInGhs: number) => string;
  /** Takes a USD-denominated amount (e.g. the flat international shipping fee), returns it formatted in the visitor's currency. */
  formatFromUsd: (amountInUsd: number) => string;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({
  currency,
  rates,
  children,
}: {
  currency: Currency;
  rates: ExchangeRates;
  children: ReactNode;
}) {
  const value = useMemo<CurrencyContextValue>(
    () => ({
      currency,
      isGhana: currency === "GHS",
      rates,
      formatFromGhs: (amountInGhs: number) => formatCurrency(convert(amountInGhs, currency, rates), currency),
      formatFromUsd: (amountInUsd: number) =>
        formatCurrency(convertBetween(amountInUsd, "USD", currency, rates), currency),
    }),
    [currency, rates]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency(): CurrencyContextValue {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error("useCurrency must be used within a CurrencyProvider");
  return context;
}
