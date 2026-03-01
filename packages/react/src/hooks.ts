"use client";
import { useState, useEffect } from "react";
import type { GateStatus } from "./types";

export function useGate(gateId: string, projectId: string, userId: string, apiUrl?: string): GateStatus {
  const [status, setStatus] = useState<GateStatus>({ isLocked: false, isLoading: true });

  useEffect(() => {
    if (!gateId || !projectId || !userId) {
      setStatus({ isLocked: false, isLoading: false });
      return;
    }

    const baseUrl = apiUrl || "https://api-upgradekit.threestack.io";

    fetch(`${baseUrl}/api/gates/${gateId}/check?userId=${encodeURIComponent(userId)}`, {
      headers: { "x-project-id": projectId },
    })
      .then((res) => res.json())
      .then((data) => {
        setStatus({
          isLocked: data.locked ?? false,
          isLoading: false,
          feature: data.feature,
        });
      })
      .catch(() => {
        setStatus({ isLocked: false, isLoading: false });
      });
  }, [gateId, projectId, userId, apiUrl]);

  return status;
}
