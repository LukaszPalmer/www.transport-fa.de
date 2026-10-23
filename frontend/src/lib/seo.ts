import type { Metadata } from "next";
import { company } from "@/content/company";
import { DEFAULT_LOCALE, localizeHref, LOCALES, type Locale } from "@/i18n/config";

/**
 * Metadaten aller öffentlichen Seiten aus einer Hand: Title, Description, Canonical, hreflang,
 * Open Graph und X/Twitter – immer vollständig. Next.js führt Metadaten nur flach zusammen
 * (ein `openGraph` der Seite ersetzt das des Layouts komplett); deshalb baut diese Funktion
 * das ganze Objekt, statt sich auf das Layout zu verlassen.
 *
 * Längen (Richtwerte für vollständige Anzeige in Google): Title inkl. „ | FA Transport" höchstens
 * 60 Zeichen – längere Titles erscheinen automatisch ohne Marke; Description 120–160 Zeichen –
 * längere werden am Wortende gekürzt. `npm run seo:audit` prüft alle Seiten der Sitemap.
 */

const OG_LOCALE: Record<Locale, string> = { de: "de_DE", en: "en_GB" };

const BRAND_SUFFIX = ` | ${company.name}`;
const MAX_TITLE = 60;
const MAX_DESCRIPTION = 160;

/** Marke anhängen, solange der Title vollständig angezeigt wird – sonst ohne (Google zeigt den Websitenamen ohnehin an). */
function governTitle(title: string | { absolute: string }) {
  if (typeof title !== "string") return title;
  return title.length + BRAND_SUFFIX.length > MAX_TITLE ? { absolute: title } : title;
}

/** Zu lange Descriptions am Wortende kürzen – Google schneidet sonst mitten im Wort ab. */
function governDescription(description: string): string {
  if (description.length <= MAX_DESCRIPTION) return description;
  const cut = description.slice(0, MAX_DESCRIPTION - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[\s,;:–-]+$/, "")}…`;
}

/** Absolute URL einer Seite in der gewünschten Sprache – "/kontakt" → https://…/en/kontakt. */
export function absoluteUrl(path: string, locale: Locale = DEFAULT_LOCALE): string {
  const localized = localizeHref(path, locale);
  return `${company.siteUrl}${localized === "/" ? "" : localized}`;
}

/** hreflang-Verweise: Deutsch (Standard und x-default) und Englisch. */
export function languageAlternates(path: string): Record<string, string> {
  return {
    ...Object.fromEntries(LOCALES.map((locale) => [locale, absoluteUrl(path, locale)])),
    "x-default": absoluteUrl(path, DEFAULT_LOCALE),
  };
}

export interface SeoImage {
  /** Pfad unter der Domain, z. B. "/media/umzuege/poster.jpg". */
  url: string;
  width: number;
  height: number;
  alt: string;
}

/**
 * Generiertes Vorschaubild der Website (app/opengraph-image.tsx) für Seiten ohne eigenes Bild. Explizit
 * gesetzt: Die Datei liegt außerhalb von app/[lang], ihr automatisches og:image greift dort nicht.
 */
const DEFAULT_IMAGE: SeoImage = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: `${company.name} – Umzüge & Transporte aus Düsseldorf. Präzise. Zuverlässig. Zum Festpreis.`,
};

interface PageSeo {
  /** Sichtbarer Pfad ohne Sprachpräfix, z. B. "/leistungen/umzuege". */
  path: string;
  locale: Locale;
  /** Ohne Marke – das Layout hängt „ | FA Transport" an. `{ absolute }` ersetzt den ganzen Title. */
  title: string | { absolute: string };
  description: string;
  /** Vorschaubild für Social Media und KI-Suchen; ohne → generiertes Bild der Website. */
  image?: SeoImage;
  article?: { publishedTime: string; modifiedTime?: string; authors?: string[]; section?: string; tags?: string[] };
  keywords?: string[];
  /** Nicht in Suchergebnissen (z. B. Bewertungs-Kurzlink) – Links darauf werden trotzdem verfolgt. */
  noindex?: boolean;
}

export function pageMetadata({ path, locale, title, description: rawDescription, image = DEFAULT_IMAGE, article, keywords, noindex }: PageSeo): Metadata {
  const url = absoluteUrl(path, locale);
  const plainTitle = typeof title === "string" ? title : title.absolute;
  const description = governDescription(rawDescription);
  const images = [{ ...image, url: `${company.siteUrl}${image.url}` }];

  return {
    title: governTitle(title),
    description,
    keywords,
    alternates: { canonical: url, ...(noindex ? {} : { languages: languageAlternates(path) }) },
    openGraph: {
      url,
      siteName: company.name,
      locale: OG_LOCALE[locale],
      alternateLocale: LOCALES.filter((other) => other !== locale).map((other) => OG_LOCALE[other]),
      title: plainTitle,
      description,
      images,
      ...(article ? { type: "article", ...article } : { type: "website" }),
    },
    twitter: { card: "summary_large_image", title: plainTitle, description, images },
    ...(noindex && { robots: { index: false, follow: true } }),
  };
}
