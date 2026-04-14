import type { FeedItem, AzureService, Incident, RegionHealth, AzureUpdate, TimeRange } from "@/types";

export interface StatusService {
  fetchServices(): Promise<AzureService[]>;
}

export interface IncidentService {
  fetchIncidents(range?: TimeRange): Promise<Incident[]>;
}

export interface RegionService {
  fetchRegions(): Promise<RegionHealth[]>;
}

export interface UpdatesService {
  fetchUpdates(): Promise<AzureUpdate[]>;
}

export interface FeedFetcher {
  fetch(url: string): Promise<FeedItem[]>;
}
