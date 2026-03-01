import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Lazy singleton — evaluated on first use, not at import time.
// This allows Next.js to bundle route handlers without requiring DATABASE_URL
// at build time.
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

function getDb(): ReturnType<typeof drizzle<typeof schema>> {
  if (!_db) {
    const connectionString = process.env["DATABASE_URL"];
    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is required");
    }
    const queryClient = postgres(connectionString);
    _db = drizzle(queryClient, { schema });
  }
  return _db;
}

// Proxy so callers use `db.select()...` without changing any import sites
export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (getDb() as any)[prop];
  },
});

export type DbClient = typeof db;
