import { intlLocale, type Locale } from "@/i18n/config";
import type { BlogPost } from "./blog";

/**
 * Reine Hilfsfunktionen des Blogs ohne Inhalts-Importe – nutzbar in Client-Komponenten,
 * ohne dass alle Beiträge ins Browser-Bundle wandern.
 */

export const blogHref = (slug: string) => `/blog/${slug}`;

const WORDS_PER_MINUTE = 200;

/** Lesezeit in Minuten (mind. 1) – aus allen Textblöcken berechnet. */
export function readingMinutes(post: BlogPost): number {
  const text = post.body
    .map((block) => {
      switch (block.type) {
        case "list":
        case "checklist":
          return [block.type === "checklist" ? block.title : "", ...block.items].join(" ");
        case "table":
          return [block.caption, ...block.head, ...block.rows.flat(), block.note ?? ""].join(" ");
        case "tip":
          return `${block.title} ${block.text}`;
        case "image":
          return block.caption ?? "";
        case "link":
          return `${block.label} ${block.text ?? ""}`;
        default:
          return block.text;
      }
    })
    .concat((post.faqs ?? []).map((faq) => `${faq.question} ${faq.answer}`))
    .join(" ");
  return Math.max(1, Math.round(text.split(/\s+/).filter(Boolean).length / WORDS_PER_MINUTE));
}

/** Anker-ID für Zwischenüberschriften (Inhaltsverzeichnis). */
export function headingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const formatPostDate = (iso: string, locale: Locale = "de") =>
  new Intl.DateTimeFormat(intlLocale(locale), { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Berlin" }).format(new Date(iso));
