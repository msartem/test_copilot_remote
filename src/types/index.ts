export type ServiceStatus = "good" | "warning" | "critical" | "unknown";

export interface AzureService {
  name: string;
  status: ServiceStatus;
  category: string;
  description: string;
  lastUpdated: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "warning" | "informational";
  status: "active" | "resolved" | "investigating";
  startedAt: string;
  updatedAt: string;
  affectedServices: string[];
  link: string;
}

export interface RegionHealth {
  region: string;
  geography: string;
  status: ServiceStatus;
  activeIncidents: number;
  services: AzureService[];
}

export interface AzureUpdate {
  id: string;
  title: string;
  summary: string;
  publishedAt: string;
  category: string;
  link: string;
}

export interface FeedItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  categories: string[];
  guid: string;
}

export type Theme = "light" | "dark";

export type TimeRange = "6m" | "1y" | "2y";

export interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}
