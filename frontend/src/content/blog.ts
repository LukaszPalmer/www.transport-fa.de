import type { IconName } from "@/components/ui/Icon";

/**
 * Blog & Ratgeber – Kategorien und Beiträge.
 *
 * Neuer Beitrag: Objekt in `blogPosts` ergänzen (Slug = URL unter /blog/…). Der Text besteht
 * aus typisierten Blöcken (Absatz, Zwischenüberschrift, Liste, Checkliste, Tipp, Zitat, Bild) –
 * so sieht jeder Beitrag einheitlich aus, ohne dass jemand HTML schreiben muss.
 * Übersicht, Startseiten-Teaser, Sitemap und JSON-LD aktualisieren sich automatisch.
 */

export type BlogBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "subheading"; text: string }
  | { type: "list"; items: string[]; ordered?: boolean }
  | { type: "checklist"; title?: string; items: string[] }
  | { type: "tip"; title: string; text: string }
  | { type: "quote"; text: string; cite?: string }
  | { type: "image"; src: string; alt: string; caption?: string };

export interface BlogCategory {
  slug: string;
  name: string;
  description: string;
  icon: IconName;
  image: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  /** 1–2 Sätze für Karten, Suchmaschinen und Social Media. */
  excerpt: string;
  category: BlogCategory["slug"];
  /** ISO-Datum, z. B. "2026-10-15". */
  publishedAt: string;
  updatedAt?: string;
  author: { name: string; role: string };
  cover: { src: string; alt: string };
  /** Hervorgehobener Beitrag oben in der Übersicht. */
  featured?: boolean;
  body: BlogBlock[];
}

export const blogPage = {
  seo: {
    title: "Blog & Ratgeber – Umzug, Entrümpelung, Transport",
    description:
      "Praxiswissen von FA Transport: Tipps, Checklisten und Hintergründe rund um Umzug, Entrümpelung, Haushaltsauflösung sowie Transport & Logistik.",
  },
  eyebrow: "Blog & Ratgeber",
  titleLead: "Lesen Sie,",
  titleAccent: "worauf es ankommt.",
  description:
    "Praxiswissen aus über 25 Jahren Umzug, Entrümpelung und Logistik – verständlich aufbereitet, damit Ihr Vorhaben von Anfang an gelingt.",
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
};

export const blogCategories: BlogCategory[] = [
  {
    slug: "umzug",
    name: "Umzug",
    description: "Planung, Fristen und Checklisten für einen entspannten Umzug – privat wie gewerblich.",
    icon: "truck",
    image: "/media/umzuege/poster.jpg",
  },
  {
    slug: "entruempelung",
    name: "Entrümpelung",
    description: "Was bleibt, was geht – und wie Sie Keller, Dachboden oder Lager richtig freiräumen.",
    icon: "recycle",
    image: "/media/entruempelungen/poster.jpg",
  },
  {
    slug: "haushaltsaufloesung",
    name: "Haushaltsauflösung",
    description: "Einfühlsam und strukturiert: Ablauf, Wertanrechnung und besenreine Übergabe.",
    icon: "house",
    image: "/media/haushaltsaufloesungen/poster.jpg",
  },
  {
    slug: "transport-logistik",
    name: "Transport & Logistik",
    description: "Fracht, Dokumente und Abläufe verständlich erklärt – vom Einzelstück bis zur Teilladung.",
    icon: "package",
    image: "/media/transport-logistik/poster.jpg",
  },
];

/** Noch keine Beiträge veröffentlicht – Übersicht und Startseite zeigen dann die Themenvorschau. */
export const blogPosts: BlogPost[] = [];

// --- Hilfsfunktionen -------------------------------------------------------------------

export const blogHref = (slug: string) => `/blog/${slug}`;

export function getCategory(slug: string): BlogCategory | undefined {
  return blogCategories.find((category) => category.slug === slug);
}

export function getPost(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

/** Neueste zuerst. */
export function sortedPosts(posts: BlogPost[] = blogPosts): BlogPost[] {
  return [...posts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

const WORDS_PER_MINUTE = 200;

/** Lesezeit in Minuten (mind. 1) – aus allen Textblöcken berechnet. */
export function readingMinutes(post: BlogPost): number {
  const text = post.body
    .map((block) => {
      switch (block.type) {
        case "list":
        case "checklist":
          return [block.type === "checklist" ? block.title : "", ...block.items].join(" ");
        case "tip":
          return `${block.title} ${block.text}`;
        case "image":
          return block.caption ?? "";
        default:
          return block.text;
      }
    })
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

const dateFormat = new Intl.DateTimeFormat("de-DE", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Berlin" });
export const formatPostDate = (iso: string) => dateFormat.format(new Date(iso));
