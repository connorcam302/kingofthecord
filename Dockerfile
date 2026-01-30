# ---- base ----
FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# ---- install deps (cached) ----
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock* /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

RUN mkdir -p /temp/prod
COPY package.json bun.lock* /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# ---- build ----
FROM base AS build
COPY --from=install /temp/dev/node_modules node_modules
COPY . .
ENV NODE_ENV=development
ENV PUBLIC_LOG_LEVEL=info
ENV PUBLIC_ORIGIN='http://localhost:7777'
RUN bun run build

# ---- release ----
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=build /usr/src/app/build ./build
COPY --from=build /usr/src/app/package.json ./

ENV BODY_SIZE_LIMIT='Infinity'
ENV ORIGIN='http://localhost:7777'
ENV PUBLIC_ORIGIN='http://localhost:7777'

USER bun
EXPOSE 7777
CMD ["bun", "build/index.js"]
