import type { FeedItem, Incident, TimeRange } from "@/types";
import type { FeedFetcher, IncidentService } from "./interfaces";
import { stripHtml } from "@/lib/format";
import { fetchWithCorsProxy } from "@/lib/cors-proxy";
import { parseStatusHistoryHtml } from "@/lib/history-parser";
import {
  AZURE_STATUS_FEED_URL,
  AZURE_STATUS_HISTORY_URL,
} from "@/config/constants";

export type { TimeRange } from "@/types";

function getStartDate(range: TimeRange): string {
  const now = new Date();
  switch (range) {
    case "6m":
      now.setMonth(now.getMonth() - 6);
      break;
    case "1y":
      now.setFullYear(now.getFullYear() - 1);
      break;
    case "2y":
      now.setFullYear(now.getFullYear() - 2);
      break;
  }
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

export class AzureIncidentService implements IncidentService {
  private feedFetcher: FeedFetcher;

  constructor(feedFetcher: FeedFetcher) {
    this.feedFetcher = feedFetcher;
  }

  async fetchIncidents(range?: TimeRange): Promise<Incident[]> {
    const [rssIncidents, historyIncidents] = await Promise.allSettled([
      this.fetchFromRss(),
      this.fetchFromHistory(range ?? "6m"),
    ]);

    const rss =
      rssIncidents.status === "fulfilled" ? rssIncidents.value : [];
    const history =
      historyIncidents.status === "fulfilled"
        ? historyIncidents.value
        : [];

    return this.mergeAndDeduplicate(rss, history);
  }

  private async fetchFromRss(): Promise<Incident[]> {
    const items = await this.feedFetcher.fetch(AZURE_STATUS_FEED_URL);
    return items
      .map((item) => this.mapToIncident(item))
      .filter((incident): incident is Incident => incident !== null);
  }

  private async fetchFromHistory(range: TimeRange): Promise<Incident[]> {
    const startDate = getStartDate(range);
    const url = `${AZURE_STATUS_HISTORY_URL}?service=all&region=all&startDate=${startDate}`;

    const html = await fetchWithCorsProxy(url);
    return parseStatusHistoryHtml(html);
  }

  private mergeAndDeduplicate(
    rss: Incident[],
    history: Incident[],
  ): Incident[] {
    const seen = new Set<string>();
    const merged: Incident[] = [];

    // RSS incidents take priority (they have live status)
    for (const incident of rss) {
      seen.add(incident.id);
      merged.push(incident);
    }

    for (const incident of history) {
      if (!seen.has(incident.id)) {
        seen.add(incident.id);
        merged.push(incident);
      }
    }

    return merged.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  }

  private mapToIncident(item: FeedItem): Incident | null {
    if (!item.title || !item.pubDate) return null;

    const severity = this.inferSeverity(item);
    const status = this.inferIncidentStatus(item);
    const affectedServices = this.extractServices(item);

    return {
      id: item.guid || item.link || item.title,
      title: item.title,
      description: stripHtml(item.description),
      severity,
      status,
      startedAt: item.pubDate,
      updatedAt: item.pubDate,
      affectedServices,
      link: item.link,
    };
  }

  private inferSeverity(item: FeedItem): Incident["severity"] {
    const text = `${item.title} ${item.description}`.toLowerCase();
    if (text.includes("outage") || text.includes("major") || text.includes("critical")) {
      return "critical";
    }
    if (text.includes("degraded") || text.includes("intermittent") || text.includes("advisory")) {
      return "warning";
    }
    return "informational";
  }

  private inferIncidentStatus(item: FeedItem): Incident["status"] {
    const text = `${item.title} ${item.description}`.toLowerCase();
    if (text.includes("resolved") || text.includes("mitigated") || text.includes("recovered")) {
      return "resolved";
    }
    if (text.includes("investigating") || text.includes("identified")) {
      return "investigating";
    }
    return "active";
  }

  private extractServices(item: FeedItem): string[] {
    const services: string[] = [];
    for (const cat of item.categories) {
      if (cat && cat.trim().length > 0) {
        services.push(cat.trim());
      }
    }
    if (services.length === 0 && item.title) {
      const titlePart = item.title.split(" - ")[0]?.trim();
      if (titlePart) services.push(titlePart);
    }
    return services;
  }
}
