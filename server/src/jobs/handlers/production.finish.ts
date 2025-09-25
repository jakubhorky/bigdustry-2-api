import { db, schema } from "../../db/index.js";
import { eq } from "drizzle-orm";
import { playerBuildings, playerMaps } from "../../db/schema/core.js";

type Payload = { jobId: string };

export async function handleProductionFinish(payload: Payload) {
  // Idempotence: check job status before applying
  const [job] = await db.select().from(schema.productionJobs).where(eq(schema.productionJobs.id, payload.jobId));
  if (!job || job.status !== "queued") return;

  // Simplified rewards: +10 soft currency
  await db.transaction(async (tx) => {
    await tx.update(schema.productionJobs).set({ status: "finished" }).where(eq(schema.productionJobs.id, payload.jobId));
    // find userId via playerBuilding -> playerMap -> userId
    const [pb] = await tx.select().from(schema.playerBuildings).where(eq(schema.playerBuildings.id, job.playerBuildingId));
    const [pm] = pb ? await tx.select().from(schema.playerMaps).where(eq(schema.playerMaps.id, pb.playerMapId)) : [];
    const userId = pm?.userId;
    if (!userId) return;
    const [curr] = await tx.select().from(schema.currencies).where(eq(schema.currencies.userId, userId));
    await tx
      .insert(schema.transactions)
      .values({ userId, type: "production.finish", deltaSoft: 10n, deltaHard: 0n, metaJson: { jobId: payload.jobId } as any });
    await tx
      .update(schema.currencies)
      .set({ soft: (BigInt(curr?.soft ?? 0) + 10n) as unknown as any })
      .where(eq(schema.currencies.userId, userId));
  });
}


