import { useFetch } from "@/hooks/use-fetch";
import { AzureUpdatesService, RssFeedFetcher } from "@/services";
import { AUTO_REFRESH_INTERVAL_MS } from "@/config/constants";

const feedFetcher = new RssFeedFetcher();
const updatesService = new AzureUpdatesService(feedFetcher);

export function useAzureUpdates() {
  return useFetch(() => updatesService.fetchUpdates(), {
    refreshInterval: AUTO_REFRESH_INTERVAL_MS,
  });
}
