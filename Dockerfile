# syntax=docker/dockerfile:1

# Node 22+ is required by @supabase/supabase-js (and its sub-packages) as of
# the version pinned in package.json — building on Node 20 emits EBADENGINE
# warnings and deprecation notices at every Supabase call.
ARG NODE_VERSION=22-alpine

# --- Dependencies -----------------------------------------------------------
FROM node:${NODE_VERSION} AS deps
WORKDIR /app
# Needed by some npm packages that ship native bindings on Alpine.
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci

# --- Build -------------------------------------------------------------------
FROM node:${NODE_VERSION} AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* values are inlined into the client bundle at build time, so
# they must be supplied as build args (docker build --build-arg NAME=value),
# not just at `docker run`.
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_TELEMETRY_DISABLED=1

# The product detail route's generateStaticParams/generateMetadata hit the
# real database at build time (to enumerate product slugs for prerendering),
# so the service-role key must be available during `next build` too — not
# just at container runtime like the other server-only secrets. It's passed
# as a BuildKit secret (not a plain ARG) so it never lands in an image layer:
#   docker build --secret id=supabase_service_role_key,env=SUPABASE_SERVICE_ROLE_KEY ...
RUN --mount=type=secret,id=supabase_service_role_key \
    SUPABASE_SERVICE_ROLE_KEY="$(cat /run/secrets/supabase_service_role_key)" npm run build

# --- Run -----------------------------------------------------------------
FROM node:${NODE_VERSION} AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# `output: "standalone"` (next.config.ts) traces only the files actually
# needed at runtime, so node_modules never has to be installed/copied here.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
