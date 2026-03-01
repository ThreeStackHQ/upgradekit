import React, { createContext, useContext } from "react";
import type { UpgradeKitContextValue } from "./types";

export const UpgradeKitContext = createContext<UpgradeKitContextValue | null>(null);

export function useUpgradeKitContext(): UpgradeKitContextValue {
  const ctx = useContext(UpgradeKitContext);
  if (!ctx) {
    throw new Error(
      "useUpgradeKitContext must be used within an UpgradeKitProvider"
    );
  }
  return ctx;
}
