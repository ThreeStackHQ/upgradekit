import { pgTable, uuid, text, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./users";

export const triggerTypeEnum = pgEnum("trigger_type", ["feature", "page", "usage"]);

export const gates = pgTable("gates", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  triggerType: triggerTypeEnum("trigger_type").notNull(),
  triggerValue: text("trigger_value").notNull(),
  upgradeUrl: text("upgrade_url").notNull(),
  headline: text("headline").notNull(),
  description: text("description"),
  ctaText: text("cta_text").notNull().default("Upgrade Now"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Gate = typeof gates.$inferSelect;
export type NewGate = typeof gates.$inferInsert;
