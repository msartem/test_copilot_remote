import { useFetch } from "@/hooks/use-fetch";
import { StaticUpdatesService } from "@/services";
import { AUTO_REFRESH_INTERVAL_MS } from "@/config/constants";

const updatesService = new StaticUpdatesService();

export function useAzureUpdates() {
  return useFetch(() => updatesService.fetchUpdates(), {
    refreshInterval: AUTO_REFRESH_INTERVAL_MS,
  });
}
