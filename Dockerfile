# =============================================================
# Stage 1: Base Image
# =============================================================
FROM node:24-alpine AS base

WORKDIR /app

# Install dependensi sistem yang dibutuhkan oleh Prisma di Alpine
RUN apk add --no-cache openssl libc6-compat

# =============================================================
# Stage 2: Dependencies & Build
# =============================================================
FROM base AS builder

COPY package.json package-lock.json ./

# Install dependensi (termasuk devDependencies untuk build TypeScript & Prisma)
RUN npm ci

# Salin schema Prisma, konfigurasi, dan kode sumber
COPY prisma ./prisma
COPY prisma7.config.ts tsconfig.json tsconfig.build.json ./
COPY src ./src

# Generate Prisma Client
RUN npx prisma generate

# Build kode TypeScript ke folder dist/
RUN npm run build

# Bersihkan devDependencies agar image akhir lebih ramping
RUN npm prune --omit=dev

# =============================================================
# Stage 3: Production Runner
# =============================================================
FROM base AS runner

ENV NODE_ENV=production
ENV PORT=4000

# Buat non-root user untuk keamanan
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 bisara

# Salin dependensi produksi dan hasil kompilasi dari builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma7.config.ts ./prisma7.config.ts

# Salin file statis dari folder public
COPY public ./public

# Salin script entrypoint
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Berikan izin ke non-root user
RUN chown -R bisara:nodejs /app

USER bisara

EXPOSE 4000

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/index.js"]
