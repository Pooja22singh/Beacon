# syntax=docker/dockerfile:1

# Shared base: Node plus the pnpm version this service is pinned to.
# node:26-alpine ships without corepack, so npm is used once to install pnpm.
FROM node:26-alpine AS base
RUN npm install -g pnpm@12.18.0
WORKDIR /app

# Build stage: all dependencies, compile TypeScript to dist/
FROM base AS build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY tsconfig.json ./
COPY src ./src
RUN pnpm build

# Production dependencies only
FROM base AS prod-deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --prod

# Runtime stage: no pnpm, no compiler, no source
FROM node:26-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000
COPY package.json ./
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
USER node
EXPOSE 4000
HEALTHCHECK --interval=15s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:4000/health || exit 1
# Exec form so Node is PID 1 and receives SIGTERM directly
CMD ["node", "dist/http.js"]
