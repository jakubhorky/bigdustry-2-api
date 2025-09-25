## Bigdustry 2 - Authoritative Game Server (Node/TS)

Stack: Fastify, tRPC, Socket.IO, Drizzle ORM (Postgres), pg-boss, Zod, Pino, Vitest, k6.

### Requirements
- Node.js >= 20, pnpm >= 9
- Docker (for Postgres)

### Setup
```bash
pnpm i
docker-compose up -d
pnpm db:migrate
pnpm seed
pnpm dev
```

Server runs at http://localhost:3000/health and returns {"status":"ok"}.

### Env
Copy `.env.example` to `.env` and adjust values.

### Scripts
- dev: tsx watch server
- build/start: production build
- db:*: drizzle migrations
- seed: seeds basic data
- test: run vitest
- k6: basic WS smoke


