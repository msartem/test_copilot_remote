#!/usr/bin/env node

/**
 * Fetches Azure status data from public feeds/APIs and writes
 * static JSON files into public/data/ for the SPA to consume.
 *
 * Run locally:  node scripts/fetch-azure-data.mjs
 * Run in CI:    called by .github/workflows/fetch-data.yml
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "public", "data");

mkdirSync(DATA_DIR, { recursive: true });

const AZURE_STATUS_FEED = "https://azure.status.microsoft/en-us/status/feed/";
const AZURE_BLOG_FEED = "https://azure.microsoft.com/en-us/blog/feed/";
const AZURE_HISTORY_URL = "https://azure.status.microsoft/en-us/statushistoryapi/";

async function fetchText(url, timeoutMs = 30000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

// ── RSS/Atom Parser ────────────────────────────────────────────────

function parseRss(xml) {
  // Lightweight regex-based parser (no DOM in Node without extra deps)
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    items.push({
      title: extractTag(block, "title"),
      description: extractTag(block, "description"),
      link: extractTag(block, "link"),
      pubDate: extractTag(block, "pubDate") || extractTag(block, "dc:date"),
      guid: extractTag(block, "guid") || extractTag(block, "link"),
      categories: extractAllTags(block, "category"),
    });
  }

  // Try Atom if no RSS items
  if (items.length === 0) {
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/gi;
    while ((match = entryRegex.exec(xml)) !== null) {
      const block = match[1];
      const linkMatch = block.match(/<link[^>]+href="([^"]+)"/);
      items.push({
        title: extractTag(block, "title"),
        description: extractTag(block, "summary") || extractTag(block, "content"),
        link: linkMatch ? linkMatch[1] : "",
        pubDate: extractTag(block, "published") || extractTag(block, "updated"),
        guid: extractTag(block, "id") || (linkMatch ? linkMatch[1] : ""),
        categories: extractAllAttributes(block, "category", "term"),
      });
    }
  }

  return items;
}

function extractTag(block, tag) {
  const cdataRe = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`, "i");
  const cdataMatch = block.match(cdataRe);
  if (cdataMatch) return cdataMatch[1].trim();

  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i");
  const m = block.match(re);
  return m ? m[1].trim() : "";
}

function extractAllTags(block, tag) {
  const results = [];
  const re = new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${tag}>`, "gi");
  let m;
  while ((m = re.exec(block)) !== null) {
    const val = m[1].trim();
    if (val) results.push(val);
  }
  return results;
}

function extractAllAttributes(block, tag, attr) {
  const results = [];
  const re = new RegExp(`<${tag}[^>]+${attr}="([^"]+)"`, "gi");
  let m;
  while ((m = re.exec(block)) !== null) {
    results.push(m[1]);
  }
  return results;
}

function stripHtml(html) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

// ── Status History HTML Parser ─────────────────────────────────────

function parseHistoryHtml(html) {
  const incidents = [];

  // Step 1: Find tracking IDs in header sections only (incident-history-tracking-id class)
  const trackingIdRegex = /incident-history-tracking-id">\s*Tracking ID:\s*([A-Za-z0-9_-]+)/g;
  const seen = new Set();
  const trackingIds = [];
  let m;
  while ((m = trackingIdRegex.exec(html)) !== null) {
    const id = m[1].trim();
    if (!seen.has(id)) {
      seen.add(id);
      trackingIds.push({ id, index: m.index });
    }
  }

  for (const { id: trackingId, index: trackingIndex } of trackingIds) {
    // Step 2: Find title — look backwards from tracking ID for incident-history-title
    const searchBefore = html.substring(Math.max(0, trackingIndex - 1000), trackingIndex);
    const titleMatch = searchBefore.match(/incident-history-title">\s*([\s\S]*?)\s*<\/div>/);
    const title = titleMatch ? titleMatch[1].replace(/\s+/g, " ").trim() : "";

    // Step 3: Find date — look for hide-text span before tracking ID
    const dateMatch = searchBefore.match(/hide-text">([^<]+)</);
    const dateStr = dateMatch ? dateMatch[1].trim() : "";

    // Step 4: Extract description from collapse body
    const collapseId = `incident-history-collapse-${trackingId}`;
    const bodyStart = html.indexOf(`id="${collapseId}"`);
    let description = "";
    let link = `https://azure.status.microsoft/en-us/status/history/#${trackingId}`;

    if (bodyStart !== -1) {
      const bodySnippet = html.substring(bodyStart, bodyStart + 3000);
      const pMatch = bodySnippet.match(/<p[^>]*>([\s\S]*?)<\/p>/);
      if (pMatch) description = stripHtml(pMatch[1]).slice(0, 500);
      const linkMatch = bodySnippet.match(/href="(https:\/\/aka\.ms\/[^"]+)"/i);
      if (linkMatch) link = linkMatch[1];
    }

    if (!title) continue;

    const severity = inferSeverity(title);
    const services = extractServicesFromTitle(title);
    let parsedDate = new Date().toISOString();
    if (dateStr) {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) parsedDate = d.toISOString();
    }

    incidents.push({
      id: trackingId,
      title,
      description,
      severity,
      status: "resolved",
      startedAt: parsedDate,
      updatedAt: parsedDate,
      affectedServices: services,
      link,
    });
  }

  return incidents;
}

function inferSeverity(title) {
  const t = title.toLowerCase();
  if (t.includes("outage") || t.includes("major") || t.includes("multiple services") || t.includes("multiple regions")) return "critical";
  if (t.includes("degraded") || t.includes("degradation") || t.includes("power event")) return "warning";
  return "informational";
}

function extractServicesFromTitle(title) {
  const parts = title.split("\u2013").map((s) => s.trim()); // em-dash
  if (parts.length < 2) {
    const parts2 = title.split("–").map((s) => s.trim());
    if (parts2.length >= 2) return parts2.slice(1).flatMap((s) => s.split(",").map((x) => x.trim())).filter((s) => s.length > 0 && s.length < 80);
  }
  if (parts.length >= 2) return parts.slice(1).flatMap((s) => s.split(",").map((x) => x.trim())).filter((s) => s.length > 0 && s.length < 80);
  return [];
}

// ── Main fetch logic ───────────────────────────────────────────────

async function fetchStatusFeed() {
  console.log("Fetching Azure Status RSS feed...");
  try {
    const xml = await fetchText(AZURE_STATUS_FEED);
    const items = parseRss(xml);
    console.log(`  Got ${items.length} status feed items`);
    return items;
  } catch (err) {
    console.error(`  Failed: ${err.message}`);
    return [];
  }
}

async function fetchBlogFeed() {
  console.log("Fetching Azure Blog RSS feed...");
  try {
    const xml = await fetchText(AZURE_BLOG_FEED);
    const items = parseRss(xml);
    console.log(`  Got ${items.length} blog items`);
    return items.map((item) => ({
      id: item.guid || item.link || item.title,
      title: item.title,
      summary: stripHtml(item.description).slice(0, 300),
      publishedAt: item.pubDate,
      category: item.categories[0] || "General",
      link: item.link,
    }));
  } catch (err) {
    console.error(`  Failed: ${err.message}`);
    return [];
  }
}

async function fetchIncidentHistory() {
  console.log("Fetching Azure Status History (all time)...");
  try {
    const html = await fetchText(
      `${AZURE_HISTORY_URL}?service=all&region=all&startDate=all`,
    );
    const incidents = parseHistoryHtml(html);
    console.log(`  Got ${incidents.length} historical incidents`);
    return incidents;
  } catch (err) {
    console.error(`  Failed: ${err.message}`);
    return [];
  }
}

// ── Run ────────────────────────────────────────────────────────────

async function main() {
  console.log(`Fetching Azure data at ${new Date().toISOString()}\n`);

  const [statusFeed, blogUpdates, incidentHistory] = await Promise.all([
    fetchStatusFeed(),
    fetchBlogFeed(),
    fetchIncidentHistory(),
  ]);

  const timestamp = new Date().toISOString();

  const data = {
    fetchedAt: timestamp,
    statusFeed,
    blogUpdates,
    incidentHistory,
  };

  const outPath = join(DATA_DIR, "azure-data.json");
  writeFileSync(outPath, JSON.stringify(data, null, 2));
  console.log(`\nWrote ${outPath}`);

  // Also write a minimal last-updated marker
  writeFileSync(
    join(DATA_DIR, "last-updated.json"),
    JSON.stringify({ fetchedAt: timestamp }),
  );
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
