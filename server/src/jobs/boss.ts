import PgBoss from "pg-boss";
import { env } from "../config/index.js";

export function createBoss() {
  const boss = new PgBoss({ connectionString: env.DATABASE_URL, schema: env.BOSS_SCHEMA });
  return boss;
}


