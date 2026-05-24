# ── Stage 1: сборка Next.js ─────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json ./
RUN npm install --legacy-peer-deps

COPY . .

# NEXT_PUBLIC_* vars must be baked in at build time
ARG NEXT_PUBLIC_API_URL=http://localhost/api/v1
ARG NEXT_PUBLIC_WS_URL=ws://localhost
ARG NEXT_PUBLIC_LIVEKIT_URL=ws://155.212.128.231:7880
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL \
    NEXT_PUBLIC_LIVEKIT_URL=$NEXT_PUBLIC_LIVEKIT_URL \
    NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ── Stage 2: production runner ───────────────────────────────────
FROM node:20-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

# Берём только то что нужно для запуска
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
