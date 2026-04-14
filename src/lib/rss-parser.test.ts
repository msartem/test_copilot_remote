import { describe, it, expect } from "vitest";
import { parseRssFeed } from "@/lib/rss-parser";

const SAMPLE_RSS = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Azure Status</title>
    <item>
      <title>Virtual Machines - Degraded Performance</title>
      <description>Some users may experience degraded performance with Virtual Machines in East US.</description>
      <link>https://azure.status.microsoft/en-us/status</link>
      <pubDate>Mon, 14 Apr 2026 10:00:00 GMT</pubDate>
      <guid>item-001</guid>
      <category>Compute</category>
      <category>Virtual Machines</category>
    </item>
    <item>
      <title>Azure SQL Database - Service Restored</title>
      <description>The issue affecting Azure SQL Database has been resolved.</description>
      <link>https://azure.status.microsoft/en-us/status</link>
      <pubDate>Mon, 14 Apr 2026 09:00:00 GMT</pubDate>
      <guid>item-002</guid>
      <category>Databases</category>
    </item>
  </channel>
</rss>`;

const SAMPLE_ATOM = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Azure Updates</title>
  <entry>
    <title>New VM sizes available</title>
    <summary>We are introducing new VM sizes for compute-intensive workloads.</summary>
    <link href="https://azure.microsoft.com/updates/new-vm-sizes" />
    <published>2026-04-14T08:00:00Z</published>
    <id>update-001</id>
    <category term="Compute" />
  </entry>
</feed>`;

describe("parseRssFeed", () => {
  it("parses RSS 2.0 feed items correctly", () => {
    const items = parseRssFeed(SAMPLE_RSS);

    expect(items).toHaveLength(2);

    expect(items[0]).toEqual({
      title: "Virtual Machines - Degraded Performance",
      description:
        "Some users may experience degraded performance with Virtual Machines in East US.",
      link: "https://azure.status.microsoft/en-us/status",
      pubDate: "Mon, 14 Apr 2026 10:00:00 GMT",
      guid: "item-001",
      categories: ["Compute", "Virtual Machines"],
    });

    expect(items[1]?.title).toBe("Azure SQL Database - Service Restored");
    expect(items[1]?.categories).toEqual(["Databases"]);
  });

  it("parses Atom feed entries correctly", () => {
    const items = parseRssFeed(SAMPLE_ATOM);

    expect(items).toHaveLength(1);

    expect(items[0]).toEqual({
      title: "New VM sizes available",
      description:
        "We are introducing new VM sizes for compute-intensive workloads.",
      link: "https://azure.microsoft.com/updates/new-vm-sizes",
      pubDate: "2026-04-14T08:00:00Z",
      guid: "update-001",
      categories: ["Compute"],
    });
  });

  it("returns empty array for empty feed", () => {
    const xml = `<?xml version="1.0"?><rss version="2.0"><channel><title>Empty</title></channel></rss>`;
    const items = parseRssFeed(xml);
    expect(items).toHaveLength(0);
  });

  it("throws on invalid XML", () => {
    expect(() => parseRssFeed("not xml at all <><>")).toThrow(
      "Failed to parse RSS feed",
    );
  });
});
