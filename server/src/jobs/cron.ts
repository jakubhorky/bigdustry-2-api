import type PgBoss from "pg-boss";
import { handleLeaderboardSnapshotDaily } from "./handlers/leaderboard.snapshot.js";
import { handleDailyReset } from "./handlers/daily.reset.js";
import { handleProductionFinish } from "./handlers/production.finish.js";

export async function registerCrons(boss: PgBoss) {
  await boss.work("production.finish", async (job) => {
    await handleProductionFinish(job.data as any);
  });
  await boss.work("leaderboard.snapshot:daily", async () => {
    await handleLeaderboardSnapshotDaily();
  });
  await boss.work("daily.reset", async () => {
    await handleDailyReset();
  });
  await boss.schedule("leaderboard.snapshot:daily", "0 0 * * *", {});
  await boss.schedule("daily.reset", "0 0 * * *", {});
}


