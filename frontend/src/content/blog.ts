import type { IconName } from "@/components/ui/Icon";
import type { Faq, ServiceSlug } from "@/types/content";
import type { Locale } from "@/i18n/config";
import { entruempelungPosts } from "./blog-posts/entruempelung";
import { haushaltsaufloesungPosts } from "./blog-posts/haushaltsaufloesung";
import { transportPosts } from "./blog-posts/transport";
import { umzugPosts } from "./blog-posts/umzug";
import * as blogEn from "./en/blog";

/**
 * Blog & Ratgeber – Kategorien und Beiträge.
 *
 * Neuer Beitrag: Objekt in der passenden Datei unter `blog-posts/` ergänzen (Slug = URL unter
 * /blog/…). Der Text besteht aus typisierten Blöcken (Absatz, Zwischenüberschrift, Liste,
 * Checkliste, Tabelle, Tipp, Zitat, Bild, Lesetipp) – so sieht jeder Beitrag einheitlich aus,
 * ohne dass jemand HTML schreiben muss.
 * Übersicht, Startseiten-Teaser, Sitemap und JSON-LD (inkl. FAQ) aktualisieren sich automatisch.
 *
 * SEO/GEO-Leitlinien: Kernaussage im ersten Absatz, Zwischenüberschriften als echte Suchfragen,
 * Zahlen als Tabelle, „Das Wichtigste in Kürze“ als Checkliste oben, FAQ am Ende.
 */

export type BlogBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "subheading"; text: string }
  | { type: "list"; items: string[]; ordered?: boolean }
  | { type: "checklist"; title?: string; items: string[] }
  | { type: "table"; caption: string; head: string[]; rows: string[][]; note?: string }
  | { type: "tip"; title: string; text: string }
  | { type: "quote"; text: string; cite?: string }
  | { type: "image"; src: string; alt: string; caption?: string }
  /** Interner Link als hervorgehobener Lesetipp (Beitrag, Leistungsseite, Kontakt). */
  | { type: "link"; label: string; href: string; text?: string };

export interface BlogCategory {
  slug: string;
  name: string;
  description: string;
  icon: IconName;
  image: string;
  /** Passende Leistungsseite – für den Angebots-Kasten unter jedem Beitrag. */
  service: ServiceSlug;
}

export interface BlogPost {
  slug: string;
  title: string;
  /** 1–2 Sätze für Karten, Suchmaschinen und Social Media (ideal 140–160 Zeichen). */
  excerpt: string;
  category: BlogCategory["slug"];
  /** ISO-Datum, z. B. "2026-10-15". */
  publishedAt: string;
  updatedAt?: string;
  /** `team: true` → in den strukturierten Daten als Organisation statt Person. */
  author: { name: string; role: string; team?: boolean };
  cover: { src: string; alt: string };
  /** Hervorgehobener Beitrag oben in der Übersicht. */
  featured?: boolean;
  /** Such- und Themenbegriffe (JSON-LD `keywords`, Open-Graph-Tags). */
  keywords: string[];
  body: BlogBlock[];
  /** Häufige Fragen am Ende des Beitrags – zusätzlich als FAQPage-Daten ausgeliefert. */
  faqs?: Faq[];
}

export const blogPage = {
  seo: {
    title: "Blog & Ratgeber – Umzug, Entrümpelung, Transport",
    description:
      "Praxiswissen von FA Transport: Tipps, Checklisten und Hintergründe rund um Umzug, Entrümpelung, Haushaltsauflösung und Transport.",
  },
  eyebrow: "Blog & Ratgeber",
  titleLead: "Lesen Sie,",
  titleAccent: "worauf es ankommt.",
  description:
    "Praxiswissen aus zehn Jahren Umzug, Entrümpelung und Transport – verständlich aufbereitet, damit Ihr Vorhaben in Düsseldorf und Umgebung von Anfang an gelingt.",
  promises: [
    { icon: "award", title: "Aus der Praxis", text: "Wissen direkt von unseren Teams aus Umzug, Entrümpelung und Disposition." },
    { icon: "check", title: "Zum Abhaken", text: "Kompakte Checklisten, die Sie sofort für Ihr Vorhaben nutzen können." },
    { icon: "sparkles", title: "Klar erklärt", text: "Ohne Fachchinesisch – mit konkreten Beispielen aus dem Alltag." },
  ] satisfies Array<{ icon: IconName; title: string; text: string }>,
  teaser: {
    eyebrow: "Blog & Ratgeber",
    title: "Lesen Sie, worauf es ankommt.",
    description:
      "Tipps, Checklisten und Hintergründe aus unserem Alltag – damit Sie wissen, woran Sie bei Umzug, Entrümpelung und Transport denken sollten.",
  },
  comingSoon: {
    title: "Die ersten Beiträge sind in Vorbereitung.",
    text: "Unser Team schreibt gerade an Ratgebern und Checklisten zu diesen Themen. Schauen Sie bald wieder vorbei.",
  },
  question: {
    title: "Eine Frage, die wir beantworten sollen?",
    text: "Schreiben Sie uns, was Sie rund um Umzug, Entrümpelung oder Transport wissen möchten – die häufigsten Fragen greifen wir im Blog auf.",
    cta: "Frage stellen",
  },
  note: "",
};

export const blogCategories: BlogCategory[] = [
  {
    slug: "umzug",
    name: "Umzug",
    description: "Planung, Fristen und Checklisten für einen entspannten Umzug – privat wie gewerblich.",
    icon: "truck",
    image: "/media/stock/umzug-transporter-beladen.jpg",
    service: "umzuege",
  },
  {
    slug: "entruempelung",
    name: "Entrümpelung",
    description: "Was bleibt, was geht – und wie Sie Keller, Dachboden oder Lager richtig freiräumen.",
    icon: "recycle",
    image: "/media/stock/entruempelung-sofa-tragen.jpg",
    service: "entruempelungen",
  },
  {
    slug: "haushaltsaufloesung",
    name: "Haushaltsauflösung",
    description: "Einfühlsam und strukturiert: Ablauf, Wertanrechnung und besenreine Übergabe.",
    icon: "house",
    image: "/media/stock/haushaltsaufloesung-sessel.jpg",
    service: "haushaltsaufloesungen",
  },
  {
    slug: "transport",
    name: "Transport",
    description: "Fracht, Dokumente und Abläufe verständlich erklärt – vom Einzelstück bis zur Teilladung.",
    icon: "package",
    image: "/media/stock/transport-lkw-fahrer.jpg",
    service: "transport",
  },
];

/** Leere Liste → Übersicht und Startseite zeigen stattdessen die Themenvorschau. */
export const blogPosts: BlogPost[] = [...umzugPosts, ...entruempelungPosts, ...haushaltsaufloesungPosts, ...transportPosts];

// --- Sprachfassungen -------------------------------------------------------------------

const blogDe = { blogPage, blogCategories, blogPosts };
const blogByLocale: Record<Locale, typeof blogDe> = { de: blogDe, en: blogEn };

/** Blog-Seite, Kategorien und Beiträge in der gewünschten Sprache (Slugs sind in beiden Sprachen gleich). */
export function getBlog(locale: Locale = "de") {
  return blogByLocale[locale];
}

// --- Hilfsfunktionen -------------------------------------------------------------------

export function getCategory(slug: string, locale: Locale = "de"): BlogCategory | undefined {
  return getBlog(locale).blogCategories.find((category) => category.slug === slug);
}

export function getPost(slug: string, locale: Locale = "de"): BlogPost | undefined {
  return getBlog(locale).blogPosts.find((post) => post.slug === slug);
}

/** Neueste zuerst. */
export function sortedPosts(posts: BlogPost[] = blogPosts): BlogPost[] {
  return [...posts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

// Reine Hilfsfunktionen – eigenes Modul, damit Client-Komponenten nicht alle Beiträge mitladen.
export { blogHref, formatPostDate, headingId, readingMinutes } from "./blog-utils";
