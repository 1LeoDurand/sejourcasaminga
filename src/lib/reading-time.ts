// Estimated reading time (minutes) from an HTML string, ~200 words/min.
// Strips tags via DOMParser when available (browser + jsdom), else a regex
// fallback. Always returns at least 1 for non-empty content.
export function readingTimeMinutes(html: string | null | undefined, wpm = 200): number {
  if (!html) return 0;
  let text: string;
  if (typeof DOMParser !== "undefined") {
    text = new DOMParser().parseFromString(html, "text/html").body.textContent || "";
  } else {
    text = html.replace(/<[^>]+>/g, " ");
  }
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  if (words === 0) return 0;
  return Math.max(1, Math.round(words / wpm));
}
