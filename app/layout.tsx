import type { Metadata } from "next";
import { Bebas_Neue, Inter } from "next/font/google";

import "./globals.css";

import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth/auth-context";
import { getCurrencyForCountry } from "@/lib/currency/config";
import { CurrencyProvider } from "@/lib/currency/currency-context";
import { detectCountry } from "@/lib/currency/detect";
import { getExchangeRates } from "@/lib/currency/rates";
import { createClient } from "@/lib/supabase/server";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const bebasNeue = Bebas_Neue({
  variable: "--font-heading",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "KYSneakers — Premium Sneakers & Streetwear",
    template: "%s | KYSneakers",
  },
  description:
    "Shop authentic sneakers and streetwear from Nike, Adidas, Jordan, New Balance, and more. Fast delivery across Ghana.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isStaff = user ? (await supabase.rpc("is_staff")).data ?? false : false;

  const country = await detectCountry();
  const currency = getCurrencyForCountry(country);
  const rates = await getExchangeRates();

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${bebasNeue.variable}`}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TooltipProvider>
            <QueryProvider>
              <CurrencyProvider currency={currency} rates={rates}>
                <AuthProvider initialUser={user} initialIsStaff={isStaff}>
                  {children}
                  <Toaster />
                </AuthProvider>
              </CurrencyProvider>
            </QueryProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
