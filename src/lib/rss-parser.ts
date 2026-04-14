import type { FeedItem } from "@/types";

export function parseRssFeed(xml: string): FeedItem[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "text/xml");

  const parseError = doc.querySelector("parsererror");
  if (parseError) {
    throw new Error("Failed to parse RSS feed: invalid XML");
  }

  const items = doc.querySelectorAll("item");
  if (items.length === 0) {
    const entries = doc.querySelectorAll("entry");
    if (entries.length > 0) {
      return parseAtomEntries(entries);
    }
    return [];
  }

  return parseRssItems(items);
}

function parseRssItems(items: NodeListOf<Element>): FeedItem[] {
  const result: FeedItem[] = [];

  items.forEach((item) => {
    const title = getTextContent(item, "title");
    const description =
      getTextContent(item, "description") ||
      getTextContent(item, "content\\:encoded");
    const link = getTextContent(item, "link");
    const pubDate =
      getTextContent(item, "pubDate") || getTextContent(item, "dc\\:date");
    const guid = getTextContent(item, "guid") || link || title;

    const categories: string[] = [];
    item.querySelectorAll("category").forEach((cat) => {
      const text = cat.textContent?.trim();
      if (text) categories.push(text);
    });

    result.push({ title, description, link, pubDate, categories, guid });
  });

  return result;
}

function parseAtomEntries(entries: NodeListOf<Element>): FeedItem[] {
  const result: FeedItem[] = [];

  entries.forEach((entry) => {
    const title = getTextContent(entry, "title");
    const description =
      getTextContent(entry, "summary") || getTextContent(entry, "content");
    const linkEl = entry.querySelector("link[href]");
    const link = linkEl?.getAttribute("href") ?? "";
    const pubDate =
      getTextContent(entry, "published") || getTextContent(entry, "updated");
    const guid = getTextContent(entry, "id") || link || title;

    const categories: string[] = [];
    entry.querySelectorAll("category").forEach((cat) => {
      const term = cat.getAttribute("term");
      if (term) categories.push(term);
    });

    result.push({ title, description, link, pubDate, categories, guid });
  });

  return result;
}

function getTextContent(parent: Element, selector: string): string {
  return parent.querySelector(selector)?.textContent?.trim() ?? "";
}
