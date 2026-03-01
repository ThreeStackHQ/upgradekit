import { useState, useEffect, useCallback, useRef } from "react";
import type { GateConfig, UpgradeKitConfig } from "../types";

interface UseUpgradeKitReturn {
  gates: Record<string, GateConfig>;
  isLoading: boolean;
  isGated: (gateId: string) => boolean;
  trackImpression: (gateId: string) => void;
  trackConversion: (gateId: string) => void;
}

// Module-level cache: apiKey -> { gates, fetchedAt }
const gateCache: Map<string, { gates: Record<string, GateConfig>; fetchedAt: number }> = new Map();
const CACHE_TTL_MS = 60_000; // 1 minute

function mapApiGate(g: Record<string, unknown>): GateConfig {
  return {
    id: String(g["id"] ?? ""),
    name: String(g["name"] ?? ""),
    triggerType: (g["trigger_type"] ?? g["triggerType"] ?? "button-intercept") as GateConfig["triggerType"],
    headline: String(g["headline"] ?? ""),
    bodyText: String(g["body_text"] ?? g["bodyText"] ?? ""),
    ctaText: String(g["cta_text"] ?? g["ctaText"] ?? "Upgrade Now"),
    upgradeUrl: String(g["upgrade_url"] ?? g["upgradeUrl"] ?? ""),
    dismissBehavior: (g["dismiss_behavior"] ?? g["dismissBehavior"] ?? "allow") as GateConfig["dismissBehavior"],
    isActive: Boolean(g["is_active"] ?? g["isActive"] ?? true),
  };
}

export function useUpgradeKit(config: UpgradeKitConfig): UseUpgradeKitReturn {
  const { apiUrl, apiKey, userId, plan } = config;
  const [gates, setGates] = useState<Record<string, GateConfig>>({});
  const [isLoading, setIsLoading] = useState(true);
  const sessionId = useRef<string>(Math.random().toString(36).slice(2));

  useEffect(() => {
    let cancelled = false;

    async function fetchGates(): Promise<void> {
      // Check cache
      const cached = gateCache.get(apiKey);
      if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
        if (!cancelled) {
          setGates(cached.gates);
          setIsLoading(false);
        }
        return;
      }

      try {
        const res = await fetch(`${apiUrl}/api/public/gates`, {
          headers: { "x-api-key": apiKey },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as { data?: unknown[] };
        const list: Record<string, GateConfig> = {};
        const raw = Array.isArray(json.data) ? json.data : [];
        for (const g of raw) {
          const mapped = mapApiGate(g as Record<string, unknown>);
          list[mapped.id] = mapped;
        }
        gateCache.set(apiKey, { gates: list, fetchedAt: Date.now() });
        if (!cancelled) {
          setGates(list);
          setIsLoading(false);
        }
      } catch (err) {
        console.warn("[UpgradeKit] Failed to fetch gates:", err);
        if (!cancelled) setIsLoading(false);
      }
    }

    void fetchGates();
    return () => { cancelled = true; };
  }, [apiUrl, apiKey]);

  const isGated = useCallback(
    (gateId: string): boolean => {
      const gate = gates[gateId];
      if (!gate) return false;
      if (!gate.isActive) return false;
      // Paid plans are never gated
      if (plan === "indie" || plan === "pro") return false;
      return true;
    },
    [gates, plan]
  );

  const trackImpression = useCallback(
    (gateId: string): void => {
      void fetch(`${apiUrl}/api/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": apiKey },
        body: JSON.stringify({
          gate_id: gateId,
          user_id: userId,
          session_id: sessionId.current,
          type: "impression",
        }),
      }).catch((err) => console.warn("[UpgradeKit] trackImpression failed:", err));
    },
    [apiUrl, apiKey, userId]
  );

  const trackConversion = useCallback(
    (gateId: string): void => {
      void fetch(`${apiUrl}/api/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": apiKey },
        body: JSON.stringify({
          gate_id: gateId,
          user_id: userId,
          session_id: sessionId.current,
          source: "cta-click",
        }),
      }).catch((err) => console.warn("[UpgradeKit] trackConversion failed:", err));
    },
    [apiUrl, apiKey, userId]
  );

  return { gates, isLoading, isGated, trackImpression, trackConversion };
}
