import { router, publicProcedure } from "../router.js";
import { z } from "zod";
import { db, schema } from "../../db/index.js";
import { eq } from "drizzle-orm";
import argon2 from "argon2";
import { signToken } from "../../modules/auth/context.js";
import pino from "pino";

const log = pino({ name: "auth" });

export const authRouter = router({
  register: publicProcedure
    .input(z.object({ email: z.string().email(), password: z.string().min(8) }))
    .mutation(async ({ input }) => {
      const passwordHash = await argon2.hash(input.password);
      const [user] = await db
        .insert(schema.users)
        .values({ email: input.email, passwordHash })
        .returning();
      await db.insert(schema.profiles).values({ userId: user.id, name: "Player", locale: "en" });
      await db.insert(schema.currencies).values({ userId: user.id, soft: 0n, hard: 0n });
      return { user: { id: user.id, email: user.email } };
    }),
  login: publicProcedure
    .input(z.object({ email: z.string().email(), password: z.string().min(8) }))
    .mutation(async ({ input }) => {
      const [user] = await db.select().from(schema.users).where(eq(schema.users.email, input.email));
      if (!user || !user.passwordHash) throw new Error("Invalid credentials");
      const ok = await argon2.verify(user.passwordHash, input.password);
      if (!ok) throw new Error("Invalid credentials");
      const token = signToken(user.id);
      return { token };
    }),
  magicLink: router({
    request: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        const [user] = await db.select().from(schema.users).where(eq(schema.users.email, input.email));
        if (!user) return { ok: true };
        const token = signToken(user.id);
        log.info({ email: input.email, token }, "magic-link");
        return { ok: true };
      }),
  }),
});


