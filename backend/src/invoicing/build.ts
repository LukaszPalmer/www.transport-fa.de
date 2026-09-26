import { computeInvoiceTotals, type InvoiceDraftContent, type PaymentMethod } from "@fa/shared";
import { sellerSnapshot } from "./seller";
import type { EInvoiceData, SellerSnapshot } from "./types";

/** Heutiger Kalendertag in deutscher Zeit (JJJJ-MM-TT). */
export function berlinToday(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin" }).format(now);
}

export function addDays(isoDay: string, days: number): string {
  const date = new Date(`${isoDay}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export interface BuildInvoiceInput {
  content: InvoiceDraftContent;
  number: string;
  issueDate: string;
  customerNumber: string;
  email: string;
  shipmentNumber?: string;
  /** Bei Rechnungsstellung bereits bezahlt. */
  paidWith?: PaymentMethod;
  seller?: SellerSnapshot;
}

/**
 * Entwurf + Kontext → vollständige Rechnungsdaten mit Summen. Für die Vorschau dürfen
 * Felder fehlen (leere Texte); beim Versand ist der Entwurf vorher vollständig geprüft.
 */
export function buildInvoiceData({ content, number, issueDate, customerNumber, email, shipmentNumber, paidWith, seller }: BuildInvoiceInput): EInvoiceData {
  const standard = content.taxTreatment === "STANDARD";
  const totals = computeInvoiceTotals(content.lines, content.taxTreatment);
  const { buyer } = content;

  return {
    number,
    issueDate,
    dueDate: addDays(issueDate, content.paymentTermDays),
    serviceFrom: content.serviceFrom ?? "",
    serviceTo: content.serviceTo,
    seller: seller ?? sellerSnapshot(),
    buyer: {
      customerNumber,
      companyName: buyer.companyName,
      name: buyer.name,
      line1: buyer.line1 ?? "",
      line2: buyer.line2,
      postalCode: buyer.postalCode ?? "",
      city: buyer.city ?? "",
      countryCode: buyer.countryCode,
      vatId: buyer.vatId,
      email,
    },
    buyerReference: content.buyerReference,
    shipmentNumber,
    taxTreatment: content.taxTreatment,
    exemptionReason: content.taxTreatment === "EXEMPT" ? content.exemptionReason : undefined,
    lines: content.lines.map((line, index) => ({
      description: line.description,
      quantity: line.quantity,
      unit: line.unit,
      unitPriceCents: line.unitPriceCents,
      vatRate: standard ? line.vatRate : 0,
      netCents: totals.lineNetCents[index]!,
    })),
    netCents: totals.netCents,
    vatCents: totals.vatCents,
    grossCents: totals.grossCents,
    breakdown: totals.breakdown,
    paymentTermDays: content.paymentTermDays,
    prepaid: paidWith ? { method: paidWith, cents: totals.grossCents } : undefined,
    introText: content.introText,
    closingText: content.closingText,
  };
}
