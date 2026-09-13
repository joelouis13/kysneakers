import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only for the Docker build (Dockerfile) — Vercel has its own file-tracing
  // and bundling pipeline and fails when this is set (its build step expects
  // .next/next-server.js.nft.json, which standalone mode restructures away).
  // Vercel always sets VERCEL=1 during build, so this only activates locally/Docker.
  output: process.env.VERCEL ? undefined : "standalone",
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
