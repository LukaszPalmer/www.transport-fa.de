import {
  effectivePaymentStatus,
  INVOICE_SOURCES,
  INVOICE_TYPES,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  type InvoiceSource,
  type InvoiceType,
  type PaymentMethod,
  type PaymentStatus,
} from "@fa/shared";
import { Schema } from "mongoose";
import { centsField, defineModel, ObjectId, type Id } from "../db/schema-kit";
import type { EInvoiceData } from "../invoicing/types";

/**
 * Belege: im Portal erstellte E-Rechnungen (GENERATED) und PDF-Uploads aus der
 * Buchhaltungssoftware (UPLOAD). Rechnungen, Angebote, Auftragsbestätigungen und
 * Gutschriften in einer Collection.
 */
export interface IInvoice {
  _id: Id;
  type: InvoiceType;
  source: InvoiceSource;
  number: string; // GENERATED: "RE-2026-00042" (fortlaufend), UPLOAD: aus der Buchhaltung
  customerId: Id; // → CustomerProfile
  shipmentId?: Id; // → Shipment
  documentId: Id; // → Document (PDF in R2)
  currency: "EUR";
  netCents: number;
  vatCents: number;
  grossCents: number;
  issueDate: Date;
  dueDate?: Date; // INVOICE
  validUntil?: Date; // OFFER
  paymentStatus?: PaymentStatus; // nur INVOICE – OVERDUE wird abgeleitet
  paymentMethod?: PaymentMethod; // bei PAID: Überweisung oder bar
  paidAt?: Date;
  /** Nur GENERATED: Rechnungsinhalt, beim Versand eingefroren – Quelle für die XML-Downloads. */
  einvoice?: EInvoiceData;
  /** Zuletzt per E-Mail mit PDF im Anhang an den Kunden gesendet. */
  emailedAt?: Date;
  emailedTo?: string;
  createdById: Id; // Mitarbeiter
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema = new Schema<IInvoice>(
  {
    type: { type: String, enum: INVOICE_TYPES, required: true },
    source: { type: String, enum: INVOICE_SOURCES, default: "UPLOAD" },
    number: { type: String, required: true, trim: true, maxlength: 40 },
    customerId: { type: ObjectId, ref: "CustomerProfile", required: true },
    shipmentId: { type: ObjectId, ref: "Shipment" },
    documentId: { type: ObjectId, ref: "Document", required: true },
    currency: { type: String, enum: ["EUR"], default: "EUR" },
    netCents: centsField,
    vatCents: centsField,
    grossCents: centsField,
    issueDate: { type: Date, required: true },
    dueDate: Date,
    validUntil: Date,
    paymentStatus: { type: String, enum: PAYMENT_STATUSES },
    paymentMethod: { type: String, enum: PAYMENT_METHODS },
    paidAt: Date,
    // Bereits vollständig geprüft (Zod + EN-16931-Summen) – Mixed hält den Snapshot unverändert.
    einvoice: { type: Schema.Types.Mixed, select: false },
    emailedAt: Date,
    emailedTo: { type: String, lowercase: true, trim: true, maxlength: 254 },
    createdById: { type: ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

InvoiceSchema.pre("validate", function () {
  if (this.netCents + this.vatCents !== this.grossCents) {
    this.invalidate("grossCents", "Netto + USt ergibt nicht den Bruttobetrag");
  }
  if (this.type === "INVOICE" && (!this.dueDate || !this.paymentStatus)) {
    this.invalidate("dueDate", "Eine Rechnung braucht Fälligkeitsdatum und Zahlstatus");
  }
  if (this.paymentStatus === "PAID" && !this.paidAt) this.paidAt = new Date();
  if (this.paymentStatus === "PAID" && !this.paymentMethod) this.invalidate("paymentMethod", "Bitte angeben, wie bezahlt wurde");
});

InvoiceSchema.virtual("effectivePaymentStatus").get(function (this: IInvoice) {
  return effectivePaymentStatus(this.paymentStatus, this.dueDate);
});

InvoiceSchema.index({ type: 1, number: 1 }, { unique: true });
InvoiceSchema.index({ customerId: 1, issueDate: -1 });
InvoiceSchema.index({ issueDate: -1 }); // Belegliste im Admin
InvoiceSchema.index({ shipmentId: 1, issueDate: -1 }, { partialFilterExpression: { shipmentId: { $exists: true } } }); // Rechnung je Auftrag
InvoiceSchema.index({ paymentStatus: 1, dueDate: 1 }); // Überfällige: { paymentStatus: "PENDING", dueDate: { $lt: now } }

export const Invoice = defineModel("Invoice", InvoiceSchema);
