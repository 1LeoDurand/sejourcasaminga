import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";

export type ResourceType =
  | "livre"
  | "film"
  | "documentaire"
  | "podcast"
  | "article"
  | "guide";

export interface Resource {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  content: string | null;
  type: ResourceType | string;
  author_or_director: string | null;
  year: number | null;
  cover_image: string | null;
  external_link: string | null;
  tags: string[] | null;
  is_published: boolean;
  created_at: string;
  /** Content language ("fr" | "en" | "es"). Absent on legacy rows → treated as "fr". */
  lang?: string | null;
}

export const useResources = (type?: string) => {
  const { i18n } = useTranslation();
  const lang = (i18n.language || "fr").slice(0, 2);

  return useQuery({
    queryKey: ["resources", type ?? "all", lang],
    queryFn: async () => {
      let q = supabase
        .from("resources")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      if (type && type !== "all") q = q.eq("type", type);
      const { data, error } = await q;
      if (error) throw error;

      const all = (data as Resource[]) ?? [];
      // Language scoping with a safe fallback. Rows without `lang` (legacy, or
      // before the lang column exists) count as "fr". Show resources in the
      // current UI language; if none exist yet in that language, fall back to
      // French so the library is never empty.
      const inLang = all.filter((r) => (r.lang ?? "fr") === lang);
      return inLang.length > 0 ? inLang : all.filter((r) => (r.lang ?? "fr") === "fr");
    },
  });
};

export const useResource = (slug?: string) =>
  useQuery({
    queryKey: ["resource", slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("resources")
        .select("*")
        .eq("slug", slug as string)
        .eq("is_published", true)
        .maybeSingle();
      if (error) throw error;
      return data as Resource | null;
    },
  });
