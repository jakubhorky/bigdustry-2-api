import { db, schema } from "../db/index.js";
import argon2 from "argon2";

async function main() {
  const pass = await argon2.hash("password123");
  const [user] = await db
    .insert(schema.users)
    .values({ email: "player@example.com", passwordHash: pass })
    .onConflictDoNothing()
    .returning();
  const userId = user?.id ?? (await db.select().from(schema.users)).[0]?.id;
  if (!userId) throw new Error("seed failed to get userId");
  await db.insert(schema.profiles).values({ userId, name: "Player One", locale: "en" }).onConflictDoNothing();
  await db.insert(schema.currencies).values({ userId, soft: 100n, hard: 10n }).onConflictDoNothing();

  const [map] = await db
    .insert(schema.maps)
    .values({ key: "starter", definitionJson: { width: 32, height: 32 } as any })
    .onConflictDoNothing()
    .returning();
  const mapId = map?.id ?? (await db.select().from(schema.maps).where(schema.maps.key.eq("starter"))).[0]?.id;
  const [pmap] = await db
    .insert(schema.playerMaps)
    .values({ userId, mapId: mapId!, stateJson: {} as any })
    .onConflictDoNothing()
    .returning();
  const playerMapId = pmap?.id ?? (await db.select().from(schema.playerMaps).where(schema.playerMaps.userId.eq(userId))).[0]?.id;

  await db.insert(schema.buildings).values([
    { key: "farm", baseCostJson: { soft: 50 } as any, baseTimeS: 30, outputsJson: { soft: 10 } as any },
    { key: "mine", baseCostJson: { soft: 100 } as any, baseTimeS: 60, outputsJson: { soft: 20 } as any },
  ]).onConflictDoNothing();

  await db.insert(schema.playerBuildings).values([
    { playerMapId: playerMapId!, buildingKey: "farm", level: 1, x: 5, y: 5, stateJson: {} as any },
    { playerMapId: playerMapId!, buildingKey: "mine", level: 1, x: 8, y: 8, stateJson: {} as any },
  ]).onConflictDoNothing();

  console.log("Seed done", { userId });
}

main().catch((e) => { console.error(e); process.exit(1); });


