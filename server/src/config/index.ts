import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  PORT: z.string().default("3000"),
  JWT_SECRET: z.string().min(8),
  ORIGIN: z.string().default("http://localhost:5173"),
  POSTHOG_API_KEY: z.string().optional().default("dev-key"),
  BOSS_SCHEMA: z.string().default("pgboss"),
  BOSS_CONCURRENCY: z.string().default("5"),
});

export type Env = z.infer<typeof envSchema>;

export const env: Env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  PORT: process.env.PORT ?? "3000",
  JWT_SECRET: process.env.JWT_SECRET,
  ORIGIN: process.env.ORIGIN ?? "http://localhost:5173",
  POSTHOG_API_KEY: process.env.POSTHOG_API_KEY ?? "dev-key",
  BOSS_SCHEMA: process.env.BOSS_SCHEMA ?? "pgboss",
  BOSS_CONCURRENCY: process.env.BOSS_CONCURRENCY ?? "5",
});


