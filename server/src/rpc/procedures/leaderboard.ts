import { router, publicProcedure } from "../router.js";
import { db, schema } from "../../db/index.js";
import { z } from "zod";
import { desc } from "drizzle-orm";

export const leaderboardRouter = router({
  getDaily: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(10), offset: z.number().min(0).default(0) }))
    .query(async ({ input }) => {
      const rows = await db
        .select()
        .from(schema.leaderboardDaily)
        .orderBy(desc(schema.leaderboardDaily.score))
        .limit(input.limit)
        .offset(input.offset);
      return { rows };
    }),
});


