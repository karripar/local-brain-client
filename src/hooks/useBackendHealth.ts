"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchHealth } from "@/src/lib/client/apiClient";
import { HealthResponse } from "@/src/lib/client/types";

export const useBackendHealth = () => {
  const [health, setHealth] = useState<HealthResponse>({ ok: false });
  const [isLoading, setIsLoading] = useState(true);

  const check = useCallback(async () => {
    setIsLoading(true);
    const response = await fetchHealth();
    setHealth(response);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadInitialHealth = async () => {
      const response = await fetchHealth();

      if (!mounted) {
        return;
      }

      setHealth(response);
      setIsLoading(false);
    };

    void loadInitialHealth();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    health,
    isLoading,
    check,
  };
};
