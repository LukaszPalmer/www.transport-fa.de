import type { Commitment, CtaLink, Feature, Stat } from "@/types/content";
import { heroMedia } from "./media";
import { routes, sectionIds } from "./navigation";

/* --------------------------------------------------------------------------
   Hero
   -------------------------------------------------------------------------- */
export const hero = {
  eyebrow: "Transport & Logistik · aus Düsseldorf",
  headline: ["Globale Logistik.", "Präzise. Zuverlässig."],
  headlineAccent: "Zukunftssicher.",
  subheadline:
    "Wir bewegen Ihre Güter termintreu durch Europa – mit moderner Flotte, transparenten Festpreisen und einem festen Ansprechpartner für jede Sendung.",
  primaryCta: { label: "Angebot anfordern", href: routes.contactForm } satisfies CtaLink,
  secondaryCta: { label: "Unsere Flotte entdecken", href: `#${sectionIds.fleet}` } satisfies CtaLink,
  proofPoints: ["Angebot in 2 Stunden", "Disposition 24/7", "Europaweites Netzwerk"],
  media: heroMedia("hero"),
};

/** Beispielhafte Live-Sendung für die Tracking-Karte im Hero (dekorativ). */
export const heroShipment = {
  id: "FA-26-04817",
  from: { city: "Hamburg", time: "06:15" },
  to: { city: "Mailand", time: "14:30" },
  progress: 68,
  status: "Im Plan",
  details: [
    { label: "Ladung", value: "24 t · 33 Pal." },
    { label: "Temperatur", value: "+4 °C" },
    { label: "Fahrzeug", value: "Sattelzug" },
  ],
};

/* --------------------------------------------------------------------------
   Trust-Bar
   -------------------------------------------------------------------------- */
export const trustStats: Stat[] = [
  { value: "10", label: "Jahre Erfahrung", detail: "Know-how aus Transport & Umzug" },
  { value: "99,8 %", label: "Termintreue", detail: "Über alle Sendungen 2025" },
  { value: "Festpreis", label: "Verbindliche Angebote", detail: "Ohne versteckte Kosten" },
  { value: "24/7", label: "Disposition", detail: "Persönliche Ansprechpartner" },
];

/* --------------------------------------------------------------------------
   Leistungen
   -------------------------------------------------------------------------- */
export const servicesSection = {
  eyebrow: "Leistungen",
  title: "Ein Ansprechpartner für alles, was bewegt werden muss.",
  description:
    "Ob Umzug, Entrümpelung, Haushaltsauflösung oder Frachttransport: Sie erhalten alles aus einer Hand – mit eigenen Teams, eigener Flotte und festen Preisen.",
  footnote: "Mehrere Leistungen kombinieren oder Sonderwunsch?",
  footnoteCta: { label: "Sprechen Sie mit uns", href: routes.contactForm } satisfies CtaLink,
};

/* --------------------------------------------------------------------------
   Flotte & Technologie
   -------------------------------------------------------------------------- */
export const fleetSection = {
  eyebrow: "Flotte & Technologie",
  title: "Modernste Flotte. Volle Transparenz. Weniger Emissionen.",
  description:
    "Unsere Fahrzeuge sind im Schnitt jünger als drei Jahre, telematisch vernetzt und erfüllen ausnahmslos die Euro-6-Norm – für maximale Sicherheit, Effizienz und Planbarkeit.",
};

export const fleetStats: Stat[] = [
  { value: "10", label: "Eigene Fahrzeuge" },
  { value: "< 3 J.", label: "Ø Flottenalter" },
  { value: "100 %", label: "Euro-6-Norm" },
  { value: "24/7", label: "Disposition erreichbar" },
];

/** Kennzahlen unter der Live-Karte (dekorativ). */
export const fleetLiveKpis: Stat[] = [
  { value: "EU-weit", label: "Einsatzgebiet" },
  { value: "99,8 %", label: "Pünktlichkeit" },
  { value: "Direkt", label: "Fahrten ohne Umladen" },
];

export const fleetFeatures: Feature[] = [
  {
    icon: "shield-check",
    title: "Modernste Fahrzeuge",
    description:
      "Sattelzüge, Tautliner, Kühl- und Schwerlastequipment der neuesten Generation – mit Notbrems-, Abbiege- und Spurhalteassistent.",
  },
  {
    icon: "satellite",
    title: "GPS-Tracking & ERP-Anbindung",
    badge: "In Kürze",
    description:
      "Bald verfolgen Sie Position, voraussichtliche Ankunft und Abliefernachweis Ihrer Sendung live im Kundenportal. Im nächsten Schritt folgt die direkte Anbindung an Ihr ERP per API.",
  },
  {
    icon: "zap",
    title: "Effizient geplant",
    description:
      "Durchdachte Touren und Direktfahrten ohne Umladen sparen Zeit, Kosten und unnötige Kilometer – gut für Ihr Budget und die Umwelt.",
  },
];

/* --------------------------------------------------------------------------
   Über uns / Warum wir
   -------------------------------------------------------------------------- */
export const aboutSection = {
  eyebrow: "Über uns",
  title: "Ein Partner, auf den Sie sich verlassen können.",
  intro:
    "FA Transport ist ein junges Unternehmen aus Düsseldorf – mit einem Team, das zehn Jahre Erfahrung aus Transport, Umzug und Räumung mitbringt. Wir verbinden moderne, digitale Abläufe mit dem, was in unserer Branche am meisten zählt: Pünktlichkeit, Sorgfalt und klare Absprachen.",
  mission: "Wir behandeln jede Sendung so, als wäre es unsere eigene.",
  missionSource: "Geschäftsführung, FA Transport",
  commitmentsTitle: "Unser Versprechen an Sie",
};

export const values: Feature[] = [
  {
    icon: "shield-check",
    title: "Sicherheit",
    description:
      "Sorgfältiges Verpacken, Schutzdecken und Kantenschutz sowie eine Haftung nach HGB – damit Umzugsgut und Fracht unversehrt ankommen.",
  },
  {
    icon: "clock",
    title: "Verlässlichkeit",
    description:
      "99,8 % Termintreue sind kein Zufall, sondern das Ergebnis vorausschauender Disposition und klarer Eskalationswege.",
  },
  {
    icon: "activity",
    title: "Transparenz",
    description:
      "Verbindliche Festpreise, klare Absprachen und Ihre Dokumente jederzeit im Kundenportal – Sie wissen immer, woran Sie sind.",
  },
  {
    icon: "handshake",
    title: "Partnerschaft",
    description:
      "Ein fester Ansprechpartner, kurze Entscheidungswege und Lösungen, die mit Ihren Anforderungen mitwachsen.",
  },
];

/** Leistungsversprechen unter „Über uns“ – nur Zusagen, die für jeden Auftrag gelten. */
export const commitments: Commitment[] = [
  { icon: "coins", value: "Festpreis", label: "Verbindliches Angebot" },
  { icon: "house", value: "Kostenlos", label: "Besichtigung vor Ort oder per Video" },
  { icon: "clock", value: "< 2 Std.", label: "Antwort auf Ihre Anfrage" },
  { icon: "handshake", value: "1", label: "Fester Ansprechpartner" },
  { icon: "shield-check", value: "Versichert", label: "Haftung nach HGB" },
  { icon: "phone", value: "24/7", label: "Disposition erreichbar" },
];

/** Kurzzeile im Footer unter dem Logo. */
export const footerClaim = "Festpreis · Versichert · Disposition 24/7";

/* --------------------------------------------------------------------------
   Karriere
   -------------------------------------------------------------------------- */
export const careersTeaser = {
  eyebrow: "Karriere",
  title: "Anpacken, weiterkommen – in jedem unserer Bereiche.",
  description: "Wir suchen Berufskraftfahrer, Fahrer für Umzüge, Umzugshelfer und Mitarbeiter für Entrümpelungen (m/w/d) in Düsseldorf.",
  cta: { label: "Offene Stellen ansehen", href: routes.careers } satisfies CtaLink,
};

/* --------------------------------------------------------------------------
   Abschluss-CTA
   -------------------------------------------------------------------------- */
export const contactCta = {
  eyebrow: "Kontakt",
  title: "Bereit für Ihre nächste Fracht?",
  description:
    "Sprechen Sie mit unseren Experten – ob Umzug, Räumung oder Transport. Sie erhalten schnell ein individuelles, transparentes Angebot.",
  primaryCta: { label: "Angebot anfordern", href: routes.contactForm } satisfies CtaLink,
  responseTime: "Ø Antwortzeit unter 2 Stunden",
};
