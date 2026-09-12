# --- Base Alpine ringan ---
FROM node:20-alpine AS base
# libc6-compat dibutuhkan Next.js (SWC) di Alpine
RUN apk add --no-cache libc6-compat
WORKDIR /app

# --- Deps: install dependency saja (cache-friendly) ---
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# --- Builder: build Next.js ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Telemetri Next.js dimatikan agar build bersih
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# --- Runner: image produksi minimal ---
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME="0.0.0.0"

# User non-root demi keamanan
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

# Salin output standalone (wajib: next.config.ts -> output: 'standalone')
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
