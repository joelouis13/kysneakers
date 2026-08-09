import Image from "next/image";
import Link from "next/link";

import { NewsletterForm } from "@/components/layout/newsletter-form";
import { FacebookIcon, InstagramIcon, XIcon } from "@/components/icons/social";

const FOOTER_LINKS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Shop",
    links: [
      { label: "New Arrivals", href: "/shop?sort=newest" },
      { label: "Best Sellers", href: "/shop?sort=popular" },
      { label: "Categories", href: "/categories" },
      { label: "Brands", href: "/brands" },
    ],
  },
  {
    title: "Customer Care",
    links: [
      { label: "Track Order", href: "/track-order" },
      { label: "FAQ", href: "/faq" },
      { label: "Contact Us", href: "/contact" },
      { label: "Shipping & Returns", href: "/faq#shipping" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/ky-logo.jpeg"
                alt="KYSneakers"
                width={36}
                height={36}
                className="rounded-md"
              />
              <span className="font-heading text-xl tracking-wide text-primary">
                KYSNEAKERS
              </span>
            </Link>
            <p className="max-w-xs text-sm text-muted-foreground">
              Premium sneakers and streetwear, sourced authentic. Fast delivery across Ghana.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex size-9 items-center justify-center rounded-full border border-border text-icon transition-colors hover:border-primary hover:text-primary"
              >
                <InstagramIcon className="size-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex size-9 items-center justify-center rounded-full border border-border text-icon transition-colors hover:border-primary hover:text-primary"
              >
                <FacebookIcon className="size-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="flex size-9 items-center justify-center rounded-full border border-border text-icon transition-colors hover:border-primary hover:text-primary"
              >
                <XIcon className="size-4" />
              </a>
            </div>
          </div>

          {FOOTER_LINKS.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-foreground">{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-secondary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Stay in the loop</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              New drops, restocks, and exclusive offers — straight to your inbox.
            </p>
          </div>
          <NewsletterForm />
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>&copy; {new Date().getFullYear()} KYSneakers. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-secondary">Terms</Link>
            <Link href="/privacy" className="hover:text-secondary">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
