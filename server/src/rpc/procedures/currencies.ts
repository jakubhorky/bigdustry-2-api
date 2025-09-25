import { router, authedProcedure } from "../router.js";
import { db, schema } from "../../db/index.js";
import { eq } from "drizzle-orm";

export const currenciesRouter = router({
  get: authedProcedure.query(async ({ ctx }) => {
    const [row] = await db.select().from(schema.currencies).where(eq(schema.currencies.userId, ctx.session!.userId));
    return { soft: Number(row?.soft ?? 0), hard: Number(row?.hard ?? 0) };
  }),
});


