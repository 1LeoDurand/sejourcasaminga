import type { BlogPostBlock } from "@/hooks/use-blog-posts";

// Resolve various provider URLs to embeddable iframe URLs.
const toEmbedUrl = (url: string): { src: string; provider: string } | null => {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");

    // YouTube
    if (host === "youtube.com" || host === "m.youtube.com") {
      const id = u.searchParams.get("v");
      if (id) return { src: `https://www.youtube.com/embed/${id}`, provider: "youtube" };
    }
    if (host === "youtu.be") {
      const id = u.pathname.slice(1);
      if (id) return { src: `https://www.youtube.com/embed/${id}`, provider: "youtube" };
    }
    if (host === "youtube.com" && u.pathname.startsWith("/embed/")) {
      return { src: url, provider: "youtube" };
    }

    // Vimeo
    if (host === "vimeo.com") {
      const id = u.pathname.split("/").filter(Boolean)[0];
      if (id) return { src: `https://player.vimeo.com/video/${id}`, provider: "vimeo" };
    }
    if (host === "player.vimeo.com") return { src: url, provider: "vimeo" };

    // Spotify
    if (host === "open.spotify.com") {
      if (u.pathname.startsWith("/embed/")) return { src: url, provider: "spotify" };
      return {
        src: `https://open.spotify.com/embed${u.pathname}`,
        provider: "spotify",
      };
    }

    // Soundcloud (use their player URL)
    if (host === "soundcloud.com" || host.endsWith(".soundcloud.com")) {
      return {
        src: `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23d65d39&auto_play=false&hide_related=true&show_comments=false&show_user=true`,
        provider: "soundcloud",
      };
    }

    // Ausha
    if (host.endsWith("ausha.co")) {
      return { src: url, provider: "ausha" };
    }

    // Acast
    if (host.endsWith("acast.com")) {
      if (u.pathname.startsWith("/embed/")) return { src: url, provider: "acast" };
      return { src: `https://embed.acast.com${u.pathname}`, provider: "acast" };
    }

    return null;
  } catch {
    return null;
  }
};

const VideoEmbed = ({ url, caption }: { url: string; caption?: string | null }) => {
  const embed = toEmbedUrl(url);
  if (!embed) {
    return (
      <p className="editorial-block-fallback">
        <a href={url} target="_blank" rel="noopener noreferrer">
          {url}
        </a>
      </p>
    );
  }
  return (
    <figure className="editorial-block-embed">
      <div className="editorial-block-embed-frame">
        <iframe
          src={embed.src}
          title={caption || "Vidéo"}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
};

const PodcastEmbed = ({ url, caption }: { url: string; caption?: string | null }) => {
  const embed = toEmbedUrl(url);
  if (!embed) {
    return (
      <p className="editorial-block-fallback">
        <a href={url} target="_blank" rel="noopener noreferrer">
          {url}
        </a>
      </p>
    );
  }
  const heights: Record<string, number> = {
    spotify: 232,
    soundcloud: 166,
    ausha: 220,
    acast: 200,
  };
  const height = heights[embed.provider] ?? 200;
  return (
    <figure className="editorial-block-embed editorial-block-podcast">
      <iframe
        src={embed.src}
        title={caption || "Podcast"}
        loading="lazy"
        style={{ width: "100%", height: `${height}px`, border: 0, borderRadius: 12 }}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
};

export const BlogBlocks = ({ blocks }: { blocks: BlogPostBlock[] }) => {
  return (
    <>
      {blocks.map((b) => {
        switch (b.block_type) {
          case "text":
            return (
              <div
                key={b.id}
                dangerouslySetInnerHTML={{ __html: b.content_text || "" }}
              />
            );
          case "image":
            if (!b.media_url) return null;
            return (
              <figure key={b.id} className="editorial-block-image">
                <img src={b.media_url} alt={b.caption || ""} loading="lazy" />
                {b.caption && <figcaption>{b.caption}</figcaption>}
              </figure>
            );
          case "quote":
            return (
              <blockquote key={b.id} className="editorial-block-quote">
                <p>{b.content_text}</p>
                {b.caption && <cite>— {b.caption}</cite>}
              </blockquote>
            );
          case "video_embed":
            if (!b.embed_url) return null;
            return <VideoEmbed key={b.id} url={b.embed_url} caption={b.caption} />;
          case "podcast_embed":
            if (!b.embed_url) return null;
            return <PodcastEmbed key={b.id} url={b.embed_url} caption={b.caption} />;
          default:
            return null;
        }
      })}
    </>
  );
};
