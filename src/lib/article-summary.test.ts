import { describe, it, expect } from "vitest";
import { extractSummary } from "@/lib/article-summary";

const WITH = `<p><strong>TL;DR</strong> — L'habitat participatif réunit des foyers autour d'un projet commun.</p><h2>Intro</h2><p>Suite.</p>`;
const WITHOUT = `<h2>Intro</h2><p>Pas de résumé ici.</p>`;

describe("extractSummary", () => {
  it("pulls out the TL;DR paragraph and strips the label", () => {
    const { summary, content } = extractSummary(WITH);
    expect(summary).toBe("L'habitat participatif réunit des foyers autour d'un projet commun.");
    expect(content).not.toContain("TL;DR");
    expect(content).toContain("<h2>Intro</h2>");
    expect(content).toContain("Suite.");
  });

  it("handles variant spelling/case (TLDR, tl;dr) and ':' separator", () => {
    expect(extractSummary(`<p>tl;dr: Ceci est court.</p>`).summary).toBe("Ceci est court.");
    expect(extractSummary(`<p>TLDR — Autre.</p>`).summary).toBe("Autre.");
  });

  it("returns content untouched when there is no TL;DR", () => {
    const { summary, content } = extractSummary(WITHOUT);
    expect(summary).toBeNull();
    expect(content).toBe(WITHOUT);
  });

  it("is safe on empty/null", () => {
    expect(extractSummary("")).toEqual({ summary: null, content: "" });
    expect(extractSummary(null)).toEqual({ summary: null, content: "" });
  });
});
