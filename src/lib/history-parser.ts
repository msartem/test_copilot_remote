import type { Incident } from "@/types";

/**
 * Parses the HTML response from Azure Status History API
 * (azure.status.microsoft/en-us/statushistoryapi/) into Incident objects.
 */
export function parseStatusHistoryHtml(html: string): Incident[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const incidents: Incident[] = [];

  const headers = doc.querySelectorAll(".incident-history-header");

  headers.forEach((header) => {
    const titleEl = header.querySelector(".incident-history-title");
    const trackingIdEl = header.querySelector(".incident-history-tracking-id");
    const dateEl = header.querySelector(".hide-text");

    const title = titleEl?.textContent?.trim() ?? "";
    const trackingIdRaw = trackingIdEl?.textContent?.trim() ?? "";
    const trackingId = trackingIdRaw.replace("Tracking ID:", "").trim();
    const dateStr = dateEl?.textContent?.trim() ?? "";

    if (!title || !trackingId) return;

    const collapseId = `incident-history-collapse-${trackingId}`;
    const bodyEl = doc.getElementById(collapseId);
    const description = extractDescription(bodyEl);
    const severity = inferSeverityFromTitle(title);
    const affectedServices = extractServicesFromTitle(title);
    const link = extractLink(bodyEl, trackingId);

    const parsedDate = parseHistoryDate(dateStr);

    incidents.push({
      id: trackingId,
      title,
      description,
      severity,
      status: "resolved",
      startedAt: parsedDate,
      updatedAt: parsedDate,
      affectedServices,
      link,
    });
  });

  return incidents;
}

function extractDescription(bodyEl: HTMLElement | null): string {
  if (!bodyEl) return "";
  const firstP = bodyEl.querySelector("p");
  if (!firstP) return bodyEl.textContent?.trim().slice(0, 500) ?? "";
  return firstP.textContent?.trim().slice(0, 500) ?? "";
}

function inferSeverityFromTitle(title: string): Incident["severity"] {
  const text = title.toLowerCase();
  if (
    text.includes("outage") ||
    text.includes("major") ||
    text.includes("critical") ||
    text.includes("multiple services") ||
    text.includes("multiple regions")
  ) {
    return "critical";
  }
  if (
    text.includes("degraded") ||
    text.includes("degradation") ||
    text.includes("intermittent") ||
    text.includes("power event")
  ) {
    return "warning";
  }
  return "informational";
}

function extractServicesFromTitle(title: string): string[] {
  const dashParts = title.split("–").map((s) => s.trim());
  if (dashParts.length >= 2) {
    const servicePart = dashParts.slice(1).join(", ");
    return servicePart
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && s.length < 80);
  }
  return [];
}

function extractLink(
  bodyEl: HTMLElement | null,
  trackingId: string,
): string {
  if (bodyEl) {
    const linkEl = bodyEl.querySelector("a[href]");
    if (linkEl) return linkEl.getAttribute("href") ?? "";
  }
  return `https://azure.status.microsoft/en-us/status/history/#${trackingId}`;
}

function parseHistoryDate(dateStr: string): string {
  if (!dateStr) return new Date().toISOString();
  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) return new Date().toISOString();
  return parsed.toISOString();
}
