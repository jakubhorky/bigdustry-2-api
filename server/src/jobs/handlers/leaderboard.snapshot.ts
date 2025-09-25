import { db, schema } from "../../db/index.js";

export async function handleLeaderboardSnapshotDaily() {
  // Simplified: compute score = soft currency
  const users = await db.select().from(schema.currencies);
  // Clear table is skipped; assume append-only snapshots
  for (const u of users) {
    await db.insert(schema.leaderboardDaily).values({ userId: u.userId, score: u.soft as any, rank: 0 });
  }
}


