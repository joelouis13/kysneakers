import type { Metadata } from "next";
import { Bebas_Neue, Inter } from "next/font/google";

import "./globals.css";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth/auth-context";
import { CartProvider } from "@/lib/cart/cart-context";
import { createClient } from "@/lib/supabase/server";
import { WishlistProvider } from "@/lib/wishlist/wishlist-context";

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

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
              <AuthProvider initialUser={user}>
                <CartProvider>
                  <WishlistProvider>
                    <Header />
                    <main className="flex-1">{children}</main>
                    <Footer />
                    <Toaster />
                  </WishlistProvider>
                </CartProvider>
              </AuthProvider>
            </QueryProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
