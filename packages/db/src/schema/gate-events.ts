import { pgTable, uuid, text, jsonb, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { gates } from "./gates";

export const eventTypeEnum = pgEnum("event_type", ["impression", "dismiss", "conversion"]);

export const gateEvents = pgTable("gate_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  gateId: uuid("gate_id").notNull().references(() => gates.id, { onDelete: "cascade" }),
  eventType: eventTypeEnum("event_type").notNull(),
  sessionId: text("session_id").notNull(),
  endUserId: text("end_user_id"),
  source: text("source"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type GateEvent = typeof gateEvents.$inferSelect;
export type NewGateEvent = typeof gateEvents.$inferInsert;
