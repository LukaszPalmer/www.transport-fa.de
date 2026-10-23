import type { CareerArea, Feature, Job, ProcessStep, Stat } from "@/types/content";
import type { Locale } from "@/i18n/config";
import * as careersEn from "./en/careers";
import { heroMedia } from "./media";

/**
 * Karriere – Stellen aus allen Unternehmensbereichen.
 * TODO(Inhalt): Stellen, Standorte und Benefits mit der Personalabteilung abstimmen.
 */
export const careersPage = {
  seo: {
    title: "Jobs in Düsseldorf – Fahrer & Umzugshelfer",
    description:
      "Offene Stellen in Düsseldorf: Berufskraftfahrer CE, Fahrer für Umzüge, Umzugshelfer und Mitarbeiter Entrümpelung (m/w/d). In 3 Minuten online bewerben.",
  },
  hero: {
    eyebrow: "Karriere · Düsseldorf",
    headline: ["Anpacken.", "Weiterkommen."],
    headlineAccent: "Mit uns wachsen.",
    subheadline:
      "Ob auf dem Bock, im Umzugsteam oder bei Entrümpelungen: Bei FA Transport in Düsseldorf erwarten Sie ein starkes Team, moderne Ausstattung und ein sicherer Arbeitsplatz.",
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
    { value: "3", label: "Bereiche", detail: "Transport, Umzug, Räumung" },
    { value: "3 Min.", label: "Bewerbungszeit", detail: "Kein Anschreiben nötig" },
    { value: "48 h", label: "Rückmeldung", detail: "Persönlich & verbindlich" },
    { value: "Düsseldorf", label: "Standort", detail: "Kurze Wege, festes Team" },
  ] satisfies Stat[],
};

export const careerAreas: CareerArea[] = [
  { id: "transport", label: "Transport", icon: "truck" },
  { id: "umzug", label: "Umzüge & Montage", icon: "sofa" },
  { id: "raeumung", label: "Entrümpelung & Haushaltsauflösung", icon: "recycle" },
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
    location: "Düsseldorf · Nah- & Fernverkehr",
    summary: "Sie bringen Komplett- und Teilladungen sicher und pünktlich zu unseren Kunden in Deutschland und Europa.",
    tasks: ["Nah- und Fernverkehrstouren mit modernem Sattelzug", "Be- und Entladekontrolle, Ladungssicherung", "Digitale Frachtpapiere per App"],
    profile: ["Führerschein CE mit Schlüsselzahl 95", "Fahrerkarte", "Zuverlässigkeit und Teamgeist"],
  },
  {
    id: "fahrer-c1-umzug",
    title: "Fahrer (m/w/d) Klasse C1/C für Umzüge",
    area: "umzug",
    employment: "Vollzeit",
    location: "Düsseldorf · regional",
    summary: "Sie steuern unsere Umzugs-LKW und packen im Team mit an – vom Beladen bis zur Übergabe.",
    tasks: ["Fahren von 7,5 t- und 12 t-Umzugsfahrzeugen", "Mithilfe beim Be- und Entladen", "Übergabe und Kundenkommunikation vor Ort"],
    profile: ["Führerschein C1 oder C", "Körperliche Belastbarkeit", "Freundliches Auftreten"],
  },
  {
    id: "umzugshelfer",
    title: "Umzugshelfer / Möbelträger (m/w/d)",
    area: "umzug",
    employment: "Vollzeit · Teilzeit · Minijob",
    location: "Düsseldorf · regional",
    summary: "Sie sind das Herz jedes Umzugs: Sie verpacken, tragen und transportieren mit Sorgfalt.",
    tasks: ["Tragen und Verladen von Möbeln und Kartons", "Einpack- und Auspackservice", "Schutz von Böden, Türen und Treppenhäusern"],
    profile: ["Körperliche Fitness", "Sorgfalt und Pünktlichkeit", "Gute Deutschkenntnisse"],
  },
  {
    id: "mitarbeiter-entruempelung",
    title: "Mitarbeiter (m/w/d) Entrümpelung & Haushaltsauflösung",
    area: "raeumung",
    employment: "Vollzeit · Minijob",
    location: "Düsseldorf · regional",
    summary: "Sie räumen Wohnungen, Keller und Gewerbeflächen – zügig, sortenrein und mit Respekt.",
    tasks: ["Räumung und Demontage", "Sortenreine Trennung für Recycling", "Besenreine Übergabe der Objekte"],
    profile: ["Körperliche Belastbarkeit", "Diskretion und Einfühlungsvermögen", "Führerschein B von Vorteil"],
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

const careersDe = { careersPage, careerAreas, benefits, jobs, applicationProcess, initiativeJob };
const careersByLocale: Record<Locale, typeof careersDe> = { de: careersDe, en: careersEn };

/** Karriere-Inhalte in der gewünschten Sprache (Stellen-IDs sind in beiden Sprachen gleich). */
export function getCareers(locale: Locale) {
  return careersByLocale[locale];
}
