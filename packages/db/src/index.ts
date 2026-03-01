export * from "./schema";
export { db } from "./client";
export type { DbClient } from "./client";

// Re-export drizzle helpers for consumers
export { eq, and, or, not, sql, desc, asc, inArray, isNull, isNotNull, count, gte, lte } from "drizzle-orm";
