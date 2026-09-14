<p align="center">
  <img src="public/ky-logo.jpeg" alt="KYSneakers" width="120" />
</p>

<h1 align="center">KYSneakers</h1>

<p align="center">
  A custom-built sneaker &amp; streetwear e-commerce platform serving Ghana and international customers,
  with a full self-service admin dashboard.
</p>

---

## Overview

KYSneakers is a full-stack storefront and admin system built from scratch — no Shopify, WooCommerce, or Magento.
It handles two distinct markets from one codebase:

- **Ghana** — priced in GHS, paid via Mobile Money (MTN, Telecel, AirtelTigo) through Moolre.
- **International** — priced in USD/EUR/GBP (auto-detected by location, with live FX rates), paid by card through Stripe.

Admins manage the entire catalog, inventory, and order pipeline from a dedicated dashboard — the storefront and
admin app share one Next.js project but are fully separated at the layout level.

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | [Next.js](https://nextjs.org) 16 (App Router, Turbopack) + React 19 + TypeScript |
| Styling | Tailwind CSS 4 + [shadcn/ui](https://ui.shadcn.com) (Radix primitives) + Framer Motion |
| Forms & validation | React Hook Form + Zod |
| Data fetching | TanStack Query (client) + Server Components/Actions (server) |
| Database & Auth | [Supabase](https://supabase.com) (Postgres, Row Level Security, Auth, Storage) |
| Payments | [Moolre](https://moolre.com) (Ghana Mobile Money) + [Stripe](https://stripe.com) (international cards) |
| Email | [Resend](https://resend.com) |
| SMS | [Hubtel](https://hubtel.com) |
| Deployment | [Vercel](https://vercel.com) (primary) or Docker (self-hosted) |

## Features

### Storefront

- Product catalog with brand/category/size/price filters, search, and sorting
- Product organization tags: Featured, New Arrival, Flash Sales, On Sale, and International Only
  (hides a product from the Ghana market while still selling it everywhere else)
- Location-aware currency (GHS / USD / EUR / GBP) with live exchange rates and per-product EUR price overrides
- Dutch VAT handled correctly for orders shipping to the Netherlands (prices are VAT-inclusive; customers see a
  simple "VAT included" disclosure rather than a recomputed breakdown)
- Cart, wishlist, and saved-for-later, with guest and signed-in support
- Checkout that branches by market: Mobile Money + OTP flow for Ghana, hosted Stripe Checkout for everyone else
- Order tracking by order number, order history for signed-in customers
- Product reviews (moderated — submissions are pending until an admin approves them)
- Coupons (percentage or fixed-amount, with minimum purchase, usage limits, and expiry)
- Email notifications for order confirmation, addressed to both the customer and staff, including full
  shipping/contact details for fulfillment
- Email/password and Google authentication, password reset, email verification

### Admin Dashboard (`/admin`)

Route-protected — only staff accounts (checked via a `is_staff()` RPC against Supabase RLS) can reach it.

- **Dashboard** — at-a-glance revenue/orders/stock KPIs
- **Products** — full CRUD, drag-and-drop image reordering, per-size inventory, soft delete/restore, audit log
  on every change
- **Categories** / **Brands** — CRUD with images
- **Inventory** — cross-product stock table with inline quantity edits, low-stock thresholds
- **Orders** — order detail (contact info, shipping address, items, payment status), status updates
- **Reports** — revenue and order-volume stat tiles

Sections still on the roadmap (visible in the sidebar, marked "Soon"): Customers, Coupons, Reviews, Settings, Users.

## Getting Started

### Prerequisites

- Node.js 22+
- A [Supabase](https://supabase.com) project (Postgres + Auth + Storage)
- npm (this project uses `package-lock.json`)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the example file and fill in real values:

```bash
cp .env.local.example .env.local
```

| Variable | Required for |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client-side Supabase access |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only privileged operations (checkout, admin writes) — never expose this |
| `NEXT_PUBLIC_SITE_URL` | Absolute URLs in emails, redirects, and webhook callbacks |
| `MOOLRE_API_USER` / `MOOLRE_API_KEY` / `MOOLRE_ACCOUNT_ID` / `MOOLRE_WEBHOOK_SECRET` | Ghana Mobile Money checkout |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | International card checkout |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` | Transactional email |
| `HUBTEL_CLIENT_ID` / `HUBTEL_CLIENT_SECRET` / `HUBTEL_SENDER_ID` | Transactional SMS |

### 3. Apply database migrations

Every schema change lives as a SQL file under `supabase/migrations/`, applied in filename order via the
Supabase SQL editor or the Supabase CLI. There is no ORM — Postgres functions (e.g. `search_products`,
`get_catalog_facets`) do the heavy lifting for catalog queries, called through PostgREST/`supabase-js`.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Other scripts

```bash
npm run build   # production build
npm run start   # run a production build locally
npm run lint    # ESLint
```

## Project Structure

```
app/
  (storefront)/     # customer-facing routes — shop, cart, checkout, orders, account, etc.
  admin/            # staff-only dashboard, separate layout/chrome from the storefront
  api/webhooks/      # Stripe + Moolre payment webhooks
lib/
  admin/            # admin-side queries, actions, schemas per resource (products, orders, ...)
  catalog/          # product search/listing (backed by Postgres RPCs)
  checkout/         # order placement, payment orchestration, order status
  currency/         # market detection, FX rates, formatting, VAT
  moolre/ stripe/   # payment provider clients
  supabase/         # Supabase client factories (browser, server, service-role)
  email/            # transactional email templates (Resend)
components/         # UI, organized by feature area (shop, checkout, admin, ui primitives, ...)
supabase/migrations/ # the database schema, as ordered SQL migrations
```

## Deployment

### Vercel (primary)

Pushing to the tracked branch triggers a Vercel build automatically. `next.config.ts` detects the Vercel
build environment (`process.env.VERCEL`) and adjusts output mode accordingly — see the note below.

### Docker (self-hosted alternative)

A multi-stage `Dockerfile` is included, producing a minimal image via Next.js's `standalone` output mode.
This mode is **only** applied outside of Vercel — Vercel has its own file-tracing pipeline that conflicts
with it, so `next.config.ts` disables it automatically when `VERCEL` is set.

```bash
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=... \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=... \
  --build-arg NEXT_PUBLIC_SITE_URL=... \
  --secret id=supabase_service_role_key,src=<path-to-a-file-containing-just-the-key> \
  -t kysneakers .

docker run -d --name kysneakers -p 3000:3000 --env-file .env.local kysneakers
```

The service-role key is passed as a build secret rather than a build arg because the product detail route
queries the live database at build time (to enumerate slugs for static generation) — a plain `--build-arg`
would otherwise leave the key readable in the image's layer history.

## Payments

- **Ghana**: `lib/moolre/` initiates a Mobile Money push payment; the webhook (`app/api/webhooks/moolre/route.ts`)
  never trusts the callback payload directly — it always re-verifies via Moolre's status endpoint before marking
  a payment confirmed.
- **International**: `lib/stripe/` creates a hosted Stripe Checkout Session; the webhook verifies Stripe's
  signature before confirming payment.

An order is only ever marked "Paid" after webhook-driven verification — never on the strength of the client
redirecting back successfully.

## Notes for Contributors

- This is a private, closed-source project (`"private": true` in `package.json`) — not intended for external
  contributions.
- There is currently no automated test suite; verification is done via `npm run build`/`tsc --noEmit` and
  manual/live testing against the Supabase project.
- `types/database.ts` is a hand-maintained stand-in for `supabase gen types typescript` — keep it in sync with
  `supabase/migrations/` when the schema changes.
