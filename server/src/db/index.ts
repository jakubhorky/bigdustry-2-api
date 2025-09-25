import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { env } from "../config/index.js";
export { schema } from "./schema/core.js";

const { Pool } = pg;

export const pool = new Pool({ connectionString: env.DATABASE_URL });
export const db = drizzle(pool);


