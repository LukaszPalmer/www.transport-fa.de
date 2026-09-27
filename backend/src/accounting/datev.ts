import type { AccountingSettings } from "@fa/shared";
import { fiscalYearStart, type Booking } from "./journal";

/**
 * DATEV-Format (EXTF), Buchungsstapel – Versionsnummer 700, Formatkategorie 21, Formatversion 13.
 * Aufbau: Kopfzeile (31 Felder) · Spaltenüberschriften (125 Felder) · eine Zeile je Buchung.
 * Kodierung Windows-1252 (ANSI), Zeilenende CRLF, Trennzeichen Semikolon, Texte in Anführungszeichen,
 * Beträge mit Dezimalkomma ohne Vorzeichen (Richtung über Soll/Haben-Kennzeichen).
 *
 * Die Buchungen sind nicht festgeschrieben (Festschreibung 0) – die Steuerberatung prüft und
 * schreibt sie in DATEV Rechnungswesen fest. Import dort: Stapelverarbeitung → Import → ASCII-Daten.
 */

/** Spaltenüberschriften in exakt der von DATEV vorgegebenen Reihenfolge. */
export const DATEV_COLUMNS = [
  "Umsatz (ohne Soll/Haben-Kz)", "Soll/Haben-Kennzeichen", "WKZ Umsatz", "Kurs", "Basisumsatz", "WKZ Basisumsatz", "Konto",
  "Gegenkonto (ohne BU-Schlüssel)", "BU-Schlüssel", "Belegdatum", "Belegfeld 1", "Belegfeld 2", "Skonto", "Buchungstext",
  "Postensperre", "Diverse Adressnummer", "Geschäftspartnerbank", "Sachverhalt", "Zinssperre", "Beleglink", "Beleginfo – Art 1",
  "Beleginfo – Inhalt 1", "Beleginfo – Art 2", "Beleginfo – Inhalt 2", "Beleginfo – Art 3", "Beleginfo – Inhalt 3",
  "Beleginfo – Art 4", "Beleginfo – Inhalt 4", "Beleginfo – Art 5", "Beleginfo – Inhalt 5", "Beleginfo – Art 6",
  "Beleginfo – Inhalt 6", "Beleginfo – Art 7", "Beleginfo – Inhalt 7", "Beleginfo – Art 8", "Beleginfo – Inhalt 8",
  "KOST1 – Kostenstelle", "KOST2 – Kostenstelle", "Kost Menge", "EU-Land u. USt-IdNr.", "EU-Steuersatz", "Abw. Versteuerungsart",
  "Sachverhalt L+L", "Funktionsergänzung L+L", "BU 49 Hauptfunktionstyp", "BU 49 Hauptfunktionsnummer",
  "BU 49 Funktionsergänzung", "Zusatzinformation – Art 1", "Zusatzinformation – Inhalt 1", "Zusatzinformation – Art 2",
  "Zusatzinformation – Inhalt 2", "Zusatzinformation – Art 3", "Zusatzinformation – Inhalt 3", "Zusatzinformation – Art 4",
  "Zusatzinformation – Inhalt 4", "Zusatzinformation – Art 5", "Zusatzinformation – Inhalt 5", "Zusatzinformation – Art 6",
  "Zusatzinformation – Inhalt 6", "Zusatzinformation – Art 7", "Zusatzinformation – Inhalt 7", "Zusatzinformation – Art 8",
  "Zusatzinformation – Inhalt 8", "Zusatzinformation – Art 9", "Zusatzinformation – Inhalt 9", "Zusatzinformation – Art 10",
  "Zusatzinformation – Inhalt 10", "Zusatzinformation – Art 11", "Zusatzinformation – Inhalt 11", "Zusatzinformation – Art 12",
  "Zusatzinformation – Inhalt 12", "Zusatzinformation – Art 13", "Zusatzinformation – Inhalt 13", "Zusatzinformation – Art 14",
  "Zusatzinformation – Inhalt 14", "Zusatzinformation – Art 15", "Zusatzinformation – Inhalt 15", "Zusatzinformation – Art 16",
  "Zusatzinformation – Inhalt 16", "Zusatzinformation – Art 17", "Zusatzinformation – Inhalt 17", "Zusatzinformation – Art 18",
  "Zusatzinformation – Inhalt 18", "Zusatzinformation – Art 19", "Zusatzinformation – Inhalt 19", "Zusatzinformation – Art 20",
  "Zusatzinformation – Inhalt 20", "Stück", "Gewicht", "Zahlweise", "Forderungsart", "Veranlagungsjahr",
  "Zugeordnete Fälligkeit", "Skontotyp", "Auftragsnummer", "Buchungstyp", "USt-Schlüssel (Anzahlungen)",
  "EU-Mitgliedstaat (Anzahlungen)", "Sachverhalt L+L (Anzahlungen)", "EU-Steuersatz (Anzahlungen)", "Erlöskonto (Anzahlungen)",
  "Herkunft-Kz", "Leerfeld", "KOST-Datum", "SEPA-Mandatsreferenz", "Skontosperre", "Gesellschaftername", "Beteiligtennummer",
  "Identifikationsnummer", "Zeichnernummer", "Postensperre bis", "Bezeichnung", "Kennzeichen", "Festschreibung",
  "Leistungsdatum", "Datum Zuord.", "Fälligkeit", "Generalumkehr", "Steuersatz", "Land", "Abrechnungsreferent", "BVV-Position",
  "EU-Mitgliedstaat u. UStID (Ursprung)", "EU-Steuersatz (Ursprung)", "Abw. Skontokonto",
] as const;

type Column = (typeof DATEV_COLUMNS)[number];
const COLUMN_INDEX = new Map<Column, number>(DATEV_COLUMNS.map((column, index) => [column, index]));

/** Zeichen, die Windows-1252 im Bereich 0x80–0x9F zusätzlich zu Latin-1 kennt. */
const CP1252_EXTRA: Record<string, number> = {
  "€": 0x80, "‚": 0x82, "ƒ": 0x83, "„": 0x84, "…": 0x85, "†": 0x86, "‡": 0x87, "ˆ": 0x88, "‰": 0x89, "Š": 0x8a, "‹": 0x8b, "Œ": 0x8c,
  "Ž": 0x8e, "‘": 0x91, "’": 0x92, "“": 0x93, "”": 0x94, "•": 0x95, "–": 0x96, "—": 0x97, "˜": 0x98, "™": 0x99, "š": 0x9a, "›": 0x9b,
  "œ": 0x9c, "ž": 0x9e, "Ÿ": 0x9f,
};

/** Text → Windows-1252. Nicht darstellbare Zeichen (z. B. Emojis) werden zu „?". */
export function encodeCp1252(text: string): Buffer {
  const bytes: number[] = [];
  for (const char of text) {
    const code = char.codePointAt(0)!;
    if (code < 0x80 || (code >= 0xa0 && code <= 0xff)) bytes.push(code);
    else bytes.push(CP1252_EXTRA[char] ?? 0x3f);
  }
  return Buffer.from(bytes);
}

const quote = (value: string) => `"${value.replace(/[\r\n]+/g, " ").replace(/"/g, '""')}"`;
const CRLF = "\r\n";
const amount = (cents: number) => (Math.abs(cents) / 100).toFixed(2).replace(".", ",");
/** JJJJ-MM-TT → TTMM (Belegdatum) bzw. TTMMJJJJ (Leistungsdatum). */
const ddmm = (day: string) => `${day.slice(8, 10)}${day.slice(5, 7)}`;
const ddmmyyyy = (day: string) => `${day.slice(8, 10)}${day.slice(5, 7)}${day.slice(0, 4)}`;
const compact = (day: string) => day.replaceAll("-", "");

/** Belegfeld 1: max. 36 Zeichen, erlaubt sind Buchstaben, Ziffern und $ & % * + - / */
export function belegfeld(value: string): string {
  return value.replace(/[^A-Za-z0-9$&%*+\-/]/g, "").slice(0, 36);
}

function berlinTimestamp(now: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(now);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "00";
  return `${get("year")}${get("month")}${get("day")}${get("hour")}${get("minute")}${get("second")}${String(now.getMilliseconds()).padStart(3, "0")}`;
}

export interface DatevBatchOptions {
  bookings: Booking[];
  settings: AccountingSettings;
  from: string;
  to: string;
  /** Wer exportiert (max. 25 Zeichen im Kopf). */
  exportedBy: string;
  now?: Date;
}

/** Liegt der Zeitraum in genau einem Wirtschaftsjahr? DATEV verlangt das je Buchungsstapel. */
export function withinOneFiscalYear(from: string, to: string, settings: AccountingSettings): boolean {
  return fiscalYearStart(from, settings.fiscalYearStartMonth) === fiscalYearStart(to, settings.fiscalYearStartMonth);
}

export function datevBookingBatch({ bookings, settings, from, to, exportedBy, now = new Date() }: DatevBatchOptions): Buffer {
  const label = `Ausgangsrechnungen ${from.slice(8, 10)}.${from.slice(5, 7)}.–${to.slice(8, 10)}.${to.slice(5, 7)}.${to.slice(0, 4)}`.slice(0, 30);
  const header = [
    quote("EXTF"),
    "700",
    "21",
    quote("Buchungsstapel"),
    "13",
    berlinTimestamp(now),
    "",
    quote("RE"),
    quote(exportedBy.slice(0, 25)),
    "",
    String(settings.consultantNumber ?? ""),
    String(settings.clientNumber ?? ""),
    compact(fiscalYearStart(from, settings.fiscalYearStartMonth)),
    String(settings.accountLength),
    compact(from),
    compact(to),
    quote(label),
    quote("FA"),
    "1", // Buchungstyp: Finanzbuchführung
    "0", // Rechnungslegungszweck: unabhängig
    "0", // Festschreibung: nein
    quote("EUR"),
    "",
    quote(""),
    "",
    "",
    quote(settings.chart === "SKR04" ? "04" : "03"),
    "",
    "",
    "",
    quote(""),
  ];

  const rows = bookings.map((booking) => {
    const fields: string[] = new Array(DATEV_COLUMNS.length).fill("");
    const set = (column: Column, value: string) => {
      fields[COLUMN_INDEX.get(column)!] = value;
    };
    set("Umsatz (ohne Soll/Haben-Kz)", amount(booking.grossCents));
    set("Soll/Haben-Kennzeichen", quote(booking.side));
    set("WKZ Umsatz", quote("EUR"));
    set("Konto", String(booking.account));
    set("Gegenkonto (ohne BU-Schlüssel)", String(booking.contraAccount));
    set("Belegdatum", ddmm(booking.date));
    set("Belegfeld 1", quote(belegfeld(booking.invoiceNumber)));
    set("Buchungstext", quote(booking.text.slice(0, 60)));
    if (booking.vatId) set("EU-Land u. USt-IdNr.", quote(booking.vatId.replace(/\s/g, "")));
    if (booking.serviceDate) set("Leistungsdatum", ddmmyyyy(booking.serviceDate));
    return fields.join(";");
  });

  const text = [header.join(";"), DATEV_COLUMNS.join(";"), ...rows].join(CRLF) + CRLF;
  return encodeCp1252(text);
}
