import { pgTable, uuid, text, jsonb, timestamp } from "drizzle-orm/pg-core";
import { gates } from "./gates";

export const gateImpressions = pgTable("gate_impressions", {
  id: uuid("id").primaryKey().defaultRandom(),
  gateId: uuid("gate_id").notNull().references(() => gates.id, { onDelete: "cascade" }),
  projectId: text("project_id").notNull(),
  endUserId: text("end_user_id"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const gateConversions = pgTable("gate_conversions", {
  id: uuid("id").primaryKey().defaultRandom(),
  gateId: uuid("gate_id").notNull().references(() => gates.id, { onDelete: "cascade" }),
  projectId: text("project_id").notNull(),
  endUserId: text("end_user_id"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type GateImpression = typeof gateImpressions.$inferSelect;
export type NewGateImpression = typeof gateImpressions.$inferInsert;
export type GateConversion = typeof gateConversions.$inferSelect;
export type NewGateConversion = typeof gateConversions.$inferInsert;
