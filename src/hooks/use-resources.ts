import { useQuery } from "@tanstack/react-query";
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
}

export const useResources = (type?: string) =>
  useQuery({
    queryKey: ["resources", type ?? "all"],
    queryFn: async () => {
      let q = supabase
        .from("resources")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      if (type && type !== "all") q = q.eq("type", type);
      const { data, error } = await q;
      if (error) throw error;
      return data as Resource[];
    },
  });

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
