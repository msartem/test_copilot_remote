import { describe, it, expect, vi, beforeEach } from "vitest";
import { AzureStatusService } from "@/services/status-service";
import type { FeedFetcher } from "@/services/interfaces";
import type { FeedItem } from "@/types";

function createMockFetcher(items: FeedItem[]): FeedFetcher {
  return {
    fetch: vi.fn().mockResolvedValue(items),
  };
}

describe("AzureStatusService", () => {
  let mockFetcher: FeedFetcher;

  beforeEach(() => {
    mockFetcher = createMockFetcher([]);
  });

  it("returns default service list when feed is empty", async () => {
    const service = new AzureStatusService(mockFetcher);
    const result = await service.fetchServices();

    expect(result.length).toBeGreaterThan(0);
    expect(result.every((s) => s.status === "good")).toBe(true);
  });

  it("maps feed items to services with correct status", async () => {
    mockFetcher = createMockFetcher([
      {
        title: "Virtual Machines - Investigating connectivity",
        description: "We are investigating intermittent connectivity issues with Virtual Machines",
        link: "https://example.com",
        pubDate: "2026-04-14T10:00:00Z",
        guid: "item-1",
        categories: ["Compute"],
      },
    ]);

    const service = new AzureStatusService(mockFetcher);
    const result = await service.fetchServices();

    const vm = result.find((s) => s.name === "Virtual Machines");
    expect(vm).toBeDefined();
    expect(vm?.status).toBe("warning");
  });

  it("marks services as critical for outage reports", async () => {
    mockFetcher = createMockFetcher([
      {
        title: "Cosmos DB - Major Outage",
        description: "Cosmos DB is experiencing a major outage in multiple regions",
        link: "https://example.com",
        pubDate: "2026-04-14T10:00:00Z",
        guid: "item-2",
        categories: ["Databases"],
      },
    ]);

    const service = new AzureStatusService(mockFetcher);
    const result = await service.fetchServices();

    const cosmosDb = result.find((s) => s.name === "Cosmos DB");
    expect(cosmosDb).toBeDefined();
    expect(cosmosDb?.status).toBe("critical");
  });
});
