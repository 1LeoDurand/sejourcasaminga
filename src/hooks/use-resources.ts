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
