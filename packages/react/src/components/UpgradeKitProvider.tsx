import React from "react";
import { UpgradeKitContext } from "../context";
import { useUpgradeKit } from "../hooks/useUpgradeKit";
import type { UpgradeKitConfig } from "../types";

interface UpgradeKitProviderProps {
  config: UpgradeKitConfig;
  children: React.ReactNode;
}

export function UpgradeKitProvider({
  config,
  children,
}: UpgradeKitProviderProps): React.ReactElement {
  const { gates, isLoading, isGated, trackImpression, trackConversion } =
    useUpgradeKit(config);

  return (
    <UpgradeKitContext.Provider
      value={{ config, gates, isLoading, isGated, trackImpression, trackConversion }}
    >
      {children}
    </UpgradeKitContext.Provider>
  );
}
