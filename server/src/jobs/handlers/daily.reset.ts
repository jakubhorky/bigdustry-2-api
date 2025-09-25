import { db, schema } from "../../db/index.js";

export async function handleDailyReset() {
  // Stub: grant daily soft 50 to all users
  const currs = await db.select().from(schema.currencies);
  await db.transaction(async (tx) => {
    for (const c of currs) {
      const next = (BigInt(c.soft) + 50n) as any;
      await tx.update(schema.currencies).set({ soft: next }).where(schema.currencies.userId.eq(c.userId));
      await tx.insert(schema.transactions).values({ userId: c.userId, type: "daily.reset", deltaSoft: 50n, deltaHard: 0n, metaJson: {} as any });
    }
  });
}


