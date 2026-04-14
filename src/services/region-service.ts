import type { FeedItem, RegionHealth, ServiceStatus } from "@/types";
import type { FeedFetcher, RegionService } from "./interfaces";
import { AZURE_REGIONS } from "./status-service";

const REGION_GEOGRAPHIES: Record<string, string[]> = {
  "Americas": [
    "East US", "East US 2", "West US", "West US 2", "West US 3",
    "Central US", "North Central US", "South Central US", "West Central US",
    "Canada Central", "Canada East", "Brazil South", "Brazil Southeast",
  ],
  "Europe": [
    "North Europe", "West Europe", "UK South", "UK West",
    "France Central", "France South",
    "Germany West Central", "Germany North",
    "Switzerland North", "Switzerland West",
    "Norway East", "Norway West", "Sweden Central",
    "Poland Central", "Italy North", "Spain Central",
  ],
  "Asia Pacific": [
    "East Asia", "Southeast Asia",
    "Japan East", "Japan West",
    "Australia East", "Australia Southeast", "Australia Central",
    "Central India", "South India", "West India",
    "Korea Central", "Korea South",
  ],
  "Middle East & Africa": [
    "South Africa North", "South Africa West",
    "UAE North", "UAE Central",
    "Qatar Central", "Israel Central",
  ],
};

export class AzureRegionService implements RegionService {
  private feedFetcher: FeedFetcher;

  constructor(feedFetcher: FeedFetcher) {
    this.feedFetcher = feedFetcher;
  }

  async fetchRegions(): Promise<RegionHealth[]> {
    const items = await this.feedFetcher.fetch(
      "https://azure.status.microsoft/en-us/status/feed/",
    );

    const regionIncidents = this.mapIncidentsToRegions(items);

    return AZURE_REGIONS.map((region) => {
      const incidents = regionIncidents.get(region) ?? [];
      const activeIncidents = incidents.length;
      const status = this.computeRegionStatus(incidents);
      const geography = this.getGeography(region);

      return {
        region,
        geography,
        status,
        activeIncidents,
        services: [],
      };
    }).sort((a, b) => {
      const geoOrder = a.geography.localeCompare(b.geography);
      if (geoOrder !== 0) return geoOrder;
      return a.region.localeCompare(b.region);
    });
  }

  private mapIncidentsToRegions(items: FeedItem[]): Map<string, FeedItem[]> {
    const regionMap = new Map<string, FeedItem[]>();

    for (const item of items) {
      const text = `${item.title} ${item.description} ${item.categories.join(" ")}`.toLowerCase();
      for (const region of AZURE_REGIONS) {
        if (text.includes(region.toLowerCase())) {
          const list = regionMap.get(region) ?? [];
          list.push(item);
          regionMap.set(region, list);
        }
      }
    }

    return regionMap;
  }

  private computeRegionStatus(incidents: FeedItem[]): ServiceStatus {
    if (incidents.length === 0) return "good";

    for (const item of incidents) {
      const text = `${item.title} ${item.description}`.toLowerCase();
      if (text.includes("outage") || text.includes("major")) return "critical";
    }

    return "warning";
  }

  private getGeography(region: string): string {
    for (const [geo, regions] of Object.entries(REGION_GEOGRAPHIES)) {
      if (regions.includes(region)) return geo;
    }
    return "Other";
  }
}
