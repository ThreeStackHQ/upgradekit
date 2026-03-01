export interface GateConfig {
  id: string;
  name: string;
  triggerType: "button-intercept" | "feature-hint" | "auto-on-load";
  headline: string;
  bodyText: string;
  ctaText: string;
  upgradeUrl: string;
  dismissBehavior: "allow" | "force";
  isActive: boolean;
}

export interface UpgradeKitConfig {
  apiUrl: string;
  apiKey: string;
  userId?: string;
  plan: "free" | "indie" | "pro";
}

export interface UpgradeKitContextValue {
  config: UpgradeKitConfig;
  gates: Record<string, GateConfig>;
  isLoading: boolean;
  isGated: (gateId: string) => boolean;
  trackImpression: (gateId: string) => void;
  trackConversion: (gateId: string) => void;
}
