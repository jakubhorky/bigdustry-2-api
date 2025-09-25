import { z } from "zod";

export const clientEvents = {
  queueProduction: z.object({ buildingId: z.string().uuid(), recipeKey: z.string(), qty: z.number().int().positive() }),
  harvest: z.object({ jobId: z.string().uuid() }),
  chatSend: z.object({ channel: z.string().min(1), content: z.string().min(1).max(256) }),
};

export const serverEvents = {
  tickUpdate: z.object({ now: z.number(), diff: z.any() }),
  chatNew: z.object({ id: z.string().uuid(), channel: z.string(), userId: z.string().uuid(), content: z.string(), createdAt: z.string() }),
  leaderboardUpdate: z.object({}),
};

export type ClientToServer = {
  "action:queueProduction": z.infer<typeof clientEvents.queueProduction>;
  "action:harvest": z.infer<typeof clientEvents.harvest>;
  "chat:send": z.infer<typeof clientEvents.chatSend>;
};

export type ServerToClient = {
  "tick:update": z.infer<typeof serverEvents.tickUpdate>;
  "chat:new": z.infer<typeof serverEvents.chatNew>;
  "leaderboard:update": z.infer<typeof serverEvents.leaderboardUpdate>;
};


