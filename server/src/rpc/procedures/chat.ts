import { router, authedProcedure, publicProcedure } from "../router.js";
import { db, schema } from "../../db/index.js";
import { z } from "zod";

const badWords = ["badword"];
const sanitize = (text: string) => {
  let out = text;
  for (const w of badWords) out = out.replaceAll(w, "***");
  return out;
};

export const chatRouter = router({
  list: publicProcedure.input(z.object({ channel: z.string().min(1) })).query(async ({ input }) => {
    const rows = await db.select().from(schema.chatMessages).where(schema.chatMessages.channel.eq(input.channel)).limit(50);
    return { messages: rows };
  }),
});


