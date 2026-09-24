import {
  effectivePaymentStatus,
  INVOICE_TYPES,
  PAYMENT_STATUSES,
  type InvoiceType,
  type PaymentStatus,
} from "@fa/shared";
import { Schema } from "mongoose";
import { centsField, defineModel, ObjectId, type Id } from "../db/schema-kit";

/**
 * Belege aus der Buchhaltungssoftware: PDF-Upload + Eckdaten.
 * Rechnungen, Angebote, Auftragsbestätigungen und Gutschriften in einer Collection.
 */
export interface IInvoice {
  _id: Id;
  type: InvoiceType;
  number: string; // aus der Buchhaltung, z. B. "RE-2026-0042"
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
  paymentStatus?: PaymentStatus; // INVOICE / CREDIT_NOTE – OVERDUE wird abgeleitet
  paidAt?: Date;
  createdById: Id; // Mitarbeiter
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema = new Schema<IInvoice>(
  {
    type: { type: String, enum: INVOICE_TYPES, required: true },
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
    paidAt: Date,
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
});

InvoiceSchema.virtual("effectivePaymentStatus").get(function (this: IInvoice) {
  return effectivePaymentStatus(this.paymentStatus, this.dueDate);
});

InvoiceSchema.index({ type: 1, number: 1 }, { unique: true });
InvoiceSchema.index({ customerId: 1, issueDate: -1 });
InvoiceSchema.index({ paymentStatus: 1, dueDate: 1 }); // Überfällige: { paymentStatus: "PENDING", dueDate: { $lt: now } }

export const Invoice = defineModel("Invoice", InvoiceSchema);
