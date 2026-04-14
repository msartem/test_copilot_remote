import { useFetch } from "@/hooks/use-fetch";
import { AzureIncidentService, RssFeedFetcher } from "@/services";
import { AUTO_REFRESH_INTERVAL_MS } from "@/config/constants";

const feedFetcher = new RssFeedFetcher();
const incidentService = new AzureIncidentService(feedFetcher);

export function useIncidents() {
  return useFetch(() => incidentService.fetchIncidents(), {
    refreshInterval: AUTO_REFRESH_INTERVAL_MS,
  });
}
