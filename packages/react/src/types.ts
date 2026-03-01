import type { ReactNode } from "react";

export interface UpgradeGateProps {
  gateId: string;
  projectId: string;
  userId: string;
  apiUrl?: string;
  fallback?: ReactNode;
  children: ReactNode;
}

export interface GateStatus {
  isLocked: boolean;
  isLoading: boolean;
  feature?: {
    id: string;
    name: string;
    description?: string;
    upgradeUrl?: string;
  };
}
