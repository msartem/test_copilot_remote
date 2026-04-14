import { useCallback } from "react";
import { useFetch } from "@/hooks/use-fetch";
import { StaticIncidentService } from "@/services";
import { AUTO_REFRESH_INTERVAL_MS } from "@/config/constants";
import type { TimeRange } from "@/types";

const incidentService = new StaticIncidentService();

export function useIncidents(range: TimeRange = "6m") {
  const fetcher = useCallback(
    () => incidentService.fetchIncidents(range),
    [range],
  );

  return useFetch(fetcher, {
    refreshInterval: AUTO_REFRESH_INTERVAL_MS,
    depsKey: range,
  });
}
