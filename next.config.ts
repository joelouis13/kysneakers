import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only for the Docker build (Dockerfile) — Vercel has its own file-tracing
  // and bundling pipeline and fails when this is set (its build step expects
  // .next/next-server.js.nft.json, which standalone mode restructures away).
  // Vercel always sets VERCEL=1 during build, so this only activates locally/Docker.
  output: process.env.VERCEL ? undefined : "standalone",
  experimental: {
    serverActions: {
      // Default is 1MB, far too small for product image uploads (the admin
      // product form sends raw File objects to createProduct/updateProduct
      // as Server Action arguments) — a single phone photo alone commonly
      // exceeds 1MB, let alone several. This is admin-only and
      // staff-authenticated, so a generous limit here isn't a DoS concern
      // the way it would be on a public-facing action.
      bodySizeLimit: "20mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
