import type { IconName } from "@/components/ui/Icon";

/**
 * Inhaltstypen der Website. Bewusst serialisierbar gehalten (keine
 * React-Komponenten, Icons nur als Registry-Key), damit die Daten später
 * 1:1 aus einem Headless-CMS geliefert werden können.
 */

export interface NavLink {
  label: string;
  href: string;
}

/** Unterpunkt eines Dropdowns (z. B. Leistungen). */
export interface NavChild extends NavLink {
  description: string;
  icon: IconName;
}

export interface NavItem extends NavLink {
  children?: NavChild[];
}

export interface NavGroup {
  title: string;
  items: NavLink[];
}

export interface CtaLink {
  label: string;
  href: string;
}

export interface Stat {
  value: string;
  label: string;
  detail?: string;
}

export interface Feature {
  icon: IconName;
  title: string;
  description: string;
}

/** Karte mit Stichpunkten (Leistungsbausteine). */
export interface Offering extends Feature {
  highlights: string[];
}

export interface ProcessStep {
  title: string;
  description: string;
}

export interface Faq {
  question: string;
  answer: string;
}

export interface Certification {
  code: string;
  title: string;
}

export type SocialPlatform = "linkedin" | "xing" | "instagram" | "youtube" | "facebook";

export interface SocialLink {
  platform: SocialPlatform;
  label: string;
  /** Fehlt, solange das Profil noch nicht existiert („Profil folgt demnächst"). */
  href?: string;
}

export interface VideoSource {
  src: string;
  type: string;
}

export interface HeroMediaConfig {
  poster: string;
  desktop: VideoSource[];
  mobile: VideoSource[];
}

/* --------------------------------------------------------------------------
   Leistungsbereiche
   -------------------------------------------------------------------------- */
export type ServiceSlug = "umzuege" | "entruempelungen" | "haushaltsaufloesungen" | "transport-logistik";

export interface ServiceArea {
  slug: ServiceSlug;
  name: string;
  icon: IconName;
  /** Kurzbeschreibung für Dropdown, Karten und Meta-Description. */
  teaser: string;
  /** Drei Stichpunkte für die Übersichtskarte auf der Startseite. */
  highlights: string[];
  seo: { title: string; description: string };
  hero: {
    eyebrow: string;
    headline: string[];
    headlineAccent: string;
    subheadline: string;
    media: HeroMediaConfig;
    /** Checkliste in der Glass-Karte neben der Headline. */
    factsTitle: string;
    facts: string[];
  };
  stats: Stat[];
  scope: { eyebrow: string; title: string; description: string; items: Offering[] };
  processTitle: string;
  /** Zeigt die Tracking-App-Sektion auf der Leistungsseite. */
  showTrackingApp?: boolean;
  process: ProcessStep[];
  faqs: Faq[];
}

/* --------------------------------------------------------------------------
   Bewertungen
   -------------------------------------------------------------------------- */
export type ReviewSource = "google" | "myhammer";

export interface Review {
  id: string;
  source: ReviewSource;
  author: string;
  rating: 1 | 2 | 3 | 4 | 5;
  /** ISO-Datum der Bewertung auf der Plattform. */
  date: string;
  text: string;
  /** Leistungsbereich – steuert, auf welcher Unterseite die Bewertung erscheint. */
  service?: ServiceSlug;
  /** Direktlink zur Originalbewertung. */
  url?: string;
}

/* --------------------------------------------------------------------------
   Karriere
   -------------------------------------------------------------------------- */
export type CareerAreaId = "transport" | "umzug" | "raeumung" | "verwaltung";

export interface CareerArea {
  id: CareerAreaId;
  label: string;
  icon: IconName;
}

export interface Job {
  id: string;
  title: string;
  area: CareerAreaId;
  employment: string;
  location: string;
  summary: string;
  tasks: string[];
  profile: string[];
}
