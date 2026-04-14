import { describe, it, expect } from "vitest";
import { formatRelativeTime, formatDateTime, stripHtml } from "@/lib/format";

describe("formatRelativeTime", () => {
  it('returns "just now" for recent timestamps', () => {
    const now = new Date().toISOString();
    expect(formatRelativeTime(now)).toBe("just now");
  });

  it("returns minutes ago for timestamps within the hour", () => {
    const date = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(formatRelativeTime(date)).toBe("5 minutes ago");
  });

  it("returns hours ago for timestamps within the day", () => {
    const date = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(date)).toBe("3 hours ago");
  });

  it("returns days ago for timestamps within the month", () => {
    const date = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(date)).toBe("2 days ago");
  });

  it("handles singular forms correctly", () => {
    const oneMinAgo = new Date(Date.now() - 60 * 1000).toISOString();
    expect(formatRelativeTime(oneMinAgo)).toBe("1 minute ago");

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(oneHourAgo)).toBe("1 hour ago");
  });
});

describe("formatDateTime", () => {
  it("formats a date string into a readable format", () => {
    const result = formatDateTime("2026-04-14T10:30:00Z");
    expect(result).toContain("Apr");
    expect(result).toContain("14");
    expect(result).toContain("2026");
  });
});

describe("stripHtml", () => {
  it("removes HTML tags from a string", () => {
    expect(stripHtml("<p>Hello <strong>world</strong></p>")).toBe(
      "Hello world",
    );
  });

  it("handles empty strings", () => {
    expect(stripHtml("")).toBe("");
  });

  it("returns plain text unchanged", () => {
    expect(stripHtml("no tags here")).toBe("no tags here");
  });
});
