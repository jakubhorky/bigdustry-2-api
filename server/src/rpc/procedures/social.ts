import { router, authedProcedure } from "../router.js";
import { db, schema } from "../../db/index.js";
import { z } from "zod";

export const socialRouter = router({
  addFriend: authedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.session!.userId === input.userId) return { status: "self" } as const;
      await db.insert(schema.friends).values({ userId: ctx.session!.userId, friendUserId: input.userId, status: "pending" });
      return { status: "pending" as const };
    }),
  clans: router({
    create: authedProcedure.input(z.object({ name: z.string().min(3) })).mutation(async ({ ctx, input }) => {
      const [clan] = await db
        .insert(schema.clans)
        .values({ name: input.name, ownerId: ctx.session!.userId })
        .returning();
      await db.insert(schema.clanMembers).values({ clanId: clan.id, userId: ctx.session!.userId, role: "owner" });
      return { id: clan.id };
    }),
    join: authedProcedure.input(z.object({ clanId: z.string().uuid() })).mutation(async ({ ctx, input }) => {
      await db.insert(schema.clanMembers).values({ clanId: input.clanId, userId: ctx.session!.userId, role: "member" });
      return { ok: true };
    }),
    leave: authedProcedure.input(z.object({ clanId: z.string().uuid() })).mutation(async ({ ctx, input }) => {
      await db.delete(schema.clanMembers).where(schema.clanMembers.clanId.eq(input.clanId).and(schema.clanMembers.userId.eq(ctx.session!.userId)));
      return { ok: true };
    }),
  }),
});


