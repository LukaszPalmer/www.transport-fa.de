import type { CareerArea, Feature, Job, ProcessStep, Stat } from "@/types/content";
import { heroMedia } from "./media";

/**
 * Karriere – Stellen aus allen Unternehmensbereichen.
 * TODO(Inhalt): Stellen, Standorte und Benefits mit der Personalabteilung abstimmen.
 */
export const careersPage = {
  seo: {
    title: "Karriere – Jobs in Transport, Umzug & Entrümpelung",
    description:
      "Offene Stellen bei FA Transport: Berufskraftfahrer, Umzugshelfer, Möbelmonteure, Mitarbeiter Entrümpelung, Disposition und Ausbildung. Jetzt online bewerben.",
  },
  hero: {
    eyebrow: "Karriere · alle Bereiche",
    headline: ["Anpacken.", "Weiterkommen."],
    headlineAccent: "Mit uns wachsen.",
    subheadline:
      "Ob auf dem Bock, im Umzugsteam, bei Entrümpelungen oder in der Disposition: Bei FA Transport erwarten Sie ein starkes Team, moderne Ausstattung und ein sicherer Arbeitsplatz.",
    media: heroMedia("karriere"),
    factsTitle: "Darauf können Sie sich verlassen",
    facts: [
      "Unbefristete Festanstellung",
      "Pünktliche, faire Bezahlung",
      "Moderne Fahrzeuge & Ausrüstung",
      "Bewerbung in 3 Minuten – ohne Anschreiben",
    ],
  },
  stats: [
    { value: "4", label: "Bereiche", detail: "Transport, Umzug, Räumung, Büro" },
    { value: "3 Min.", label: "Bewerbungszeit", detail: "Kein Anschreiben nötig" },
    { value: "48 h", label: "Rückmeldung", detail: "Persönlich & verbindlich" },
    { value: "Azubis", label: "Willkommen", detail: "Mit Übernahmeperspektive" },
  ] satisfies Stat[],
};

export const careerAreas: CareerArea[] = [
  { id: "transport", label: "Transport & Logistik", icon: "truck" },
  { id: "umzug", label: "Umzüge & Montage", icon: "sofa" },
  { id: "raeumung", label: "Entrümpelung & Haushaltsauflösung", icon: "recycle" },
  { id: "verwaltung", label: "Disposition, Büro & Ausbildung", icon: "briefcase" },
];

export const benefits: Feature[] = [
  { icon: "coins", title: "Faire Vergütung", description: "Übertarifliche Bezahlung, Spesen, Zuschläge und pünktliche Lohnzahlung – immer." },
  { icon: "calendar-check", title: "Planbare Einsätze", description: "Einsatzplanung mit Vorlauf, überwiegend Tagestouren und verlässliche Wochenenden." },
  { icon: "truck", title: "Top-Ausstattung", description: "Moderne Fahrzeuge, hochwertige Arbeitskleidung und professionelles Werkzeug." },
  { icon: "graduation-cap", title: "Weiterbildung", description: "Führerschein-Förderung (C/CE), Modul-Schulungen und klare Aufstiegswege." },
  { icon: "users", title: "Starkes Team", description: "Kurze Wege, Duz-Kultur und Kollegen, die mit anpacken – vom Azubi bis zur Geschäftsführung." },
  { icon: "shield-check", title: "Sicherer Arbeitsplatz", description: "Unbefristete Verträge in einem gesunden, inhabergeführten Unternehmen." },
];

export const jobs: Job[] = [
  {
    id: "berufskraftfahrer-ce",
    title: "Berufskraftfahrer (m/w/d) Klasse CE",
    area: "transport",
    employment: "Vollzeit",
    location: "Musterstadt · Nah- & Fernverkehr",
    summary: "Sie bringen Komplett- und Teilladungen sicher und pünktlich zu unseren Kunden in Deutschland und Europa.",
    tasks: ["Nah- und Fernverkehrstouren mit modernem Sattelzug", "Be- und Entladekontrolle, Ladungssicherung", "Digitale Frachtpapiere per App"],
    profile: ["Führerschein CE mit Schlüsselzahl 95", "Fahrerkarte", "Zuverlässigkeit und Teamgeist"],
  },
  {
    id: "fahrer-c1-umzug",
    title: "Fahrer (m/w/d) Klasse C1/C für Umzüge",
    area: "umzug",
    employment: "Vollzeit",
    location: "Musterstadt · regional",
    summary: "Sie steuern unsere Umzugs-LKW und packen im Team mit an – vom Beladen bis zur Übergabe.",
    tasks: ["Fahren von 7,5 t- und 12 t-Umzugsfahrzeugen", "Mithilfe beim Be- und Entladen", "Übergabe und Kundenkommunikation vor Ort"],
    profile: ["Führerschein C1 oder C", "Körperliche Belastbarkeit", "Freundliches Auftreten"],
  },
  {
    id: "umzugshelfer",
    title: "Umzugshelfer / Möbelträger (m/w/d)",
    area: "umzug",
    employment: "Vollzeit · Teilzeit · Minijob",
    location: "Musterstadt · regional",
    summary: "Sie sind das Herz jedes Umzugs: Sie verpacken, tragen und transportieren mit Sorgfalt.",
    tasks: ["Tragen und Verladen von Möbeln und Kartons", "Einpack- und Auspackservice", "Schutz von Böden, Türen und Treppenhäusern"],
    profile: ["Körperliche Fitness", "Sorgfalt und Pünktlichkeit", "Gute Deutschkenntnisse"],
  },
  {
    id: "moebelmonteur",
    title: "Möbelmonteur / Küchenmonteur (m/w/d)",
    area: "umzug",
    employment: "Vollzeit",
    location: "Musterstadt · regional",
    summary: "Sie bauen Möbel und Einbauküchen fachgerecht ab und am neuen Standort wieder auf.",
    tasks: ["De- und Remontage von Möbeln und Küchen", "Anpassungsarbeiten, Wand- und Lampenmontage", "Qualitätskontrolle bei der Übergabe"],
    profile: ["Handwerkliche Ausbildung (z. B. Tischler) oder Erfahrung", "Führerschein Klasse B", "Selbstständige Arbeitsweise"],
  },
  {
    id: "mitarbeiter-entruempelung",
    title: "Mitarbeiter (m/w/d) Entrümpelung & Haushaltsauflösung",
    area: "raeumung",
    employment: "Vollzeit · Minijob",
    location: "Musterstadt · regional",
    summary: "Sie räumen Wohnungen, Keller und Gewerbeflächen – zügig, sortenrein und mit Respekt.",
    tasks: ["Räumung und Demontage", "Sortenreine Trennung für Recycling", "Besenreine Übergabe der Objekte"],
    profile: ["Körperliche Belastbarkeit", "Diskretion und Einfühlungsvermögen", "Führerschein B von Vorteil"],
  },
  {
    id: "objektleiter-haushaltsaufloesung",
    title: "Objektleiter (m/w/d) Haushaltsauflösungen",
    area: "raeumung",
    employment: "Vollzeit",
    location: "Musterstadt",
    summary: "Sie führen Besichtigungen durch, kalkulieren Angebote und leiten unsere Teams vor Ort.",
    tasks: ["Besichtigung und Angebotserstellung", "Wertschätzung von Möbeln und Antiquitäten", "Teamführung und Kundenbetreuung"],
    profile: ["Erfahrung in Entrümpelung, Umzug oder Handwerk", "Kommunikationsstärke und Empathie", "Führerschein B"],
  },
  {
    id: "disponent",
    title: "Disponent (m/w/d) Transport & Umzug",
    area: "verwaltung",
    employment: "Vollzeit",
    location: "Musterstadt · Büro",
    summary: "Sie planen Touren, Teams und Fahrzeuge und sind erster Ansprechpartner für Kunden und Fahrer.",
    tasks: ["Tourenplanung und Fahrzeugdisposition", "Kundenkommunikation und Angebotserstellung", "Einsatzplanung der Teams"],
    profile: ["Kaufmännische Ausbildung (Spedition/Logistik)", "Organisationstalent", "Sicherer Umgang mit TMS/Office"],
  },
  {
    id: "azubi-berufskraftfahrer",
    title: "Ausbildung Berufskraftfahrer (m/w/d)",
    area: "verwaltung",
    employment: "Ausbildung · 3 Jahre",
    location: "Musterstadt",
    summary: "Wir finanzieren Ihren LKW-Führerschein und bilden Sie zum Profi auf der Straße aus.",
    tasks: ["Führerschein C/CE inklusive", "Ladungssicherung und Tourenplanung", "Begleitfahrten mit erfahrenen Kollegen"],
    profile: ["Mindestens 17 Jahre", "Führerschein B (oder in Ausbildung)", "Begeisterung für Technik und Fahrzeuge"],
  },
  {
    id: "azubi-umzugsservice",
    title: "Ausbildung Fachkraft für Möbel-, Küchen- und Umzugsservice (m/w/d)",
    area: "verwaltung",
    employment: "Ausbildung · 3 Jahre",
    location: "Musterstadt",
    summary: "Staatlich anerkannte Ausbildung rund um Umzug, Montage und Kundenservice.",
    tasks: ["Planung und Durchführung von Umzügen", "Möbel- und Küchenmontage", "Kundenberatung vor Ort"],
    profile: ["Schulabschluss", "Handwerkliches Geschick", "Freude am Umgang mit Menschen"],
  },
];

export const applicationProcess: ProcessStep[] = [
  { title: "Online bewerben", description: "Formular ausfüllen, Lebenslauf anhängen – fertig. Ein Anschreiben ist nicht nötig." },
  { title: "Rückmeldung in 48 h", description: "Wir melden uns persönlich per Telefon oder E-Mail – garantiert." },
  { title: "Kennenlernen", description: "Ein lockeres Gespräch vor Ort und auf Wunsch ein Probetag im Team." },
  { title: "Willkommen im Team", description: "Einarbeitung mit festem Paten, Arbeitskleidung und allem, was Sie brauchen." },
];

export const initiativeJob = { id: "initiativ", title: "Initiativbewerbung" };

export const drivingLicenses = ["B", "BE", "C1", "C1E", "C", "CE"] as const;

/** Maximale Größe des Lebenslauf-Uploads (Server Action Body-Limit in next.config beachten). */
export const MAX_CV_MB = 5;
