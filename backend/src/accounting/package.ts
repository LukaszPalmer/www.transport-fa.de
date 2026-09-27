import { COMPANY, TAX_CASE_INFO, type AccountingSettings } from "@fa/shared";
import { Zip, ZipDeflate, ZipPassThrough } from "fflate";
import { buildCiiXml } from "../invoicing/cii";
import { logger } from "../lib/logger";
import { getObjectBuffer } from "../storage/r2";
import { debtorsCsv, journalCsv } from "./csv";
import { datevBookingBatch, withinOneFiscalYear } from "./datev";
import type { Journal } from "./journal";
import { datevReady } from "./settings";

/**
 * Belegpaket für die Steuerberatung (ZIP):
 *
 *   DATEV/EXTF_Buchungsstapel_<von>_<bis>.csv   – Import in DATEV Rechnungswesen
 *   Rechnungsausgangsbuch_<von>_<bis>.csv       – für Excel, Prüfung und Ablage
 *   Debitoren_<von>_<bis>.csv                   – Beschriftung der Personenkonten
 *   Belege/Rechnungen/*.pdf, Belege/Gutschriften/*.pdf – Originale (ZUGFeRD bei erstellten Rechnungen)
 *   XRechnung/*.xml                             – E-Rechnungen als reines XML
 *   Hinweise.txt                                – Zeitraum, Summen, Konten, offene Punkte
 *
 * Wird gestreamt: PDFs kommen nacheinander aus R2, der Speicherbedarf bleibt klein.
 */

const euro = (cents: number) => `${(cents / 100).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
const germanDate = (day: string) => `${day.slice(8, 10)}.${day.slice(5, 7)}.${day.slice(0, 4)}`;
const safeName = (value: string) => value.replace(/[^A-Za-z0-9._-]+/g, "_").slice(0, 80);

export function packageFileName(from: string, to: string): string {
  return `Belegpaket_${COMPANY.name.replace(/\s+/g, "-")}_${from}_${to}.zip`;
}

function readme(journal: Journal, settings: AccountingSettings, includesDatev: boolean, missingFiles: string[]): string {
  const invoices = journal.entries.filter((entry) => entry.type === "INVOICE" && !entry.cancelled);
  const credits = journal.entries.filter((entry) => entry.type === "CREDIT_NOTE");
  const lines = [
    `Belegpaket ${COMPANY.legalName}`,
    `Zeitraum: ${germanDate(journal.from)} – ${germanDate(journal.to)} (nach Rechnungsdatum)`,
    `Erstellt: ${new Date().toLocaleString("de-DE", { timeZone: "Europe/Berlin" })}`,
    `Quelle: ${journal.source === "GENERATED" ? "nur im Portal erstellte E-Rechnungen" : "alle Rechnungen und Gutschriften (im Portal erstellt und hochgeladen)"}`,
    "",
    `Rechnungen: ${invoices.length} · Gutschriften: ${credits.length} · storniert: ${journal.entries.filter((entry) => entry.cancelled).length}`,
    "",
    "Umsatzsteuer-Auswertung (Rechnungen abzüglich Gutschriften):",
    ...journal.byTax.map(
      (row) => `  ${TAX_CASE_INFO[row.taxCase].label.padEnd(36)} Konto ${String(row.account).padEnd(6)} netto ${euro(row.netCents).padStart(14)}  USt ${euro(row.vatCents).padStart(12)}  brutto ${euro(row.grossCents).padStart(14)}`,
    ),
    "",
    `Kontenrahmen: ${settings.chart} · Sachkontenlänge ${settings.accountLength} · Wirtschaftsjahr ab Monat ${settings.fiscalYearStartMonth}`,
    `Debitoren: ${settings.debtorMode === "PER_CUSTOMER" ? "je Kunde (Kundennummer = Debitorenkonto)" : `Sammeldebitor ${settings.collectiveDebtorAccount}`}`,
    `Barzahlungen: ${settings.includeCashPayments ? `als Buchung „Kasse (${settings.accounts.cash}) an Debitor" enthalten` : "nicht enthalten"}`,
    includesDatev
      ? "DATEV: Buchungsstapel im EXTF-Format 700, nicht festgeschrieben. Import über Stapelverarbeitung → Import → ASCII-Daten."
      : "DATEV: kein Buchungsstapel enthalten – Berater- und Mandantennummer fehlen in den Einstellungen oder der Zeitraum umfasst mehrere Wirtschaftsjahre.",
    "Überweisungen sind nicht als Zahlung gebucht – sie kommen über den Kontoauszug in die Buchhaltung.",
  ];
  const notes = [...journal.warnings, ...missingFiles.map((number) => `${number}: PDF konnte nicht gelesen werden.`)];
  if (notes.length > 0) lines.push("", "Bitte prüfen:", ...notes.map((note) => `  - ${note}`));
  lines.push("", `Rückfragen: ${COMPANY.contact.email} · ${COMPANY.contact.phone}`);
  return lines.join("\r\n") + "\r\n";
}

/**
 * Schreibt das ZIP in `sink` (Chunk für Chunk). Löst auf, sobald das Archiv vollständig ist.
 */
export async function writeAccountingPackage(
  journal: Journal,
  settings: AccountingSettings,
  exportedBy: string,
  sink: (chunk: Uint8Array, final: boolean) => void,
): Promise<{ files: number }> {
  let failure: Error | null = null;
  let done!: () => void;
  const finished = new Promise<void>((resolve) => (done = resolve));
  const zip = new Zip((error, chunk, final) => {
    if (error) {
      failure = error;
      done();
      return;
    }
    sink(chunk, final);
    if (final) done();
  });

  let files = 0;
  const add = (name: string, data: Uint8Array, compress: boolean) => {
    const file = compress ? new ZipDeflate(name, { level: 6 }) : new ZipPassThrough(name);
    zip.add(file);
    file.push(data, true);
    files += 1;
  };

  const period = `${journal.from}_${journal.to}`;
  const includesDatev = datevReady(settings) && withinOneFiscalYear(journal.from, journal.to, settings) && journal.bookings.length > 0;
  if (includesDatev) {
    add(`DATEV/EXTF_Buchungsstapel_${period}.csv`, datevBookingBatch({ bookings: journal.bookings, settings, from: journal.from, to: journal.to, exportedBy }), true);
  }
  add(`Rechnungsausgangsbuch_${period}.csv`, journalCsv(journal), true);
  add(`Debitoren_${period}.csv`, debtorsCsv(journal), true);

  const missingFiles: string[] = [];
  for (const entry of journal.entries) {
    const folder = entry.type === "CREDIT_NOTE" ? "Gutschriften" : "Rechnungen";
    if (entry.documentKey) {
      try {
        const pdf = await getObjectBuffer(entry.documentKey);
        add(`Belege/${folder}/${safeName(entry.number)}${entry.cancelled ? "_STORNIERT" : ""}.pdf`, pdf, false); // PDFs sind schon komprimiert
      } catch (error) {
        logger.warn({ err: error, number: entry.number }, "Beleg-PDF für das Belegpaket nicht lesbar");
        missingFiles.push(entry.number);
      }
    }
    if (entry.einvoice) add(`XRechnung/${safeName(entry.number)}_XRechnung.xml`, Buffer.from(buildCiiXml(entry.einvoice, "XRECHNUNG"), "utf8"), true);
  }

  add("Hinweise.txt", Buffer.from(readme(journal, settings, includesDatev, missingFiles), "utf8"), true);
  zip.end();
  await finished;
  if (failure) throw failure;
  return { files };
}

/** Komplettes Paket als Buffer – für den Versand per E-Mail. */
export async function accountingPackageBuffer(journal: Journal, settings: AccountingSettings, exportedBy: string): Promise<Buffer> {
  const chunks: Uint8Array[] = [];
  await writeAccountingPackage(journal, settings, exportedBy, (chunk) => chunks.push(chunk));
  return Buffer.concat(chunks);
}
