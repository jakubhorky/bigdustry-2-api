FROM node:20-slim AS deps
WORKDIR /app
COPY ../../package.json ./package.json
RUN corepack enable && corepack prepare pnpm@9.6.0 --activate && pnpm fetch

FROM node:20-slim AS build
WORKDIR /app
COPY ../../package.json ./package.json
COPY ./tsconfig.json ./server/tsconfig.json
COPY ./src ./server/src
RUN corepack enable && corepack prepare pnpm@9.6.0 --activate && pnpm i --ignore-scripts && pnpm --filter ./server build

FROM node:20-slim
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/server/dist ./server/dist
COPY --from=build /app/package.json ./package.json
EXPOSE 3000
CMD ["node", "server/dist/server.js"]


