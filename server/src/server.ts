import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import pino from "pino";
import { env } from "./config/index.js";
import { createSocketServer } from "./realtime/socket.js";
import { createBoss } from "./jobs/boss.js";
import { registerCrons } from "./jobs/cron.js";
import { appRouter, createContext } from "./rpc/router.js";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";

const log = pino({ name: "server" });

async function build() {
  const app = Fastify({ logger: true });
  await app.register(cors, { origin: env.ORIGIN });
  await app.register(helmet);
  await app.register(rateLimit, { max: 100, timeWindow: "1 minute" });

  app.get("/health", async () => ({ status: "ok" }));
  app.get("/metrics", async () => {
    // minimal metrics
    return {
      sockets_active: (app as any).io?.engine?.clientsCount ?? 0,
    };
  });

  await app.register(fastifyTRPCPlugin, {
    prefix: "/trpc",
    trpcOptions: { router: appRouter, createContext: ({ req }) => createContext({ req }) },
  });

  const server = await app.listen({ port: Number(env.PORT), host: "0.0.0.0" });
  const httpServer = app.server;
  const io = createSocketServer(httpServer);
  (app as any).io = io;

  const boss = createBoss();
  await boss.start();
  await registerCrons(boss);

  log.info({ server }, "listening");
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});


