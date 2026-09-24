import {
  EMAIL_PROVIDERS,
  EMAIL_STATUSES,
  EMAIL_TYPES,
  SENSITIVE_EMAIL_TYPES,
  type EmailProvider,
  type EmailStatus,
  type EmailType,
} from "@fa/shared";
import { Schema } from "mongoose";
import { defineModel, ObjectId, type Id } from "../db/schema-kit";

/** Jede ausgehende E-Mail – "Empfangene E-Mails" im Portal und Kommunikationslog im Admin. */
export interface IEmailLog {
  _id: Id;
  customerId?: Id;
  userId?: Id;
  type: EmailType;
  to: string;
  subject: string;
  bodyText?: string; // nie bei VERIFICATION/PASSWORD_RESET (Token-Links)
  documentIds: Id[];
  invoiceId?: Id;
  shipmentId?: Id;
  sentById?: Id; // Mitarbeiter bei manuellem Versand
  provider: EmailProvider;
  providerMessageId?: string; // Zuordnung der Zustell-Webhooks
  status: EmailStatus;
  error?: string;
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EmailLogSchema = new Schema<IEmailLog>(
  {
    customerId: { type: ObjectId, ref: "CustomerProfile" },
    userId: { type: ObjectId, ref: "User" },
    type: { type: String, enum: EMAIL_TYPES, required: true },
    to: { type: String, required: true, lowercase: true, trim: true, maxlength: 254 },
    subject: { type: String, required: true, maxlength: 300 },
    bodyText: { type: String, maxlength: 50_000 },
    documentIds: { type: [{ type: ObjectId, ref: "Document" }], default: [] },
    invoiceId: { type: ObjectId, ref: "Invoice" },
    shipmentId: { type: ObjectId, ref: "Shipment" },
    sentById: { type: ObjectId, ref: "User" },
    provider: { type: String, enum: EMAIL_PROVIDERS, required: true },
    providerMessageId: String,
    status: { type: String, enum: EMAIL_STATUSES, default: "QUEUED" },
    error: { type: String, maxlength: 2000 },
    sentAt: Date,
  },
  { timestamps: true },
);

EmailLogSchema.pre("validate", function () {
  if (SENSITIVE_EMAIL_TYPES.includes(this.type)) this.bodyText = undefined;
});

EmailLogSchema.index({ customerId: 1, createdAt: -1 });
EmailLogSchema.index({ providerMessageId: 1 }, { partialFilterExpression: { providerMessageId: { $exists: true } } });

export const EmailLog = defineModel("EmailLog", EmailLogSchema);
