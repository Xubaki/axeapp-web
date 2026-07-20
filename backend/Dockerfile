# ─────────────────────────────────────────────────────────────
# Stage 1: Build
# ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependências (incluindo devDependencies para o build com esbuild)
COPY package.json package-lock.json* ./
RUN npm install

# Copiar todo o código-fonte do backend
COPY . .

# Build com esbuild (gera dist/index.js)
# --packages=external mantém as deps externas fora do bundle (instaladas em produção)
RUN npm run build

# ─────────────────────────────────────────────────────────────
# Stage 2: Production
# ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Instalar dependências de produção + drizzle-kit para migrações
COPY package.json package-lock.json* ./
RUN npm install --omit=dev --ignore-scripts && \
    npm install drizzle-kit --save-dev --ignore-scripts

# Copiar bundle gerado no stage de build
COPY --from=builder /app/dist ./dist

# Copiar migrations do Drizzle (necessário para db:migrate)
COPY --from=builder /app/drizzle ./drizzle

# Copiar config do Drizzle (necessário para drizzle-kit migrate)
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts

# Porta padrão (Railway injeta PORT automaticamente)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:${PORT:-3000}/api/health || exit 1

CMD ["node", "dist/index.js"]
