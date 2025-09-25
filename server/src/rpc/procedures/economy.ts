import { router, authedProcedure } from "../router.js";
import { z } from "zod";
import { db, schema } from "../../db/index.js";
import { eq } from "drizzle-orm";
import PgBoss from "pg-boss";
import { env } from "../../config/index.js";

export const economyRouter = router({
  startProduction: authedProcedure
    .input(z.object({ buildingId: z.string().uuid(), recipeKey: z.string(), qty: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const now = new Date();
      const finish = new Date(now.getTime() + 30_000); // stub 30s
      const [job] = await db
        .insert(schema.productionJobs)
        .values({ playerBuildingId: input.buildingId, recipeKey: input.recipeKey, qty: input.qty, startAt: now, finishAt: finish, status: "queued" })
        .returning();
      const boss = new PgBoss({ connectionString: env.DATABASE_URL, schema: env.BOSS_SCHEMA });
      await boss.start();
      await boss.send("production.finish", { jobId: job.id }, { startAfter: finish });
      await boss.stop();
      return { jobId: job.id, finishAt: job.finishAt.toISOString() };
    }),
  harvest: authedProcedure
    .input(z.object({ jobId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [job] = await db.select().from(schema.productionJobs).where(eq(schema.productionJobs.id, input.jobId));
      if (!job) throw new Error("Job not found");
      if (job.status !== "finished") throw new Error("Not finished");
      const rewards = { soft: 10 * job.qty };
      let balances = { soft: 0, hard: 0 };
      await db.transaction(async (tx) => {
        const [curr] = await tx.select().from(schema.currencies).where(eq(schema.currencies.userId, ctx.session!.userId));
        const nextSoft = BigInt(curr?.soft ?? 0) + BigInt(rewards.soft);
        await tx.update(schema.currencies).set({ soft: nextSoft as any }).where(eq(schema.currencies.userId, ctx.session!.userId));
        await tx
          .insert(schema.transactions)
          .values({ userId: ctx.session!.userId, type: "harvest", deltaSoft: BigInt(rewards.soft), deltaHard: 0n, metaJson: { jobId: input.jobId } as any });
        balances = { soft: Number(nextSoft), hard: Number(curr?.hard ?? 0) };
        await tx.update(schema.productionJobs).set({ status: "claimed" }).where(eq(schema.productionJobs.id, input.jobId));
      });
      return { rewards, balances };
    }),
  craft: authedProcedure
    .input(z.object({ recipeKey: z.string(), qty: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      // Stub: consume nothing, add item to inventory
      await db.transaction(async (tx) => {
        await tx.insert(schema.inventory).values({ userId: ctx.session!.userId, itemKey: input.recipeKey, qty: BigInt(input.qty) });
      });
      return { result: { itemKey: input.recipeKey, qty: input.qty } };
    }),
});


