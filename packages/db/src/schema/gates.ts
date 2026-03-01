import { pgTable, uuid, text, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./users";

export const triggerTypeEnum = pgEnum("trigger_type", [
  "button-intercept",
  "feature-hint",
  "auto-on-load",
]);

export const dismissBehaviorEnum = pgEnum("dismiss_behavior", [
  "allow",
  "force",
]);

export const gates = pgTable("gates", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  triggerType: triggerTypeEnum("trigger_type").notNull().default("button-intercept"),
  headline: text("headline").notNull(),
  bodyText: text("body_text").notNull().default(""),
  ctaText: text("cta_text").notNull().default("Upgrade Now"),
  upgradeUrl: text("upgrade_url").notNull(),
  dismissBehavior: dismissBehaviorEnum("dismiss_behavior").notNull().default("allow"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Gate = typeof gates.$inferSelect;
export type NewGate = typeof gates.$inferInsert;
