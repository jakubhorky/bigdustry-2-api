import { Server } from "socket.io";
import type { Server as HttpServer } from "http";
import { env } from "../config/index.js";
import pino from "pino";
import { z } from "zod";
import type { ClientToServer, ServerToClient } from "./events.js";
import { getSessionFromRequest } from "../modules/auth/context.js";
import { db, schema } from "../db/index.js";

const log = pino({ name: "ws" });

export function createSocketServer(httpServer: HttpServer) {
  const io: Server<ClientToServer, ServerToClient> = new Server(httpServer, {
    cors: { origin: env.ORIGIN, methods: ["GET", "POST"] },
  });

  const rate = new Map<string, { count: number; ts: number }>();

  function rateLimit(id: string) {
    const now = Date.now();
    const w = rate.get(id) ?? { count: 0, ts: now };
    if (now - w.ts > 1000) {
      w.count = 0; w.ts = now;
    }
    w.count++;
    rate.set(id, w);
    return w.count <= 20;
  }

  io.on("connection", (socket) => {
    log.info({ id: socket.id }, "socket connected");
    const token = socket.handshake.auth?.token || socket.handshake.headers.authorization;
    const reqLike: any = { headers: { authorization: typeof token === 'string' && !token.startsWith('Bearer') ? `Bearer ${token}` : token } };
    const session = getSessionFromRequest(reqLike);
    if (session) {
      socket.join(`user:${session.userId}`);
    }

    socket.on("chat:send", (payload) => {
      if (!rateLimit(socket.id)) return;
      const parsed = z.object({ channel: z.string(), content: z.string() }).safeParse(payload);
      if (!parsed.success) return;
      const badWords = ["badword"];
      let content = parsed.data.content;
      for (const w of badWords) content = content.replaceAll(w, "***");
      const message = {
        id: crypto.randomUUID(),
        channel: parsed.data.channel,
        userId: session?.userId ?? "00000000-0000-0000-0000-000000000000",
        content,
        createdAt: new Date().toISOString(),
      };
      // persist
      db.insert(schema.chatMessages).values({
        id: message.id,
        channel: message.channel,
        userId: message.userId,
        content: message.content,
        createdAt: new Date(message.createdAt) as any,
        flagged: false,
      }).then(() => {}).catch(() => {});
      socket.join(`chat:${message.channel}`);
      io.to(`chat:${message.channel}`).emit("chat:new", message);
    });

    socket.on("disconnect", () => log.info({ id: socket.id }, "socket disconnected"));
  });

  setInterval(() => {
    io.emit("tick:update", { now: Date.now(), diff: {} });
  }, 1000);

  return io;
}


