import { helpSupabase } from "./supabase-admin-help";

/** Help center data (admin database, audience 'sejour', published only). */

export interface AideCategory {
  slug: string;
  label: string;
  description: string | null;
  sortOrder: number;
  icon: string | null;
}

export interface AideArticle {
  slug: string;
  categorySlug: string | null;
  title: string;
  excerpt: string | null;
  keywords: string[];
  body: string;
  updatedAt: string;
  sortOrder: number;
  viewCount: number;
}

export class AideUnavailableError extends Error {
  constructor() {
    super("help-unavailable");
  }
}

const CAT_COLS = "slug, label, description, sort_order, icon";
const LIST_COLS = "slug, category_slug, title, excerpt, keywords, updated_at, sort_order, view_count";
const FULL_COLS = `${LIST_COLS}, body`;

/* eslint-disable @typescript-eslint/no-explicit-any */
const toCategory = (r: any): AideCategory => ({
  slug: r.slug,
  label: r.label,
  description: r.description ?? null,
  sortOrder: r.sort_order ?? 0,
  icon: r.icon ?? null,
});

const toArticle = (r: any): AideArticle => ({
  slug: r.slug,
  categorySlug: r.category_slug ?? null,
  title: r.title,
  excerpt: r.excerpt ?? null,
  keywords: r.keywords ?? [],
  body: r.body ?? "",
  updatedAt: r.updated_at,
  sortOrder: r.sort_order ?? 0,
  viewCount: r.view_count ?? 0,
});
/* eslint-enable @typescript-eslint/no-explicit-any */

function client() {
  if (!helpSupabase) throw new AideUnavailableError();
  return helpSupabase;
}

export const aideAvailable = helpSupabase !== null;

export async function fetchAideCategories(): Promise<AideCategory[]> {
  const { data, error } = await client()
    .from("help_categories")
    .select(CAT_COLS)
    .eq("audience", "sejour")
    .order("sort_order")
    .order("slug");
  if (error) throw new Error(error.message);
  return (data ?? []).map(toCategory);
}

/** All published articles, without the body (lists, search, neighbours). */
export async function fetchAideArticles(): Promise<AideArticle[]> {
  const { data, error } = await client()
    .from("help_articles")
    .select(LIST_COLS)
    .eq("audience", "sejour")
    .eq("published", true)
    .order("sort_order")
    .order("slug");
  if (error) throw new Error(error.message);
  return (data ?? []).map(toArticle);
}

export async function fetchAideArticle(slug: string): Promise<AideArticle | null> {
  const { data, error } = await client()
    .from("help_articles")
    .select(FULL_COLS)
    .eq("audience", "sejour")
    .eq("published", true)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? toArticle(data) : null;
}

export async function incrementAideView(slug: string): Promise<void> {
  if (!helpSupabase) return;
  try {
    await helpSupabase.rpc("help_increment_view", { p_slug: slug });
  } catch {
    /* view counting is best effort */
  }
}

export async function voteAide(slug: string, helpful: boolean): Promise<boolean> {
  if (!helpSupabase) return false;
  try {
    const { error } = await helpSupabase.rpc("help_vote", { p_slug: slug, p_helpful: helpful });
    return !error;
  } catch {
    return false;
  }
}

const voteKey = (slug: string) => `aide-vote:${slug}`;

export function getStoredVote(slug: string): "yes" | "no" | null {
  try {
    const v = localStorage.getItem(voteKey(slug));
    return v === "yes" || v === "no" ? v : null;
  } catch {
    return null;
  }
}

export function storeVote(slug: string, v: "yes" | "no") {
  try {
    localStorage.setItem(voteKey(slug), v);
  } catch {
    /* private mode: the vote is still counted for this visit */
  }
}

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Client-side search on title, excerpt and keywords; every word must match. */
export function searchAide(articles: AideArticle[], query: string): AideArticle[] {
  const words = norm(query).split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  return articles.filter((a) => {
    const hay = norm(`${a.title} ${a.excerpt ?? ""} ${a.keywords.join(" ")}`);
    return words.every((w) => hay.includes(w));
  });
}
