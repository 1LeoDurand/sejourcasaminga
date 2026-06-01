import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  cover_image: string | null;
  category: string | null;
  published_at: string | null;
  is_published: boolean;
  created_at: string;
}

export type BlogBlockType =
  | "text"
  | "image"
  | "video_embed"
  | "podcast_embed"
  | "quote";

export interface BlogPostBlock {
  id: string;
  post_id: string;
  block_type: BlogBlockType;
  sort_order: number;
  content_text: string | null;
  media_url: string | null;
  embed_url: string | null;
  caption: string | null;
  metadata_json: Record<string, unknown> | null;
  created_at: string;
}

export const useBlogPosts = () =>
  useQuery({
    queryKey: ["blog-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id, slug, title, excerpt, cover_image, category, published_at")
        .eq("is_published", true)
        .not("published_at", "is", null)
        .order("published_at", { ascending: false });
      if (error) throw error;
      return data as BlogPost[];
    },
  });

export const useBlogPost = (slug: string) =>
  useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const { data: post, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();
      if (error) throw error;

      const { data: blocks, error: blocksError } = await supabase
        .from("blog_post_blocks")
        .select("*")
        .eq("post_id", (post as BlogPost).id)
        .order("sort_order", { ascending: true });
      if (blocksError) throw blocksError;

      return {
        post: post as BlogPost,
        blocks: (blocks ?? []) as BlogPostBlock[],
      };
    },
    enabled: !!slug,
  });
