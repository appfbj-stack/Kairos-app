FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat python3 make g++
RUN npm install -g pnpm@10

WORKDIR /app

# Copia tudo (node_modules está no .dockerignore)
COPY . .

# Instala dependências com o lockfile commitado
RUN pnpm install --frozen-lockfile

# Build args para variáveis NEXT_PUBLIC_* (precisam estar disponíveis no build)
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_APP_URL=http://187.77.229.227
ARG NEXT_PUBLIC_APP_NAME=Kairos

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_APP_NAME=$NEXT_PUBLIC_APP_NAME

# Build do Next.js
RUN pnpm --filter web build

# ── Runner ────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/web/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "apps/web/server.js"]
