import { useCallback } from "react";
import { useFetch } from "@/hooks/use-fetch";
import { AzureIncidentService, RssFeedFetcher } from "@/services";
import { AUTO_REFRESH_INTERVAL_MS } from "@/config/constants";
import type { TimeRange } from "@/types";

const feedFetcher = new RssFeedFetcher();
const incidentService = new AzureIncidentService(feedFetcher);

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
