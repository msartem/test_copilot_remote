import { useFetch } from "@/hooks/use-fetch";
import { AzureRegionService, RssFeedFetcher } from "@/services";
import { AUTO_REFRESH_INTERVAL_MS } from "@/config/constants";

const feedFetcher = new RssFeedFetcher();
const regionService = new AzureRegionService(feedFetcher);

export function useRegionStatus() {
  return useFetch(() => regionService.fetchRegions(), {
    refreshInterval: AUTO_REFRESH_INTERVAL_MS,
  });
}
