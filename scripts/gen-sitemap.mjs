// Build-time sitemap generator. The app is statically hosted (Apache, no Node at
// runtime), so /habitat/* and /listing/* URLs must be baked into public/sitemap.xml
// at build time. Runs as the npm "prebuild" step.
//
// SAFETY: reads ONLY the public anon/publishable key (never service_role). It fails
// gracefully — if the env is missing or Supabase is unreachable, the existing
// sitemap.xml is left untouched and the build proceeds.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SITEMAP = join(ROOT, "public", "sitemap.xml");
const BASE = "https://sejour.casaminga.com";

/** Resolve Supabase URL + publishable key from process.env, then from the .env file. */
function loadEnv() {
  let url = process.env.VITE_SUPABASE_URL;
  let key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const envFile = join(ROOT, ".env");
  if ((!url || !key) && existsSync(envFile)) {
    for (const line of readFileSync(envFile, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (!m) continue;
      const value = m[2].replace(/^["']|["']$/g, "");
      if (m[1] === "VITE_SUPABASE_URL" && !url) url = value;
      if (m[1] === "VITE_SUPABASE_PUBLISHABLE_KEY" && !key) key = value;
    }
  }
  return { url, key };
}

/** Optional: help center (admin database, public anon key). Returns null when not configured. */
function loadHelpEnv() {
  let url = process.env.VITE_HELP_SUPABASE_URL;
  let key = process.env.VITE_HELP_SUPABASE_ANON_KEY;
  const envFile = join(ROOT, ".env");
  if ((!url || !key) && existsSync(envFile)) {
    for (const line of readFileSync(envFile, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (!m) continue;
      const value = m[2].replace(/^["']|["']$/g, "");
      if (m[1] === "VITE_HELP_SUPABASE_URL" && !url) url = value;
      if (m[1] === "VITE_HELP_SUPABASE_ANON_KEY" && !key) key = value;
    }
  }
  return url && key ? { url, key } : null;
}

async function fetchRows(base, key, table, query) {
  const res = await fetch(`${base}/rest/v1/${table}?${query}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!res.ok) throw new Error(`${table} HTTP ${res.status}`);
  return res.json();
}

async function fetchSlugs(base, key, table, query) {
  const res = await fetch(`${base}/rest/v1/${table}?${query}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!res.ok) throw new Error(`${table} HTTP ${res.status}`);
  const rows = await res.json();
  return [...new Set(rows.map((r) => r.slug).filter(Boolean))];
}

function urlLine(path, priority) {
  return `  <url><loc>${BASE}${path}</loc><priority>${priority}</priority></url>`;
}

async function main() {
  if (!existsSync(SITEMAP)) {
    console.warn("[gen-sitemap] public/sitemap.xml introuvable — rien à faire.");
    return;
  }

  const { url, key } = loadEnv();
  if (!url || !key) {
    console.warn("[gen-sitemap] env Supabase absente — sitemap inchangé.");
    return;
  }

  let places = [];
  let listings = [];
  try {
    [places, listings] = await Promise.all([
      fetchSlugs(url, key, "places", "select=slug&published=eq.true&is_visible=eq.true"),
      fetchSlugs(url, key, "listings", "select=slug&published=eq.true"),
    ]);
  } catch (e) {
    console.warn(`[gen-sitemap] Supabase injoignable (${e.message}) — sitemap inchangé.`);
    return;
  }

  // Help center pages (categories that hold articles + published articles), best effort.
  let helpSlugs = [];
  const help = loadHelpEnv();
  if (help) {
    try {
      const arts = await fetchRows(help.url, help.key, "help_articles", "select=slug,category_slug&audience=eq.sejour&published=eq.true");
      const cats = new Set(arts.map((a) => a.category_slug).filter(Boolean));
      helpSlugs = [...cats, ...arts.map((a) => a.slug)];
    } catch (e) {
      console.warn(`[gen-sitemap] aide injoignable (${e.message}) — pages d'aide ignorées.`);
    }
  }

  // Preserve the hand-maintained fixed entries (pages + /ressources/*). Drop only the
  // previously-generated dynamic lines so re-runs stay idempotent.
  const existing = readFileSync(SITEMAP, "utf8");
  const kept = existing
    .split(/\r?\n/)
    .filter(
      (l) =>
        !l.includes("/habitat/") &&
        !l.includes("/listing/") &&
        !l.includes("/aide") &&
        !l.includes("(généré au build)") &&
        l.trim() !== "</urlset>",
    );
  while (kept.length && kept[kept.length - 1].trim() === "") kept.pop();

  const dyn = [];
  if (places.length) {
    dyn.push("", "  <!-- Lieux (généré au build) -->");
    for (const slug of places) dyn.push(urlLine(`/habitat/${slug}`, "0.7"));
  }
  if (listings.length) {
    dyn.push("", "  <!-- Séjours (généré au build) -->");
    for (const slug of listings) dyn.push(urlLine(`/listing/${slug}`, "0.7"));
  }

  if (helpSlugs.length) {
    dyn.push("", "  <!-- Aide (généré au build) -->", urlLine("/aide", "0.6"));
    for (const slug of helpSlugs) dyn.push(urlLine(`/aide/${slug}`, "0.5"));
  }

  const out = [...kept, ...dyn, "</urlset>", ""].join("\n");
  writeFileSync(SITEMAP, out, "utf8");
  console.log(`[gen-sitemap] OK — ${places.length} lieux + ${listings.length} séjours ajoutés.`);
}

main().catch((e) => {
  // Never break the build because of the sitemap.
  console.warn(`[gen-sitemap] erreur non bloquante : ${e.message}`);
});
