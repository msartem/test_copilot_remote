import { describe, it, expect, vi } from "vitest";
import { AzureIncidentService } from "@/services/incident-service";
import type { FeedFetcher } from "@/services/interfaces";

// Mock the CORS proxy to return empty HTML (no history incidents)
vi.mock("@/lib/cors-proxy", () => ({
  fetchWithCorsProxy: vi.fn().mockResolvedValue("<div></div>"),
}));

describe("AzureIncidentService", () => {
  it("maps feed items to incidents", async () => {
    const mockFetcher: FeedFetcher = {
      fetch: vi.fn().mockResolvedValue([
        {
          title: "Azure SQL Database - Connectivity Issues",
          description: "<p>We are investigating connectivity issues affecting Azure SQL Database.</p>",
          link: "https://example.com/incident-1",
          pubDate: "2026-04-14T09:00:00Z",
          guid: "inc-1",
          categories: ["Databases"],
        },
      ]),
    };

    const service = new AzureIncidentService(mockFetcher);
    const incidents = await service.fetchIncidents();

    expect(incidents).toHaveLength(1);
    expect(incidents[0]?.title).toBe("Azure SQL Database - Connectivity Issues");
    expect(incidents[0]?.status).toBe("investigating");
    expect(incidents[0]?.link).toBe("https://example.com/incident-1");
  });

  it("returns empty array for empty feed", async () => {
    const mockFetcher: FeedFetcher = {
      fetch: vi.fn().mockResolvedValue([]),
    };

    const service = new AzureIncidentService(mockFetcher);
    const incidents = await service.fetchIncidents();

    expect(incidents).toHaveLength(0);
  });

  it("sorts incidents by date descending", async () => {
    const mockFetcher: FeedFetcher = {
      fetch: vi.fn().mockResolvedValue([
        {
          title: "Older incident",
          description: "Investigating issue",
          link: "",
          pubDate: "2026-04-13T10:00:00Z",
          guid: "inc-old",
          categories: [],
        },
        {
          title: "Newer incident",
          description: "Investigating issue",
          link: "",
          pubDate: "2026-04-14T10:00:00Z",
          guid: "inc-new",
          categories: [],
        },
      ]),
    };

    const service = new AzureIncidentService(mockFetcher);
    const incidents = await service.fetchIncidents();

    expect(incidents[0]?.title).toBe("Newer incident");
    expect(incidents[1]?.title).toBe("Older incident");
  });
});
