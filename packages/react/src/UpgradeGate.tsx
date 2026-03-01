"use client";
import React from "react";
import { useGate } from "./hooks";
import type { UpgradeGateProps } from "./types";

function DefaultFallback({ feature }: { feature?: { name: string; upgradeUrl?: string } }) {
  return (
    <div style={{
      padding: "24px",
      background: "#f8f9fa",
      border: "1px solid #e9ecef",
      borderRadius: "8px",
      textAlign: "center",
    }}>
      <p style={{ margin: "0 0 12px", fontWeight: 600 }}>
        {feature ? `Upgrade to unlock ${feature.name}` : "This feature requires an upgrade"}
      </p>
      {feature?.upgradeUrl && (
        <a
          href={feature.upgradeUrl}
          style={{
            display: "inline-block",
            padding: "8px 16px",
            background: "#3b82f6",
            color: "white",
            borderRadius: "6px",
            textDecoration: "none",
            fontWeight: 500,
          }}
        >
          Upgrade Now
        </a>
      )}
    </div>
  );
}

export function UpgradeGate({
  gateId,
  projectId,
  userId,
  apiUrl,
  fallback,
  children,
}: UpgradeGateProps) {
  const { isLocked, isLoading, feature } = useGate(gateId, projectId, userId, apiUrl);

  if (isLoading) return null;
  if (isLocked) return <>{fallback ?? <DefaultFallback feature={feature} />}</>;
  return <>{children}</>;
}
