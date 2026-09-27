import { TAX_CASE_INFO } from "@fa/shared";
import type { DebtorInfo, Journal } from "./journal";

/**
 * CSV für Excel & Co.: UTF-8 mit BOM (Umlaute), Semikolon, Dezimalkomma, Datum TT.MM.JJJJ.
 */

const BOM = "﻿";
const CRLF = "\r\n";

function cell(value: string | number | undefined): string {
  if (value === undefined || value === "") return "";
  const text = String(value);
  return /[";\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

const euro = (cents: number) => (cents / 100).toFixed(2).replace(".", ",");
const germanDate = (day?: string) => (day ? `${day.slice(8, 10)}.${day.slice(5, 7)}.${day.slice(0, 4)}` : "");

const PAYMENT_LABEL: Record<string, string> = { PENDING: "offen", OVERDUE: "überfällig", PAID: "bezahlt", CANCELLED: "storniert" };
const METHOD_LABEL: Record<string, string> = { BANK_TRANSFER: "Überweisung", CASH: "bar" };

function toCsv(rows: Array<Array<string | number | undefined>>): Buffer {
  return Buffer.from(BOM + rows.map((row) => row.map(cell).join(";")).join(CRLF) + CRLF, "utf8");
}

/** Rechnungsausgangsbuch: ein Beleg je Zeile, bei gemischten Steuersätzen je Steuerfall eine Zeile. */
export function journalCsv(journal: Journal): Buffer {
  const rows: Array<Array<string | number | undefined>> = [
    [
      "Belegart",
      "Belegnummer",
      "Belegdatum",
      "Leistungsdatum",
      "Kundennummer",
      "Kunde",
      "Debitor",
      "Steuerfall",
      "Erlöskonto",
      "Netto",
      "USt",
      "Brutto",
      "Zahlstatus",
      "Bezahlt am",
      "Zahlart",
      "Quelle",
      "E-Rechnung",
      "Hinweis",
    ],
  ];
  for (const entry of journal.entries) {
    for (const part of entry.parts) {
      const sign = entry.type === "CREDIT_NOTE" ? -1 : 1;
      rows.push([
        entry.type === "CREDIT_NOTE" ? "Gutschrift" : "Rechnung",
        entry.number,
        germanDate(entry.issueDate),
        germanDate(entry.serviceDate),
        entry.customerNumber,
        entry.customerName + (entry.customerDeleted ? " (Konto gelöscht)" : ""),
        entry.debtorAccount,
        TAX_CASE_INFO[part.taxCase].label,
        journal.byTax.find((row) => row.taxCase === part.taxCase)?.account ?? "",
        euro(sign * part.netCents),
        euro(sign * part.vatCents),
        euro(sign * (part.netCents + part.vatCents)),
        entry.paymentStatus ? PAYMENT_LABEL[entry.paymentStatus] : "",
        entry.paidAt ? germanDate(entry.paidAt.slice(0, 10)) : "",
        entry.paymentMethod ? METHOD_LABEL[entry.paymentMethod] : "",
        entry.source === "GENERATED" ? "Portal" : "Upload",
        entry.eInvoice ? "ZUGFeRD/XRechnung" : "",
        entry.note ?? "",
      ]);
    }
  }
  return toCsv(rows);
}

/** Debitorenliste – damit die Steuerberatung die Personenkonten beschriften kann. */
export function debtorsCsv(journal: Journal): Buffer {
  const debtors = new Map<number, DebtorInfo>();
  for (const entry of journal.entries) if (!debtors.has(entry.debtor.account)) debtors.set(entry.debtor.account, entry.debtor);
  const rows: Array<Array<string | number | undefined>> = [
    ["Konto", "Kundennummer", "Name", "Firma", "Straße", "PLZ", "Ort", "Land", "USt-IdNr.", "E-Mail"],
    ...[...debtors.values()]
      .sort((a, b) => a.account - b.account)
      .map((debtor) => [
        debtor.account,
        debtor.customerNumber,
        debtor.name,
        debtor.companyName,
        debtor.street,
        debtor.postalCode,
        debtor.city,
        debtor.countryCode,
        debtor.vatId,
        debtor.email,
      ]),
  ];
  return toCsv(rows);
}
