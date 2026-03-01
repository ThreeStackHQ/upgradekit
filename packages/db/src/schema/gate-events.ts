import { pgTable, uuid, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { gates } from "./gates";

export const eventTypeEnum = pgEnum("event_type", [
  "impression",
  "dismiss",
  "conversion",
]);

export const gateEvents = pgTable("gate_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  gateId: uuid("gate_id")
    .notNull()
    .references(() => gates.id, { onDelete: "cascade" }),
  userId: text("user_id"), // nullable - end-user id passed from widget
  sessionId: text("session_id").notNull(),
  eventType: eventTypeEnum("event_type").notNull(),
  source: text("source"), // nullable - cta-click | dismiss (for conversions)
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type GateEvent = typeof gateEvents.$inferSelect;
export type NewGateEvent = typeof gateEvents.$inferInsert;
