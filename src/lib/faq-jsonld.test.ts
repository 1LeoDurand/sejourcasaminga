import { describe, it, expect } from "vitest";
import { extractFaqPairs, faqJsonLdFromHtml } from "@/lib/faq-jsonld";
import { readingTimeMinutes } from "@/lib/reading-time";

const WITH_FAQ = `
  <h2>Introduction</h2>
  <p>Du contenu d'intro.</p>
  <h2>Questions fréquentes</h2>
  <h3>Quel statut choisir ?</h3>
  <p>Cela dépend de ton projet.</p>
  <p>Deux familles existent.</p>
  <h3>Peut-on sortir facilement ?</h3>
  <ul><li>Oui, sous conditions.</li></ul>
  <h2>Sources</h2>
  <p>loi ALUR</p>
`;

const NO_FAQ = `<h2>Présentation</h2><p>Texte sans FAQ.</p>`;

describe("extractFaqPairs", () => {
  it("collects question/answer pairs from the FAQ section", () => {
    const pairs = extractFaqPairs(WITH_FAQ);
    expect(pairs).toHaveLength(2);
    expect(pairs[0].question).toBe("Quel statut choisir ?");
    expect(pairs[0].answer).toContain("Cela dépend de ton projet.");
    expect(pairs[0].answer).toContain("Deux familles existent.");
    expect(pairs[1].question).toBe("Peut-on sortir facilement ?");
    expect(pairs[1].answer).toContain("Oui, sous conditions.");
  });

  it("does not bleed content past the next <h2>", () => {
    const pairs = extractFaqPairs(WITH_FAQ);
    expect(pairs[1].answer).not.toContain("loi ALUR");
  });

  it("returns [] when there is no FAQ section", () => {
    expect(extractFaqPairs(NO_FAQ)).toEqual([]);
    expect(extractFaqPairs("")).toEqual([]);
    expect(extractFaqPairs(null)).toEqual([]);
  });

  it("matches the heading case/accent-insensitively", () => {
    expect(extractFaqPairs(`<h2>QUESTIONS FREQUENTES</h2><h3>Q</h3><p>A</p>`)).toHaveLength(1);
  });
});

describe("faqJsonLdFromHtml", () => {
  it("builds a FAQPage with one Question entry per pair", () => {
    const ld = faqJsonLdFromHtml(WITH_FAQ) as Record<string, unknown>;
    expect(ld["@type"]).toBe("FAQPage");
    const main = ld.mainEntity as unknown[];
    expect(main).toHaveLength(2);
  });

  it("returns null when no FAQ", () => {
    expect(faqJsonLdFromHtml(NO_FAQ)).toBeNull();
  });
});

describe("readingTimeMinutes", () => {
  it("returns 0 for empty content", () => {
    expect(readingTimeMinutes("")).toBe(0);
    expect(readingTimeMinutes(null)).toBe(0);
  });

  it("rounds words / wpm, floor of 1", () => {
    const words = Array.from({ length: 400 }, () => "mot").join(" ");
    expect(readingTimeMinutes(`<p>${words}</p>`)).toBe(2);
    expect(readingTimeMinutes("<p>court</p>")).toBe(1);
  });
});
