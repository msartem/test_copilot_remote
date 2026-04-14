import type { AzureUpdate } from "@/types";
import type { FeedFetcher, UpdatesService } from "./interfaces";
import { stripHtml } from "@/lib/format";
import { AZURE_BLOG_FEED_URL } from "@/config/constants";

export class AzureUpdatesService implements UpdatesService {
  private feedFetcher: FeedFetcher;

  constructor(feedFetcher: FeedFetcher) {
    this.feedFetcher = feedFetcher;
  }

  async fetchUpdates(): Promise<AzureUpdate[]> {
    const items = await this.feedFetcher.fetch(AZURE_BLOG_FEED_URL);

    return items
      .map((item) => ({
        id: item.guid || item.link || item.title,
        title: item.title,
        summary: stripHtml(item.description).slice(0, 300),
        publishedAt: item.pubDate,
        category: item.categories[0] ?? "General",
        link: item.link,
      }))
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() -
          new Date(a.publishedAt).getTime(),
      );
  }
}
