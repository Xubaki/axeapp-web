# ─────────────────────────────────────────────────────────────
# Stage 1: Build
# ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependências (incluindo devDependencies para o build)
COPY package.json ./
RUN npm install

# Copiar todo o código-fonte do backend
COPY . .

# Build com esbuild (gera dist/index.js)
RUN npm run build

# ─────────────────────────────────────────────────────────────
# Stage 2: Production
# ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Apenas dependências de produção
COPY package.json ./
RUN npm install --omit=dev

# Copiar bundle gerado no stage de build
COPY --from=builder /app/dist ./dist

# Copiar arquivos estáticos públicos (PDFs de termos/privacidade, parceiros)
COPY --from=builder /app/public ./public

# Copiar migrations do Drizzle
COPY --from=builder /app/drizzle ./drizzle

# Usuário não-root para segurança
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Porta padrão (Railway/Render injetam PORT automaticamente)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:${PORT:-3000}/api/health || exit 1

CMD ["node", "dist/index.js"]
