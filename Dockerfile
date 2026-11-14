FROM oven/bun:1-alpine AS base
WORKDIR /app

FROM base AS dependencies
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM base AS build
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN bun run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package.json bun.lock ./
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=build /app/build ./build

EXPOSE 3000
CMD ["bun", "x", "react-router-serve", "./build/server/index.js"]
