import { describe, expect, it } from "vitest";
import { generateSlug } from "./slug";

describe("generateSlug", () => {
  it("produces a lowercase, hyphenated slug with a random suffix", () => {
    const slug = generateSlug("Austin", "2026-07-26", "6th & Congress");
    expect(slug).toMatch(/^austin-2026-07-26-6th-congress-[a-zA-Z0-9_-]{6}$/);
  });

  it("falls back to placeholder segments when city or location is blank", () => {
    const slug = generateSlug("", "2026-07-26", "");
    expect(slug).toMatch(/^city-2026-07-26-location-[a-zA-Z0-9_-]{6}$/);
  });

  it("strips special characters and collapses them to single hyphens", () => {
    const slug = generateSlug("St. Louis!!", "2026-07-26", "5th/Main (downtown)");
    expect(slug.startsWith("st-louis-2026-07-26-5th-main-downtown")).toBe(true);
  });
});
