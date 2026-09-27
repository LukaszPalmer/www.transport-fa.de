import {
  effectivePaymentStatus,
  TAX_CASES,
  type AccountingJournalRow,
  type AccountingSettings,
  type AccountingSourceFilter,
  type AccountingTaxRow,
  type PaymentMethod,
  type TaxCase,
} from "@fa/shared";
import type { EInvoiceData } from "../invoicing/types";
import { berlinDay } from "../lib/berlin-time";
import { CustomerProfile, DocumentModel, Invoice, type IInvoice } from "../models";

/**
 * Rechnungsausgangsbuch und Buchungssätze für einen Zeitraum.
 *
 * Grundlage ist das Rechnungsdatum (Soll-Versteuerung). Gebucht wird je Steuerfall eine Zeile
 * „Debitor an Erlöskonto" – das Erlöskonto ist in DATEV ein Automatikkonto, die Umsatzsteuer
 * errechnet DATEV selbst. Gutschriften buchen umgekehrt (Haben), stornierte Rechnungen erscheinen
 * mit Gegenbuchung, Barzahlungen optional als „Kasse an Debitor" (Überweisungen kommen über den
 * Kontoauszug in die Buchhaltung).
 */

export interface TaxPart {
  taxCase: TaxCase;
  netCents: number;
  vatCents: number;
}

export interface JournalEntry extends AccountingJournalRow {
  parts: TaxPart[];
  /** Kunde für die Debitorenliste. */
  debtor: DebtorInfo;
  /** Beleg-PDF in R2 (ZUGFeRD bei erstellten Rechnungen). */
  documentKey?: string;
  documentName?: string;
  einvoice?: EInvoiceData;
  /** USt-IdNr. des Kunden – Pflicht in der DATEV-Zeile bei Reverse Charge. */
  buyerVatId?: string;
  cancelled: boolean;
}

export interface DebtorInfo {
  account: number;
  customerNumber: string;
  name: string;
  companyName?: string;
  street?: string;
  postalCode?: string;
  city?: string;
  countryCode?: string;
  vatId?: string;
  email?: string;
}

export interface Booking {
  invoiceNumber: string;
  kind: "INVOICE" | "CREDIT_NOTE" | "CANCELLATION" | "CASH_PAYMENT";
  /** Belegdatum JJJJ-MM-TT. */
  date: string;
  serviceDate?: string;
  grossCents: number;
  side: "S" | "H";
  account: number;
  contraAccount: number;
  text: string;
  taxCase?: TaxCase;
  vatId?: string;
}

export interface Journal {
  from: string;
  to: string;
  source: AccountingSourceFilter;
  entries: JournalEntry[];
  bookings: Booking[];
  byTax: AccountingTaxRow[];
  cashPayments: Array<{ number: string; date: string; grossCents: number; debtorAccount: number; customerName: string }>;
  warnings: string[];
}

const RATE_TOLERANCE = 0.004;

/** Steuerfall aus dem eingefrorenen E-Rechnungs-Inhalt – exakt, auch bei gemischten Sätzen. */
function partsFromEInvoice(data: EInvoiceData): TaxPart[] {
  return data.breakdown.map((entry) => ({
    taxCase: entry.category === "AE" ? "RC" : entry.category === "E" ? "EXEMPT" : entry.rate === 7 ? "S7" : "S19",
    netCents: entry.basisCents,
    vatCents: entry.taxCents,
  }));
}

/**
 * Hochgeladene Belege (z. B. aus Lexware) haben nur Netto und USt. Der Steuersatz wird aus dem
 * Verhältnis abgeleitet; gemischte 19/7-Belege werden rechnerisch aufgeteilt. Was nicht eindeutig
 * ist, bekommt einen Hinweis für die Steuerberatung.
 */
function partsFromAmounts(netCents: number, vatCents: number): { parts: TaxPart[]; note?: string } {
  if (netCents === 0) return { parts: [{ taxCase: "S19", netCents, vatCents }] };
  const ratio = vatCents / netCents;
  if (vatCents === 0) return { parts: [{ taxCase: "EXEMPT", netCents, vatCents: 0 }], note: "0 % USt – bitte Steuerfall prüfen (steuerfrei oder Reverse Charge)" };
  if (Math.abs(ratio - 0.19) < RATE_TOLERANCE) return { parts: [{ taxCase: "S19", netCents, vatCents }] };
  if (Math.abs(ratio - 0.07) < RATE_TOLERANCE) return { parts: [{ taxCase: "S7", netCents, vatCents }] };
  // Gemischt: net19 + net7 = net und 0,19·net19 + 0,07·net7 = vat
  const net19 = Math.round((vatCents - 0.07 * netCents) / 0.12);
  const net7 = netCents - net19;
  if (net19 > 0 && net7 > 0) {
    const vat19 = Math.round(net19 * 0.19);
    const vat7 = vatCents - vat19;
    if (Math.abs(vat7 - net7 * 0.07) <= 2) {
      return {
        parts: [
          { taxCase: "S19", netCents: net19, vatCents: vat19 },
          { taxCase: "S7", netCents: net7, vatCents: vat7 },
        ],
        note: "19 %/7 % aus den Beträgen aufgeteilt – bitte mit dem Beleg abgleichen",
      };
    }
  }
  return { parts: [{ taxCase: "S19", netCents, vatCents }], note: `Steuersatz nicht eindeutig (${(ratio * 100).toFixed(1)} %) – bitte prüfen` };
}

/** Debitorenkonto: Kundennummer K-10042 → 10042, sofern im Debitorenbereich; sonst Sammeldebitor. */
export function debtorAccountFor(customerNumber: string, settings: AccountingSettings): { account: number; fallback: boolean } {
  if (settings.debtorMode === "COLLECTIVE") return { account: settings.collectiveDebtorAccount, fallback: false };
  const min = 10 ** settings.accountLength;
  const max = 7 * 10 ** settings.accountLength - 1;
  const number = Number(customerNumber.replace(/\D/g, ""));
  if (Number.isInteger(number) && number >= min && number <= max) return { account: number, fallback: false };
  return { account: settings.collectiveDebtorAccount, fallback: true };
}

type InvoiceWithData = IInvoice & { einvoice?: EInvoiceData };

const dayStart = (day: string) => new Date(`${day}T00:00:00Z`);
const dayEnd = (day: string) => new Date(`${day}T23:59:59.999Z`);

/** Zahlungsdatum (Zeitpunkt) liegt im Zeitraum – in deutscher Zeit gerechnet. */
function paidWithin(paidAt: Date | undefined, from: string, to: string): boolean {
  if (!paidAt) return false;
  const day = berlinDay(paidAt);
  return day >= from && day <= to;
}

function shortText(value: string, max = 60): string {
  return value.replace(/[\r\n;"]+/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

export async function buildJournal(
  { from, to, source }: { from: string; to: string; source: AccountingSourceFilter },
  settings: AccountingSettings,
): Promise<Journal> {
  const sourceFilter = source === "GENERATED" ? { source: "GENERATED" as const } : {};
  const [invoices, cashCandidates] = await Promise.all([
    Invoice.find({ type: { $in: ["INVOICE", "CREDIT_NOTE"] }, issueDate: { $gte: dayStart(from), $lte: dayEnd(to) }, ...sourceFilter })
      .select("+einvoice")
      .sort({ issueDate: 1, number: 1 })
      .lean<InvoiceWithData[]>(),
    settings.includeCashPayments
      ? Invoice.find({
          type: "INVOICE",
          paymentStatus: "PAID",
          paymentMethod: "CASH",
          // Etwas Puffer wegen Zeitzone – die exakte Prüfung macht paidWithin().
          paidAt: { $gte: new Date(dayStart(from).getTime() - 86_400_000), $lte: new Date(dayEnd(to).getTime() + 86_400_000) },
          ...sourceFilter,
        })
          .select("number customerId archivedCustomer grossCents paidAt +einvoice")
          .lean<InvoiceWithData[]>()
      : Promise.resolve([] as InvoiceWithData[]),
  ]);

  const customerIds = [...new Set([...invoices, ...cashCandidates].map((invoice) => String(invoice.customerId)))];
  const [customers, documents] = await Promise.all([
    CustomerProfile.find({ _id: { $in: customerIds } }).select("customerNumber firstName lastName companyName vatId billingAddress").lean(),
    DocumentModel.find({ _id: { $in: invoices.map((invoice) => invoice.documentId) }, status: "READY" }).select("storage").lean(),
  ]);
  const customerById = new Map(customers.map((customer) => [String(customer._id), customer]));
  const documentById = new Map(documents.map((document) => [String(document._id), document]));

  const warnings = new Set<string>();
  const debtorFor = (invoice: InvoiceWithData): DebtorInfo => {
    const profile = customerById.get(String(invoice.customerId));
    const buyer = invoice.einvoice?.buyer;
    const customerNumber = profile?.customerNumber ?? invoice.archivedCustomer?.customerNumber ?? buyer?.customerNumber ?? "–";
    const personName = profile ? `${profile.firstName} ${profile.lastName}` : (invoice.archivedCustomer?.name ?? buyer?.name ?? "Unbekannt");
    const companyName = profile?.companyName ?? invoice.archivedCustomer?.companyName ?? buyer?.companyName;
    const { account, fallback } = debtorAccountFor(customerNumber, settings);
    if (fallback) warnings.add(`Kundennummer ${customerNumber} passt nicht in den Debitorenbereich – gebucht auf Sammeldebitor ${settings.collectiveDebtorAccount}.`);
    const address = profile?.billingAddress;
    return {
      account,
      customerNumber,
      name: personName,
      companyName,
      street: address?.line1 ?? buyer?.line1,
      postalCode: address?.postalCode ?? buyer?.postalCode,
      city: address?.city ?? buyer?.city,
      countryCode: address?.countryCode ?? buyer?.countryCode,
      vatId: profile?.vatId ?? buyer?.vatId,
      email: buyer?.email,
    };
  };

  const entries: JournalEntry[] = invoices.map((invoice) => {
    const debtor = debtorFor(invoice);
    const generated = invoice.source === "GENERATED" && invoice.einvoice;
    const derived = generated ? { parts: partsFromEInvoice(invoice.einvoice!) } : partsFromAmounts(invoice.netCents, invoice.vatCents);
    const document = documentById.get(String(invoice.documentId));
    const serviceDate = invoice.einvoice ? (invoice.einvoice.serviceTo ?? invoice.einvoice.serviceFrom) : undefined;
    return {
      id: String(invoice._id),
      type: invoice.type as "INVOICE" | "CREDIT_NOTE",
      number: invoice.number,
      issueDate: invoice.issueDate.toISOString().slice(0, 10),
      serviceDate,
      customerNumber: debtor.customerNumber,
      customerName: debtor.companyName || debtor.name,
      customerDeleted: !customerById.has(String(invoice.customerId)),
      debtorAccount: debtor.account,
      netCents: invoice.netCents,
      vatCents: invoice.vatCents,
      grossCents: invoice.grossCents,
      taxCases: [...new Set(derived.parts.map((part) => part.taxCase))],
      paymentStatus: effectivePaymentStatus(invoice.paymentStatus, invoice.dueDate),
      paymentMethod: invoice.paymentMethod as PaymentMethod | undefined,
      paidAt: invoice.paidAt?.toISOString(),
      source: invoice.source ?? "UPLOAD",
      eInvoice: Boolean(generated),
      note: "note" in derived ? derived.note : undefined,
      parts: derived.parts,
      debtor,
      documentKey: document?.storage.key,
      documentName: document?.storage.originalName,
      einvoice: invoice.einvoice,
      buyerVatId: invoice.einvoice?.buyer.vatId ?? debtor.vatId,
      cancelled: invoice.paymentStatus === "CANCELLED",
    };
  });

  for (const entry of entries) {
    if (!entry.documentKey) warnings.add(`${entry.number}: PDF fehlt im Speicher.`);
    if (entry.note) warnings.add(`${entry.number}: ${entry.note}.`);
    if (entry.parts.some((part) => part.taxCase === "RC") && !entry.buyerVatId) warnings.add(`${entry.number}: Reverse Charge ohne USt-IdNr. des Kunden.`);
  }

  // Buchungssätze
  const bookings: Booking[] = [];
  for (const entry of entries) {
    const isCredit = entry.type === "CREDIT_NOTE";
    const label = isCredit ? "Gutschrift" : "Rechnung";
    for (const part of entry.parts) {
      const base: Booking = {
        invoiceNumber: entry.number,
        kind: isCredit ? "CREDIT_NOTE" : "INVOICE",
        date: entry.issueDate,
        serviceDate: entry.serviceDate,
        grossCents: part.netCents + part.vatCents,
        side: isCredit ? "H" : "S",
        account: entry.debtorAccount,
        contraAccount: settings.accounts[part.taxCase],
        text: shortText(`${label} ${entry.number} ${entry.customerName}`),
        taxCase: part.taxCase,
        vatId: part.taxCase === "RC" ? entry.buyerVatId : undefined,
      };
      if (base.grossCents === 0) continue;
      bookings.push(base);
      if (entry.cancelled) bookings.push({ ...base, kind: "CANCELLATION", side: base.side === "S" ? "H" : "S", text: shortText(`Storno ${entry.number} ${entry.customerName}`) });
    }
  }

  const cashPayments: Journal["cashPayments"] = [];
  for (const invoice of cashCandidates) {
    if (!paidWithin(invoice.paidAt, from, to)) continue;
    const debtor = debtorFor(invoice);
    const date = berlinDay(invoice.paidAt!);
    cashPayments.push({ number: invoice.number, date, grossCents: invoice.grossCents, debtorAccount: debtor.account, customerName: debtor.companyName || debtor.name });
    bookings.push({
      invoiceNumber: invoice.number,
      kind: "CASH_PAYMENT",
      date,
      grossCents: invoice.grossCents,
      side: "S",
      account: settings.accounts.cash,
      contraAccount: debtor.account,
      text: shortText(`Barzahlung ${invoice.number} ${debtor.companyName || debtor.name}`),
    });
  }

  // Umsatzsteuer-Auswertung: Rechnungen minus Gutschriften, stornierte Rechnungen zählen nicht.
  const byTax = new Map<TaxCase, AccountingTaxRow>();
  for (const entry of entries) {
    if (entry.cancelled) continue;
    const sign = entry.type === "CREDIT_NOTE" ? -1 : 1;
    for (const part of entry.parts) {
      const row = byTax.get(part.taxCase) ?? { taxCase: part.taxCase, account: settings.accounts[part.taxCase], count: 0, netCents: 0, vatCents: 0, grossCents: 0 };
      row.count += 1;
      row.netCents += sign * part.netCents;
      row.vatCents += sign * part.vatCents;
      row.grossCents += sign * (part.netCents + part.vatCents);
      byTax.set(part.taxCase, row);
    }
  }

  return {
    from,
    to,
    source,
    entries,
    bookings,
    byTax: TAX_CASES.flatMap((taxCase) => (byTax.has(taxCase) ? [byTax.get(taxCase)!] : [])),
    cashPayments,
    warnings: [...warnings],
  };
}

/** Beginn des Wirtschaftsjahres, in dem ein Tag liegt (JJJJ-MM-01). */
export function fiscalYearStart(day: string, startMonth: number): string {
  const [year, month] = day.split("-").map(Number) as [number, number];
  const startYear = month >= startMonth ? year : year - 1;
  return `${startYear}-${String(startMonth).padStart(2, "0")}-01`;
}


/** Tabellenzeile für die Oberfläche – ohne interne Felder (PDF-Schlüssel, E-Rechnungsdaten …). */
export function toJournalRow(entry: JournalEntry): AccountingJournalRow {
  return {
    id: entry.id,
    type: entry.type,
    number: entry.number,
    issueDate: entry.issueDate,
    serviceDate: entry.serviceDate,
    customerNumber: entry.customerNumber,
    customerName: entry.customerName,
    customerDeleted: entry.customerDeleted,
    debtorAccount: entry.debtorAccount,
    netCents: entry.netCents,
    vatCents: entry.vatCents,
    grossCents: entry.grossCents,
    taxCases: entry.taxCases,
    paymentStatus: entry.paymentStatus,
    paymentMethod: entry.paymentMethod,
    paidAt: entry.paidAt,
    source: entry.source,
    eInvoice: entry.eInvoice,
    note: entry.note,
  };
}
