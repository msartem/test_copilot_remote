import { useFetch } from "@/hooks/use-fetch";
import { StaticRegionService } from "@/services";
import { AUTO_REFRESH_INTERVAL_MS } from "@/config/constants";

const regionService = new StaticRegionService();

export function useRegionStatus() {
  return useFetch(() => regionService.fetchRegions(), {
    refreshInterval: AUTO_REFRESH_INTERVAL_MS,
  });
}
