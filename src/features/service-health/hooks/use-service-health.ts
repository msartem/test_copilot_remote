import { useMemo } from "react";
import { useFetch } from "@/hooks/use-fetch";
import { AzureStatusService, RssFeedFetcher } from "@/services";
import { AUTO_REFRESH_INTERVAL_MS } from "@/config/constants";
import type { AzureService } from "@/types";

const feedFetcher = new RssFeedFetcher();
const statusService = new AzureStatusService(feedFetcher);

export function useServiceHealth() {
  const result = useFetch(() => statusService.fetchServices(), {
    refreshInterval: AUTO_REFRESH_INTERVAL_MS,
  });

  const categories = useMemo(() => {
    if (!result.data) return [];
    const cats = new Set(result.data.map((s) => s.category));
    return Array.from(cats).sort();
  }, [result.data]);

  const summary = useMemo(() => {
    if (!result.data) return { total: 0, healthy: 0, degraded: 0, outage: 0 };
    return {
      total: result.data.length,
      healthy: result.data.filter((s: AzureService) => s.status === "good").length,
      degraded: result.data.filter((s: AzureService) => s.status === "warning").length,
      outage: result.data.filter((s: AzureService) => s.status === "critical").length,
    };
  }, [result.data]);

  return { ...result, categories, summary };
}
