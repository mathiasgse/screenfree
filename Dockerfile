# ── Base ──────────────────────────────────────────────
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
WORKDIR /app

# ── Dependencies ──────────────────────────────────────
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ── Dev ───────────────────────────────────────────────
FROM base AS dev
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
# Source code is bind-mounted via docker-compose
CMD ["pnpm", "dev", "--port", "4173"]

# ── Builder ───────────────────────────────────────────
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# ── Production ────────────────────────────────────────
FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 4173
ENV PORT=4173
CMD ["node", "server.js"]
