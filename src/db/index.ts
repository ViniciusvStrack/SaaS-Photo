import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool({
    connectionString: databaseUrl,
    // Optimized for serverless/edge — keep it lean
    max: 10,                      // less connections = less memory
    min: 1,                       // minimal idle connections
    idleTimeoutMillis: 10000,     // close idle fast (10s)
    connectionTimeoutMillis: 3000,// fail fast if can't connect (3s)
    maxUses: 5000,                // recycle connections
    allowExitOnIdle: true,        // allow process exit when idle
    statement_timeout: 15000,     // kill queries after 15s
    query_timeout: 15000,         // kill queries after 15s
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

export const db = drizzle(pool);
