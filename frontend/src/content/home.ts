import type { Certification, CtaLink, Feature, Stat } from "@/types/content";
import { heroMedia } from "./media";
import { routes, sectionIds } from "./navigation";

/* --------------------------------------------------------------------------
   Hero
   -------------------------------------------------------------------------- */
export const hero = {
  eyebrow: "Transport & Logistik · seit 1999",
  headline: ["Globale Logistik.", "Präzise. Zuverlässig."],
  headlineAccent: "Zukunftssicher.",
  subheadline:
    "Wir bewegen Ihre Güter termintreu durch Europa – mit moderner Flotte, lückenloser Echtzeit-Transparenz und einem festen Ansprechpartner für jede Sendung.",
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
    { label: "CO₂ / tkm", value: "−18 %" },
  ],
};

/* --------------------------------------------------------------------------
   Trust-Bar
   -------------------------------------------------------------------------- */
export const trustStats: Stat[] = [
  { value: "25+", label: "Jahre Erfahrung", detail: "Inhabergeführt seit 1999" },
  { value: "99,8 %", label: "Termintreue", detail: "Über alle Sendungen 2025" },
  { value: "10.000+", label: "Transporte jährlich", detail: "National & international" },
  { value: "24/7", label: "Disposition", detail: "Persönliche Ansprechpartner" },
];

/* --------------------------------------------------------------------------
   Leistungen
   -------------------------------------------------------------------------- */
export const servicesSection = {
  eyebrow: "Leistungen",
  title: "Vier Bereiche. Ein verlässlicher Partner.",
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
  { value: "180+", label: "Eigene Fahrzeuge" },
  { value: "< 3 J.", label: "Ø Flottenalter" },
  { value: "100 %", label: "Euro-6-Norm" },
  { value: "24", label: "E-LKW im Einsatz" },
];

/** Kennzahlen unter der Live-Karte (dekorativ, Beispielwerte). */
export const fleetLiveKpis: Stat[] = [
  { value: "132", label: "Aktive Touren" },
  { value: "99,8 %", label: "Pünktlichkeit" },
  { value: "−18 %", label: "CO₂ je tkm" },
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
    title: "GPS-Echtzeit-Tracking",
    description:
      "Position, ETA-Prognose, Temperatur und digitaler Abliefernachweis live im Kundenportal – per API direkt in Ihr ERP.",
  },
  {
    icon: "leaf",
    title: "Nachhaltig unterwegs",
    description:
      "Wachsender E-LKW-Anteil, HVO-Kraftstoff und CO₂-Reporting nach ISO 14083 für Ihre Scope-3-Bilanz.",
  },
];

/* --------------------------------------------------------------------------
   Über uns / Warum wir
   -------------------------------------------------------------------------- */
export const aboutSection = {
  eyebrow: "Über uns",
  title: "Ein Partner, auf den Sie sich verlassen können.",
  intro:
    "Seit 1999 bewegt FA Transport Waren für Industrie, Handel und Mittelstand. Als inhabergeführtes Unternehmen verbinden wir die Leistungsfähigkeit eines internationalen Logistikers mit der Nähe und Verbindlichkeit eines Familienbetriebs.",
  mission: "Wir behandeln jede Sendung so, als wäre es unsere eigene.",
  missionSource: "Geschäftsführung, FA Transport",
  certificationsTitle: "Zertifiziert nach internationalen Standards",
};

export const values: Feature[] = [
  {
    icon: "shield-check",
    title: "Sicherheit",
    description:
      "Geschulte Berufskraftfahrer, zertifizierte Ladungssicherung und TAPA-konforme Prozesse schützen Ihre Güter auf jedem Kilometer.",
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
      "Echtzeit-Tracking, digitale Frachtdokumente und offene KPIs – Sie wissen jederzeit, wo Ihre Sendung steht.",
  },
  {
    icon: "handshake",
    title: "Partnerschaft",
    description:
      "Ein fester Ansprechpartner, kurze Entscheidungswege und Lösungen, die mit Ihren Anforderungen mitwachsen.",
  },
];

export const certifications: Certification[] = [
  { code: "ISO 9001", title: "Qualitätsmanagement" },
  { code: "ISO 14001", title: "Umweltmanagement" },
  { code: "ISO 45001", title: "Arbeitsschutz" },
  { code: "SQAS", title: "Chemie-Logistik" },
  { code: "TAPA TSR", title: "Transportsicherheit" },
  { code: "AEO-F", title: "Zugelassener Wirtschaftsbeteiligter" },
];

/* --------------------------------------------------------------------------
   Karriere
   -------------------------------------------------------------------------- */
export const careersTeaser = {
  eyebrow: "Karriere",
  title: "Anpacken, weiterkommen – in jedem unserer Bereiche.",
  description:
    "Wir suchen Berufskraftfahrer, Umzugshelfer, Möbelmonteure, Mitarbeiter für Entrümpelungen, Disponenten und Auszubildende (m/w/d).",
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
