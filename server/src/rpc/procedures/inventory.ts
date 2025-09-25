import { router, authedProcedure } from "../router.js";
import { db, schema } from "../../db/index.js";
import { eq } from "drizzle-orm";

export const inventoryRouter = router({
  get: authedProcedure.query(async ({ ctx }) => {
    const items = await db.select().from(schema.inventory).where(eq(schema.inventory.userId, ctx.session!.userId));
    return { items: items.map((i) => ({ itemKey: i.itemKey, qty: Number(i.qty) })) };
  }),
});


