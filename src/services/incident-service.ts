import type { FeedItem, Incident } from "@/types";
import type { FeedFetcher, IncidentService } from "./interfaces";
import { stripHtml } from "@/lib/format";

export class AzureIncidentService implements IncidentService {
  private feedFetcher: FeedFetcher;

  constructor(feedFetcher: FeedFetcher) {
    this.feedFetcher = feedFetcher;
  }

  async fetchIncidents(): Promise<Incident[]> {
    const items = await this.feedFetcher.fetch(
      "https://azure.status.microsoft/en-us/status/feed/",
    );

    return items
      .map((item) => this.mapToIncident(item))
      .filter((incident): incident is Incident => incident !== null)
      .sort(
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
