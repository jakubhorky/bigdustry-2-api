import { initTRPC, TRPCError } from "@trpc/server";
import { ZodError, z } from "zod";
import type { FastifyRequest } from "fastify";
import { getSessionFromRequest } from "../modules/auth/context.js";

export type Context = {
  session: { userId: string } | null;
  req: FastifyRequest;
};

export function createContext(opts: { req: FastifyRequest }): Context {
  return {
    session: getSessionFromRequest(opts.req),
    req: opts.req,
  };
}

const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error }) {
    const zod = error.cause instanceof ZodError ? error.cause.flatten() : null;
    return { ...shape, data: { ...shape.data, zod } };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const authedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session) throw new TRPCError({ code: "UNAUTHORIZED" });
  return next({ ctx });
});

// Subrouters will be merged here
import { authRouter } from "./procedures/auth.js";
import { inventoryRouter } from "./procedures/inventory.js";
import { currenciesRouter } from "./procedures/currencies.js";
import { economyRouter } from "./procedures/economy.js";
import { leaderboardRouter } from "./procedures/leaderboard.js";
import { socialRouter } from "./procedures/social.js";
import { chatRouter } from "./procedures/chat.js";

export const appRouter = router({
  auth: authRouter,
  inventory: inventoryRouter,
  currencies: currenciesRouter,
  economy: economyRouter,
  leaderboard: leaderboardRouter,
  social: socialRouter,
  chat: chatRouter,
});

export type AppRouter = typeof appRouter;


