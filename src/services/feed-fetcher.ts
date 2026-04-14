import type { FeedItem } from "@/types";
import type { FeedFetcher } from "./interfaces";
import { fetchWithCorsProxy } from "@/lib/cors-proxy";
import { parseRssFeed } from "@/lib/rss-parser";

export class RssFeedFetcher implements FeedFetcher {
  private cache = new Map<string, { data: FeedItem[]; timestamp: number }>();
  private cacheTtlMs: number;

  constructor(cacheTtlMs = 60_000) {
    this.cacheTtlMs = cacheTtlMs;
  }

  async fetch(url: string): Promise<FeedItem[]> {
    const cached = this.cache.get(url);
    if (cached && Date.now() - cached.timestamp < this.cacheTtlMs) {
      return cached.data;
    }

    const xml = await fetchWithCorsProxy(url);
    const items = parseRssFeed(xml);
    this.cache.set(url, { data: items, timestamp: Date.now() });
    return items;
  }

  clearCache(): void {
    this.cache.clear();
  }
}
