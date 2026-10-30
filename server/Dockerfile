FROM node:22-slim

# Prisma's query engine needs OpenSSL; Coolify's health check needs curl
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl curl ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci --omit=dev && npm cache clean --force

COPY src ./src

# /data must be a persistent volume, otherwise the database is wiped on every redeploy
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000 \
    TRUST_PROXY=1 \
    DATABASE_URL=file:/data/xblock.db

RUN mkdir -p /data && chown node:node /data
USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s \
  CMD curl -fsS http://127.0.0.1:3000/health || exit 1

CMD ["npm", "run", "start:prod"]
