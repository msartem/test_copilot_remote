import type { AzureService, Incident, RegionHealth, AzureUpdate, TimeRange } from "@/types";
import type { StatusService, IncidentService, RegionService, UpdatesService } from "./interfaces";
import { AZURE_SERVICE_CATEGORIES, AZURE_REGIONS } from "./status-service";

// Shape of the pre-fetched static JSON produced by scripts/fetch-azure-data.mjs
interface StaticAzureData {
  fetchedAt: string;
  statusFeed: StaticFeedItem[];
  blogUpdates: StaticBlogItem[];
  incidentHistory: Incident[];
}

interface StaticFeedItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  categories: string[];
  guid: string;
}

interface StaticBlogItem {
  id: string;
  title: string;
  summary: string;
  publishedAt: string;
  category: string;
  link: string;
}

const REGION_GEOGRAPHIES: Record<string, string[]> = {
  Americas: [
    "East US", "East US 2", "West US", "West US 2", "West US 3",
    "Central US", "North Central US", "South Central US", "West Central US",
    "Canada Central", "Canada East", "Brazil South", "Brazil Southeast",
  ],
  Europe: [
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

let cachedData: StaticAzureData | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 60_000;

async function loadStaticData(): Promise<StaticAzureData> {
  if (cachedData && Date.now() - cacheTimestamp < CACHE_TTL_MS) {
    return cachedData;
  }

  const base = import.meta.env.BASE_URL ?? "/";
  const url = `${base}data/azure-data.json`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to load dashboard data (${response.status})`);
  }

  cachedData = await response.json() as StaticAzureData;
  cacheTimestamp = Date.now();
  return cachedData;
}

export function getLastFetchedAt(): string | null {
  return cachedData?.fetchedAt ?? null;
}

// -- Status Service (reads from static JSON) --

function buildDefaultServiceList(): AzureService[] {
  const services: AzureService[] = [];
  const now = new Date().toISOString();
  for (const [category, serviceNames] of Object.entries(AZURE_SERVICE_CATEGORIES)) {
    for (const name of serviceNames) {
      services.push({ name, status: "good", category, description: "No issues reported", lastUpdated: now });
    }
  }
  return services;
}

function inferServiceStatus(text: string): AzureService["status"] {
  const lower = text.toLowerCase();
  if (lower.includes("resolved") || lower.includes("mitigated") || lower.includes("recovered")) return "good";
  if (lower.includes("outage") || lower.includes("degraded") || lower.includes("major")) return "critical";
  if (lower.includes("investigating") || lower.includes("advisory") || lower.includes("intermittent")) return "warning";
  return "warning";
}

export class StaticStatusService implements StatusService {
  async fetchServices(): Promise<AzureService[]> {
    const data = await loadStaticData();
    if (data.statusFeed.length === 0) {
      return buildDefaultServiceList();
    }

    const serviceMap = new Map<string, AzureService>();
    const allServiceNames = Object.values(AZURE_SERVICE_CATEGORIES).flat();

    for (const item of data.statusFeed) {
      const status = inferServiceStatus(`${item.title} ${item.description}`);
      const matched: string[] = [];
      for (const svc of allServiceNames) {
        if (item.title.toLowerCase().includes(svc.toLowerCase()) || item.description.toLowerCase().includes(svc.toLowerCase())) {
          matched.push(svc);
        }
      }

      if (matched.length > 0) {
        for (const name of matched) {
          const existing = serviceMap.get(name);
          const category = getCategoryForService(name) ?? "General";
          if (!existing || severityRank(status) > severityRank(existing.status)) {
            serviceMap.set(name, { name, status, category, description: item.title, lastUpdated: item.pubDate });
          }
        }
      } else {
        const name = item.title.split(" - ")[0]?.trim() ?? item.title;
        if (name) {
          const category = item.categories[0] ?? "General";
          serviceMap.set(name, { name, status, category, description: item.title, lastUpdated: item.pubDate });
        }
      }
    }

    for (const svc of buildDefaultServiceList()) {
      if (!serviceMap.has(svc.name)) serviceMap.set(svc.name, svc);
    }

    return Array.from(serviceMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }
}

function getCategoryForService(name: string): string | undefined {
  for (const [cat, services] of Object.entries(AZURE_SERVICE_CATEGORIES)) {
    if (services.includes(name)) return cat;
  }
  return undefined;
}

function severityRank(status: AzureService["status"]): number {
  const ranks: Record<string, number> = { good: 0, unknown: 1, warning: 2, critical: 3 };
  return ranks[status] ?? 0;
}

// -- Incident Service (reads from static JSON) --

export class StaticIncidentService implements IncidentService {
  async fetchIncidents(range?: TimeRange): Promise<Incident[]> {
    const data = await loadStaticData();
    const cutoff = this.getCutoffDate(range ?? "6m");
    return data.incidentHistory
      .filter((i) => new Date(i.startedAt) >= cutoff)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  private getCutoffDate(range: TimeRange): Date {
    const now = new Date();
    switch (range) {
      case "6m": now.setMonth(now.getMonth() - 6); break;
      case "1y": now.setFullYear(now.getFullYear() - 1); break;
      case "2y": now.setFullYear(now.getFullYear() - 2); break;
    }
    return now;
  }
}

// -- Region Service (reads from static JSON) --

export class StaticRegionService implements RegionService {
  async fetchRegions(): Promise<RegionHealth[]> {
    const data = await loadStaticData();
    const regionIncidents = new Map<string, number>();

    for (const item of data.statusFeed) {
      const text = `${item.title} ${item.description} ${item.categories.join(" ")}`.toLowerCase();
      for (const region of AZURE_REGIONS) {
        if (text.includes(region.toLowerCase())) {
          regionIncidents.set(region, (regionIncidents.get(region) ?? 0) + 1);
        }
      }
    }

    return AZURE_REGIONS.map((region) => {
      const activeIncidents = regionIncidents.get(region) ?? 0;
      const status: AzureService["status"] = activeIncidents > 0 ? "warning" : "good";
      const geography = getGeography(region);
      return { region, geography, status, activeIncidents, services: [] };
    }).sort((a, b) => {
      const geoOrder = a.geography.localeCompare(b.geography);
      return geoOrder !== 0 ? geoOrder : a.region.localeCompare(b.region);
    });
  }
}

function getGeography(region: string): string {
  for (const [geo, regions] of Object.entries(REGION_GEOGRAPHIES)) {
    if (regions.includes(region)) return geo;
  }
  return "Other";
}

// -- Updates Service (reads from static JSON) --

export class StaticUpdatesService implements UpdatesService {
  async fetchUpdates(): Promise<AzureUpdate[]> {
    const data = await loadStaticData();
    return data.blogUpdates
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }
}
