import type { InvoiceDraftContent } from "@fa/shared";
import { Schema } from "mongoose";
import { defineModel, ObjectId, type Id } from "../db/schema-kit";

/**
 * Rechnungsentwurf im Admin-Bereich – nie für Kunden sichtbar. Beim Versand entsteht daraus
 * eine unveränderliche Rechnung (Invoice, source GENERATED) und der Entwurf wird gelöscht.
 * Rechnungsnummern werden erst beim Versand vergeben, damit die Folge lückenlos bleibt.
 */
export interface IInvoiceDraft {
  _id: Id;
  customerId: Id; // → CustomerProfile
  shipmentId?: Id; // → Shipment
  /** Formularinhalt, per Zod (InvoiceDraftInput) geprüft – darf noch unvollständig sein. */
  content: InvoiceDraftContent;
  createdById: Id;
  updatedById: Id;
  /** Versand läuft gerade – verhindert, dass derselbe Entwurf doppelt zur Rechnung wird. */
  issuingAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceDraftSchema = new Schema<IInvoiceDraft>(
  {
    customerId: { type: ObjectId, ref: "CustomerProfile", required: true },
    shipmentId: { type: ObjectId, ref: "Shipment" },
    content: { type: Schema.Types.Mixed, required: true },
    createdById: { type: ObjectId, ref: "User", required: true },
    updatedById: { type: ObjectId, ref: "User", required: true },
    issuingAt: Date,
  },
  { timestamps: true, minimize: false },
);

InvoiceDraftSchema.index({ updatedAt: -1 }); // Entwurfsliste
InvoiceDraftSchema.index({ customerId: 1 });
InvoiceDraftSchema.index({ shipmentId: 1 }, { partialFilterExpression: { shipmentId: { $exists: true } } });

export const InvoiceDraft = defineModel("InvoiceDraft", InvoiceDraftSchema);
