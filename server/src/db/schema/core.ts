import { pgTable, uuid, text, timestamp, integer, jsonb, bigint, primaryKey, boolean, index } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").unique().nullable(),
  passwordHash: text("password_hash").nullable(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const profiles = pgTable("profiles", {
  userId: uuid("user_id").references(() => users.id).notNull().primaryKey(),
  name: text("name").notNull(),
  locale: text("locale").notNull(),
});

export const maps = pgTable("maps", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").notNull().unique(),
  definitionJson: jsonb("definition_json").$type<Record<string, unknown>>().notNull(),
});

export const playerMaps = pgTable("player_maps", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  mapId: uuid("map_id").references(() => maps.id).notNull(),
  stateJson: jsonb("state_json").$type<Record<string, unknown>>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const buildings = pgTable("buildings", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").notNull().unique(),
  baseCostJson: jsonb("base_cost_json").$type<Record<string, unknown>>().notNull(),
  baseTimeS: integer("base_time_s").notNull(),
  outputsJson: jsonb("outputs_json").$type<Record<string, unknown>>().notNull(),
});

export const playerBuildings = pgTable("player_buildings", {
  id: uuid("id").primaryKey().defaultRandom(),
  playerMapId: uuid("player_map_id").references(() => playerMaps.id).notNull(),
  buildingKey: text("building_key").notNull(),
  level: integer("level").notNull().default(1),
  x: integer("x").notNull(),
  y: integer("y").notNull(),
  stateJson: jsonb("state_json").$type<Record<string, unknown>>().notNull(),
});

export const productionJobs = pgTable(
  "production_jobs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    playerBuildingId: uuid("player_building_id").references(() => playerBuildings.id).notNull(),
    recipeKey: text("recipe_key").notNull(),
    startAt: timestamp("start_at", { withTimezone: true }).notNull(),
    finishAt: timestamp("finish_at", { withTimezone: true }).notNull(),
    qty: integer("qty").notNull(),
    status: text("status").notNull(),
  },
  (t) => ({
    finishIdx: index("production_jobs_finish_at_idx").on(t.finishAt),
  }),
);

export const inventory = pgTable("inventory", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  itemKey: text("item_key").notNull(),
  qty: bigint("qty", { mode: "number" }).notNull().default(0),
});

export const currencies = pgTable("currencies", {
  userId: uuid("user_id").references(() => users.id).primaryKey(),
  soft: bigint("soft", { mode: "number" }).notNull().default(0),
  hard: bigint("hard", { mode: "number" }).notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const transactions = pgTable(
  "transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    type: text("type").notNull(),
    deltaSoft: bigint("delta_soft", { mode: "number" }).notNull().default(0),
    deltaHard: bigint("delta_hard", { mode: "number" }).notNull().default(0),
    metaJson: jsonb("meta_json").$type<Record<string, unknown>>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    userCreatedIdx: index("transactions_user_created_idx").on(t.userId, t.createdAt),
  }),
);

export const friends = pgTable("friends", {
  userId: uuid("user_id").references(() => users.id).notNull(),
  friendUserId: uuid("friend_user_id").references(() => users.id).notNull(),
  status: text("status").notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.userId, t.friendUserId] }),
}));

export const clans = pgTable("clans", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  ownerId: uuid("owner_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const clanMembers = pgTable("clan_members", {
  clanId: uuid("clan_id").references(() => clans.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  role: text("role").notNull(),
  joinedAt: timestamp("joined_at", { withTimezone: true }).defaultNow(),
}, (t) => ({
  pk: primaryKey({ columns: [t.clanId, t.userId] }),
}));

export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  channel: text("channel").notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  flagged: boolean("flagged").notNull().default(false),
});

export const leaderboardDaily = pgTable(
  "leaderboard_daily",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    score: bigint("score", { mode: "number" }).notNull().default(0),
    rank: integer("rank").notNull().default(0),
    snapshotAt: timestamp("snapshot_at", { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    scoreDescIdx: index("leaderboard_daily_score_desc_idx").on(t.score),
  }),
);

export const schema = {
  users,
  profiles,
  maps,
  playerMaps,
  buildings,
  playerBuildings,
  productionJobs,
  inventory,
  currencies,
  transactions,
  friends,
  clans,
  clanMembers,
  chatMessages,
  leaderboardDaily,
};


