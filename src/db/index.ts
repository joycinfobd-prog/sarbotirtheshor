import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// NOTE: This module must NEVER throw at import time.
// Next.js imports it during `next build` (page-data collection) on Vercel,
// where DATABASE_URL may not be set yet. Queries will simply fail at
// runtime until DATABASE_URL is configured, and data-access helpers in
// src/lib/data.ts already catch those errors and fall back to defaults.
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.warn(
    "[db] DATABASE_URL is not set — database queries will fail until it is configured. " +
      "Set it in .env (local) or Vercel → Project → Settings → Environment Variables.",
  );
}

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

function createPool(): Pool {
  const pool = new Pool({
    // Placeholder keeps `new Pool()` from throwing; real URL comes from env.
    connectionString: databaseUrl || "postgresql://127.0.0.1:5432/unconfigured",
    max: 5,
    connectionTimeoutMillis: 8000,
  });
  // Idle-client errors must never crash the process.
  pool.on("error", () => {});
  return pool;
}

export const pool: Pool =
  globalForDb.__arenaNextJsPostgresqlPool ?? createPool();

globalForDb.__arenaNextJsPostgresqlPool = pool;

export const db = drizzle(pool);
