# Bigdustry 2 - Server

Authoritative 2D builder game server (FarmVille-like) with Fastify, tRPC, Socket.IO, Drizzle ORM (Postgres), pg-boss. See `server/README.md` for details.

## Quickstart

1) Requirements: Node 20, pnpm 9, Docker

```bash
pnpm i
docker-compose up -d
cp server/.env.example server/.env
pnpm db:migrate
pnpm seed
pnpm dev
```

Health: http://localhost:3000/health

# bigdustry-2-api