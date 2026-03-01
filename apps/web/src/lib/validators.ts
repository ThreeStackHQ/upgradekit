import { z } from "zod";

export const createGateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  trigger_type: z.enum(["button-intercept", "feature-hint", "auto-on-load"]),
  headline: z.string().min(1, "Headline is required").max(200),
  body: z.string().max(500).default(""),
  cta_text: z.string().min(1, "CTA text is required").max(100).default("Upgrade Now"),
  upgrade_url: z.string().url("Must be a valid URL"),
  dismiss_behavior: z.enum(["allow", "force"]).default("allow"),
});

export const updateGateSchema = createGateSchema.partial();

export const trackEventSchema = z.object({
  gate_id: z.string().uuid("Invalid gate ID"),
  user_id: z.string().optional(),
  session_id: z.string().min(1, "Session ID is required"),
  type: z.enum(["impression", "dismiss"]),
});

export const convertEventSchema = z.object({
  gate_id: z.string().uuid("Invalid gate ID"),
  user_id: z.string().optional(),
  session_id: z.string().min(1, "Session ID is required"),
  source: z.enum(["cta-click", "dismiss"]),
});

export type CreateGateInput = z.infer<typeof createGateSchema>;
export type UpdateGateInput = z.infer<typeof updateGateSchema>;
export type TrackEventInput = z.infer<typeof trackEventSchema>;
export type ConvertEventInput = z.infer<typeof convertEventSchema>;
