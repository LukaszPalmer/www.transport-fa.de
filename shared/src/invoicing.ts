import { z } from "zod";
import { PAYMENT_METHODS, type ServiceSlug, type ShipmentStatus } from "./domain";

/**
 * Rechnungen im Portal erstellen: E-Rechnung nach EN 16931 (ZUGFeRD-PDF mit eingebetteter
 * XML, zusätzlich XRechnung). Summen rechnen Editor und API mit derselben Funktion.
 */

const objectId = z.string().regex(/^[a-f0-9]{24}$/, "Ungültige ID.");
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Höchstens ${max} Zeichen.`)
    .optional()
    .transform((value) => value || undefined);
const optionalDay = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Bitte ein Datum wählen.")
  .optional()
  .or(z.literal("").transform(() => undefined));

/** Mengeneinheiten nach UN/ECE Recommendation 20 – der Code steht in der XML, die Kurzform auf der PDF. */
export const INVOICE_UNITS = ["LS", "C62", "HUR", "DAY", "KMT", "MTQ", "TNE"] as const;
export type InvoiceUnit = (typeof INVOICE_UNITS)[number];

export const INVOICE_UNIT_INFO: Record<InvoiceUnit, { label: string; short: string }> = {
  LS: { label: "Pauschal", short: "psch." },
  C62: { label: "Stück", short: "Stk." },
  HUR: { label: "Stunden", short: "Std." },
  DAY: { label: "Tage", short: "Tg." },
  KMT: { label: "Kilometer", short: "km" },
  MTQ: { label: "Kubikmeter", short: "m³" },
  TNE: { label: "Tonnen", short: "t" },
};

export const VAT_RATES = [19, 7] as const;
export type VatRate = (typeof VAT_RATES)[number];

/** Steuerfall der ganzen Rechnung – bestimmt die USt-Kategorie in der E-Rechnung. */
export const TAX_TREATMENTS = ["STANDARD", "REVERSE_CHARGE", "EXEMPT"] as const;
export type TaxTreatment = (typeof TAX_TREATMENTS)[number];

export const TAX_TREATMENT_INFO: Record<TaxTreatment, { label: string; description: string }> = {
  STANDARD: { label: "Mit Umsatzsteuer", description: "Deutsche Umsatzsteuer – 19 % oder 7 % je Position." },
  REVERSE_CHARGE: {
    label: "Reverse Charge (EU-Unternehmen)",
    description: "Leistung an ein Unternehmen im EU-Ausland: Der Kunde schuldet die Steuer. Seine USt-IdNr. ist Pflicht.",
  },
  EXEMPT: { label: "Steuerfrei", description: "Z. B. grenzüberschreitende Güterbeförderung. Die Begründung erscheint auf der Rechnung." },
};

/** Pflichthinweis auf der Rechnung bei Reverse Charge (§ 14a Abs. 5 UStG). */
export const REVERSE_CHARGE_NOTE = "Steuerschuldnerschaft des Leistungsempfängers (Reverse Charge).";
export const DEFAULT_EXEMPTION_REASON = "Steuerfreie grenzüberschreitende Güterbeförderung gemäß § 4 Nr. 3 UStG.";

/** Vorbelegte Anrede und Einleitung – im Editor änderbar. */
export function defaultInvoiceIntro(customer: { type: "PRIVATE" | "BUSINESS"; firstName: string; lastName: string }): string {
  const salutation = customer.type === "BUSINESS" ? "Sehr geehrte Damen und Herren," : `Guten Tag ${customer.firstName} ${customer.lastName},`;
  return `${salutation}\n\nvielen Dank für Ihren Auftrag und das entgegengebrachte Vertrauen. Für unsere Leistungen stellen wir Ihnen Folgendes in Rechnung:`;
}

export function defaultInvoiceClosing(companyName: string): string {
  return `Mit freundlichen Grüßen\nIhr Team von ${companyName}`;
}

/** Zahlungsziele im Editor (Tage ab Rechnungsdatum). */
export const PAYMENT_TERMS = [0, 7, 14, 30] as const;

export const MAX_INVOICE_LINES = 50;
const MAX_QUANTITY = 100_000;
const MAX_UNIT_PRICE_CENTS = 10_000_000; // 100.000 € je Einheit

// --- Entwurf (wird gespeichert, darf unvollständig sein) -------------------------------------

export const InvoiceLineInput = z.object({
  description: z.string().trim().max(1000, "Höchstens 1000 Zeichen.").default(""),
  quantity: z
    .number({ error: "Bitte eine Menge eingeben." })
    .min(0, "Die Menge darf nicht negativ sein.")
    .max(MAX_QUANTITY, "Die Menge ist zu hoch.")
    .refine((value) => Math.abs(value * 1000 - Math.round(value * 1000)) < 1e-6, "Höchstens drei Nachkommastellen."),
  unit: z.enum(INVOICE_UNITS).default("LS"),
  unitPriceCents: z
    .number({ error: "Bitte einen Preis eingeben." })
    .int("Bitte einen gültigen Preis eingeben.")
    .min(0, "Der Preis darf nicht negativ sein.")
    .max(MAX_UNIT_PRICE_CENTS, "Der Preis ist zu hoch."),
  vatRate: z.union([z.literal(19), z.literal(7)]).default(19),
});
export type InvoiceLineInput = z.input<typeof InvoiceLineInput>;
export type InvoiceLine = z.output<typeof InvoiceLineInput>;

export const InvoiceBuyerInput = z.object({
  companyName: optionalText(200),
  /** Privatperson bzw. Ansprechpartner beim Firmenkunden. */
  name: optionalText(200),
  line1: optionalText(200),
  line2: optionalText(200),
  postalCode: optionalText(12),
  city: optionalText(100),
  countryCode: z.string().trim().toUpperCase().regex(/^[A-Z]{2}$/, "Ländercode, z. B. DE").default("DE"),
  vatId: z
    .string()
    .trim()
    .toUpperCase()
    .transform((value) => value.replace(/[\s.-]/g, ""))
    .pipe(z.string().max(20, "Die USt-IdNr. ist zu lang.").regex(/^([A-Z]{2}[A-Z0-9]{2,13})?$/, "USt-IdNr. mit Ländercode, z. B. ATU12345678"))
    .optional()
    .transform((value) => value || undefined),
});
export type InvoiceBuyerInput = z.input<typeof InvoiceBuyerInput>;
export type InvoiceBuyer = z.output<typeof InvoiceBuyerInput>;

export const InvoiceDraftInput = z.object({
  customerId: objectId,
  shipmentId: objectId.optional().or(z.literal("").transform(() => undefined)),
  buyer: InvoiceBuyerInput,
  /** Leistungsdatum bzw. Beginn des Leistungszeitraums (Pflichtangabe nach § 14 UStG). */
  serviceFrom: optionalDay,
  serviceTo: optionalDay,
  paymentTermDays: z.number().int().min(0).max(120).default(14),
  /** „Ihre Referenz“ – bei Behörden die Leitweg-ID. */
  buyerReference: optionalText(100),
  taxTreatment: z.enum(TAX_TREATMENTS).default("STANDARD"),
  exemptionReason: optionalText(300),
  lines: z.array(InvoiceLineInput).max(MAX_INVOICE_LINES, `Höchstens ${MAX_INVOICE_LINES} Positionen.`).default([]),
  introText: optionalText(2000),
  closingText: optionalText(2000),
});
export type InvoiceDraftInput = z.input<typeof InvoiceDraftInput>;
export type InvoiceDraftContent = z.output<typeof InvoiceDraftInput>;

/**
 * Was vor dem Versand noch fehlt – Schlüssel wie im Formular („buyer.city“, „lines.0.description“).
 * Leeres Objekt = die Rechnung kann erstellt werden.
 */
export function invoiceIssueProblems(content: InvoiceDraftContent): Record<string, string> {
  const problems: Record<string, string> = {};
  const { buyer } = content;
  if (!buyer.companyName && !buyer.name) problems["buyer.name"] = "Bitte Name oder Firma des Rechnungsempfängers angeben.";
  if (!buyer.line1) problems["buyer.line1"] = "Straße und Hausnummer fehlen.";
  if (!buyer.postalCode) problems["buyer.postalCode"] = "PLZ fehlt.";
  if (!buyer.city) problems["buyer.city"] = "Ort fehlt.";

  if (!content.serviceFrom) problems.serviceFrom = "Bitte das Leistungsdatum angeben – es ist Pflicht auf jeder Rechnung.";
  if (content.serviceFrom && content.serviceTo && content.serviceTo < content.serviceFrom) problems.serviceTo = "Das Ende liegt vor dem Beginn.";

  if (content.taxTreatment === "REVERSE_CHARGE" && !buyer.vatId) problems["buyer.vatId"] = "Bei Reverse Charge ist die USt-IdNr. des Kunden Pflicht.";
  if (content.taxTreatment === "EXEMPT" && !content.exemptionReason) problems.exemptionReason = "Bitte begründen, warum die Leistung steuerfrei ist.";

  if (content.lines.length === 0) problems.lines = "Bitte mindestens eine Position erfassen.";
  content.lines.forEach((line, index) => {
    if (!line.description) problems[`lines.${index}.description`] = "Bitte die Leistung beschreiben.";
    if (!(line.quantity > 0)) problems[`lines.${index}.quantity`] = "Die Menge muss größer als 0 sein.";
  });
  if (content.lines.length > 0 && computeInvoiceTotals(content.lines, content.taxTreatment).grossCents <= 0) {
    problems.lines ??= "Der Rechnungsbetrag muss größer als 0 € sein.";
  }
  return problems;
}

// --- Summen nach EN 16931 ---------------------------------------------------------------------

/** USt-Kategorie (UNTDID 5305): S = Normal-/ermäßigter Satz, AE = Reverse Charge, E = steuerfrei. */
export type VatCategory = "S" | "AE" | "E";

export interface VatBreakdown {
  category: VatCategory;
  rate: number;
  basisCents: number;
  taxCents: number;
}

export interface InvoiceTotals {
  lineNetCents: number[];
  netCents: number;
  vatCents: number;
  grossCents: number;
  breakdown: VatBreakdown[];
}

/** Positionsbetrag in Cent: Menge (max. 3 Nachkommastellen) × Einzelpreis, kaufmännisch gerundet. */
export function lineNetCents(line: Pick<InvoiceLine, "quantity" | "unitPriceCents">): number {
  return Math.round((Math.round(line.quantity * 1000) * line.unitPriceCents) / 1000);
}

export function vatCategoryFor(taxTreatment: TaxTreatment): VatCategory {
  return taxTreatment === "REVERSE_CHARGE" ? "AE" : taxTreatment === "EXEMPT" ? "E" : "S";
}

/** Steuer je Satz auf die Summe der Positionen (nicht je Position) – so verlangt es EN 16931 (BR-CO-17). */
export function computeInvoiceTotals(lines: Array<Pick<InvoiceLine, "quantity" | "unitPriceCents" | "vatRate">>, taxTreatment: TaxTreatment): InvoiceTotals {
  const category = vatCategoryFor(taxTreatment);
  const lineNet = lines.map(lineNetCents);
  const basisByRate = new Map<number, number>();
  lines.forEach((line, index) => {
    const rate = category === "S" ? line.vatRate : 0;
    basisByRate.set(rate, (basisByRate.get(rate) ?? 0) + lineNet[index]!);
  });
  const breakdown = [...basisByRate.entries()]
    .sort(([a], [b]) => b - a)
    .map(([rate, basisCents]) => ({ category, rate, basisCents, taxCents: Math.round((basisCents * rate) / 100) }));

  const netCents = lineNet.reduce((sum, cents) => sum + cents, 0);
  const vatCents = breakdown.reduce((sum, entry) => sum + entry.taxCents, 0);
  return { lineNetCents: lineNet, netCents, vatCents, grossCents: netCents + vatCents, breakdown };
}

// --- API-Verträge -----------------------------------------------------------------------------

export const IssueInvoiceInput = z.object({
  /** PDF (E-Rechnung) per E-Mail an den Kunden senden. */
  sendEmail: z.boolean().default(true),
  /** Schon bezahlt, z. B. bar beim Umzug – steht dann so auf der Rechnung. */
  paidWith: z.enum(PAYMENT_METHODS).optional(),
});
export type IssueInvoiceInput = z.input<typeof IssueInvoiceInput>;

export type InvoiceMailStatus = "SENT" | "FAILED" | "SKIPPED";

export interface InvoiceMailResult {
  status: InvoiceMailStatus;
  to?: string;
  /** Warum nicht gesendet wurde (SKIPPED/FAILED). */
  reason?: string;
}

export interface IssueInvoiceResponse {
  invoiceId: string;
  number: string;
  mail: InvoiceMailResult;
}

export interface InvoiceAddress {
  line1: string;
  line2?: string;
  postalCode: string;
  city: string;
  countryCode: string;
}

/** Alles, was der Editor zu einem Kunden braucht – Vorschläge füllt er selbst aus. */
export interface InvoiceEditorContext {
  customer: {
    id: string;
    customerNumber: string;
    type: "PRIVATE" | "BUSINESS";
    firstName: string;
    lastName: string;
    companyName?: string;
    vatId?: string;
    email: string;
    billingAddress?: InvoiceAddress;
    /** Nur bestätigte, aktive Konten bekommen Rechnungen per E-Mail. */
    mailBlockedReason?: string;
  };
  shipments: Array<{
    id: string;
    shipmentNumber: string;
    service: ServiceSlug;
    status: ShipmentStatus;
    pickup: InvoiceAddress;
    delivery: InvoiceAddress;
    customerReference?: string;
    /** Abschluss, sonst geplanter Termin (JJJJ-MM-TT). */
    serviceDate?: string;
    /** Rechnungsnummer, falls der Auftrag schon abgerechnet ist. */
    invoicedAs?: string;
  }>;
  /** Firmendaten, die noch Platzhalter sind – vor dem Livegang ersetzen. */
  sellerWarnings: string[];
  /** Voraussichtliche nächste Rechnungsnummer (endgültig beim Versand). */
  nextNumber: string;
}

export interface AdminInvoiceDraft {
  id: string;
  content: InvoiceDraftContent;
  customer: { id: string; customerNumber: string; name: string };
  updatedAt: string;
}

export interface AdminInvoiceDraftRow {
  id: string;
  customer: { id: string; customerNumber: string; name: string };
  shipment?: { id: string; shipmentNumber: string };
  grossCents: number;
  lineCount: number;
  updatedAt: string;
  updatedBy?: string;
}
