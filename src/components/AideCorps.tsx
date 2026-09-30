import { Fragment, type ReactNode } from "react";
import { Link } from "react-router-dom";

/**
 * Renders a help article body (light markdown: ## / ###, **bold**, `code`,
 * [links](url), - and 1. lists, > quotes). Builds a React tree, never HTML.
 * Only http(s) and internal (/...) links become links.
 */
type Inline =
  | string
  | { type: "bold"; text: string }
  | { type: "code"; text: string }
  | { type: "link"; text: string; href: string };

const INLINE_RE = /\*\*(.+?)\*\*|`(.+?)`|\[(.+?)\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\)/g;

function parseInline(text: string): Inline[] {
  const parts: Inline[] = [];
  let last = 0;
  for (const m of text.matchAll(INLINE_RE)) {
    const start = m.index ?? 0;
    if (start > last) parts.push(text.slice(last, start));
    if (m[1] !== undefined) parts.push({ type: "bold", text: m[1] });
    else if (m[2] !== undefined) parts.push({ type: "code", text: m[2] });
    else if (m[3] !== undefined && m[4] !== undefined) parts.push({ type: "link", text: m[3], href: m[4] });
    last = start + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

const linkCls = "text-primary underline underline-offset-2";

function renderInline(text: string): ReactNode[] {
  return parseInline(text).map((part, i) => {
    if (typeof part === "string") return <Fragment key={i}>{part}</Fragment>;
    if (part.type === "bold") return <strong key={i}>{part.text}</strong>;
    if (part.type === "code") {
      return <code key={i} className="rounded bg-muted px-1 py-0.5 text-[0.9em]">{part.text}</code>;
    }
    if (part.href.startsWith("/")) {
      return <Link key={i} to={part.href} className={linkCls}>{part.text}</Link>;
    }
    return (
      <a key={i} href={part.href} target="_blank" rel="noopener noreferrer" className={linkCls}>
        {part.text}
      </a>
    );
  });
}

type Block =
  | { type: "h2" | "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "ul" | "ol"; items: string[] }
  | { type: "blockquote"; text: string };

function parseBlocks(md: string): Block[] {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  let quote: string[] = [];
  let list: { type: "ul" | "ol"; items: string[] } | null = null;

  const flushParagraph = () => {
    if (paragraph.length) blocks.push({ type: "p", text: paragraph.join(" ") });
    paragraph = [];
  };
  const flushList = () => {
    if (list) blocks.push(list);
    list = null;
  };
  const flushQuote = () => {
    if (quote.length) blocks.push({ type: "blockquote", text: quote.join(" ") });
    quote = [];
  };
  const flushAll = () => {
    flushParagraph();
    flushList();
    flushQuote();
  };

  for (const raw of lines) {
    const trimmed = raw.trim();
    if (!trimmed) {
      flushAll();
      continue;
    }
    const h = /^(#{2,3})\s+(.*)$/.exec(trimmed);
    if (h) {
      flushAll();
      blocks.push({ type: h[1].length === 2 ? "h2" : "h3", text: h[2] });
      continue;
    }
    const q = /^>\s?(.*)$/.exec(trimmed);
    if (q) {
      flushParagraph();
      flushList();
      quote.push(q[1]);
      continue;
    }
    flushQuote();
    const ol = /^\d+\.\s+(.*)$/.exec(trimmed);
    if (ol) {
      flushParagraph();
      if (list?.type !== "ol") {
        flushList();
        list = { type: "ol", items: [] };
      }
      list.items.push(ol[1]);
      continue;
    }
    const ul = /^[-*]\s+(.*)$/.exec(trimmed);
    if (ul) {
      flushParagraph();
      if (list?.type !== "ul") {
        flushList();
        list = { type: "ul", items: [] };
      }
      list.items.push(ul[1]);
      continue;
    }
    flushList();
    paragraph.push(trimmed);
  }
  flushAll();
  return blocks;
}

const AideCorps = ({ body }: { body: string }) => (
  <div className="space-y-4 break-words text-[15.5px] leading-relaxed text-foreground">
    {parseBlocks(body).map((b, i) => {
      switch (b.type) {
        case "h2":
          return <h2 key={i} className="pt-4 font-serif text-2xl font-bold">{renderInline(b.text)}</h2>;
        case "h3":
          return <h3 key={i} className="pt-2 font-serif text-xl font-semibold">{renderInline(b.text)}</h3>;
        case "blockquote":
          return (
            <blockquote key={i} className="border-l-4 border-primary/40 bg-muted/50 py-2 pl-4 pr-3 text-muted-foreground">
              {renderInline(b.text)}
            </blockquote>
          );
        case "ul":
          return (
            <ul key={i} className="list-disc space-y-1.5 pl-6">
              {b.items.map((it, j) => <li key={j}>{renderInline(it)}</li>)}
            </ul>
          );
        case "ol":
          return (
            <ol key={i} className="list-decimal space-y-1.5 pl-6">
              {b.items.map((it, j) => <li key={j}>{renderInline(it)}</li>)}
            </ol>
          );
        case "p":
          return <p key={i}>{renderInline(b.text)}</p>;
      }
    })}
  </div>
);

export default AideCorps;
