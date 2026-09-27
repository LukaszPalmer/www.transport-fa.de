import type { InvoiceUnit, PaymentMethod, TaxTreatment, VatBreakdown } from "@fa/shared";

/**
 * Inhalt einer im Portal erstellten Rechnung – beim Versand eingefroren (GoBD) und
 * einzige Quelle für PDF und XML. Datumswerte als Kalendertag JJJJ-MM-TT.
 */

export interface SellerSnapshot {
  name: string; // Firmierung, z. B. „FA Transport GmbH“
  tradeName: string;
  street: string;
  postalCode: string;
  city: string;
  countryCode: string;
  vatId?: string;
  taxNumber?: string;
  phone: string;
  email: string;
  website: string;
  registerCourt?: string;
  registerNumber?: string;
  managingDirectors?: string;
  /** „Geschäftsführer" bzw. „Inhaber" – fehlt bei Rechnungen von vor der Umstellung (dann Geschäftsführer). */
  ownerTitle?: string;
  bank: { name: string; iban: string; bic?: string };
}

export interface BuyerSnapshot {
  customerNumber: string;
  companyName?: string;
  /** Privatperson bzw. Ansprechpartner beim Firmenkunden. */
  name?: string;
  line1: string;
  line2?: string;
  postalCode: string;
  city: string;
  countryCode: string;
  vatId?: string;
  email: string;
}

export interface InvoiceLineSnapshot {
  description: string;
  quantity: number;
  unit: InvoiceUnit;
  unitPriceCents: number;
  /** 19 / 7 bei STANDARD, sonst 0. */
  vatRate: number;
  netCents: number;
}

export interface EInvoiceData {
  number: string;
  issueDate: string;
  dueDate: string;
  serviceFrom: string;
  serviceTo?: string;
  seller: SellerSnapshot;
  buyer: BuyerSnapshot;
  buyerReference?: string;
  shipmentNumber?: string;
  taxTreatment: TaxTreatment;
  exemptionReason?: string;
  lines: InvoiceLineSnapshot[];
  netCents: number;
  vatCents: number;
  grossCents: number;
  breakdown: VatBreakdown[];
  paymentTermDays: number;
  /** Bei Rechnungsstellung schon bezahlt (z. B. bar beim Umzug). */
  prepaid?: { method: PaymentMethod; cents: number };
  introText?: string;
  closingText?: string;
}

/** Offener Betrag laut Rechnung. */
export function amountDueCents(data: Pick<EInvoiceData, "grossCents" | "prepaid">): number {
  return data.grossCents - (data.prepaid?.cents ?? 0);
}
