import jwt from "jsonwebtoken";
import { z } from "zod";
import type { FastifyRequest } from "fastify";
import { env } from "../../config/index.js";

export type Session = { userId: string } | null;

const bearerRegex = /^Bearer\s+(.+)$/i;

export function getSessionFromRequest(req: FastifyRequest): Session {
  const auth = req.headers["authorization"];
  if (!auth || Array.isArray(auth)) return null;
  const match = auth.match(bearerRegex);
  if (!match) return null;
  try {
    const payload = jwt.verify(match[1], env.JWT_SECRET);
    const parsed = z.object({ userId: z.string().uuid() }).safeParse(payload);
    if (!parsed.success) return null;
    return { userId: parsed.data.userId };
  } catch {
    return null;
  }
}

export function signToken(userId: string): string {
  return jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: "7d" });
}


