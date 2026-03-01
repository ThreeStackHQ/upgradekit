import React, { useEffect } from "react";
import { useUpgradeKitContext } from "../context";

interface UpgradeGateProps {
  /** The ID of the gate to check */
  gateId: string;
  /** Shown when the gate is active and user is on free plan */
  fallback: React.ReactNode;
  /** Shown when gate is not active or user is on a paid plan */
  children: React.ReactNode;
}

/**
 * UpgradeGate wraps content that should be hidden (or replaced with an upgrade
 * prompt) for free-plan users when the named gate is active.
 *
 * It automatically tracks an impression whenever the gate is shown.
 */
export function UpgradeGate({
  gateId,
  fallback,
  children,
}: UpgradeGateProps): React.ReactElement {
  const { isGated, trackImpression } = useUpgradeKitContext();
  const gated = isGated(gateId);

  // Track impression whenever gate blocks the feature
  useEffect(() => {
    if (gated) {
      trackImpression(gateId);
    }
  }, [gated, gateId, trackImpression]);

  return <>{gated ? fallback : children}</>;
}
