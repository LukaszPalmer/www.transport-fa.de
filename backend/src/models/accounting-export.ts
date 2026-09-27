import { Schema } from "mongoose";
import { defineModel, ObjectId, type Id } from "../db/schema-kit";

export const ACCOUNTING_EXPORT_KINDS = ["DATEV", "ZIP", "JOURNAL", "EMAIL"] as const;

/** Übergaben an die Steuerberatung – damit nachvollziehbar ist, welcher Zeitraum wann rausging. */
export interface IAccountingExport {
  _id: Id;
  kind: (typeof ACCOUNTING_EXPORT_KINDS)[number];
  from: string; // JJJJ-MM-TT
  to: string;
  source: "ALL" | "GENERATED";
  count: number;
  grossCents: number;
  createdById?: Id;
  sentTo?: string;
  createdAt: Date;
}

const AccountingExportSchema = new Schema<IAccountingExport>(
  {
    kind: { type: String, enum: ACCOUNTING_EXPORT_KINDS, required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    source: { type: String, enum: ["ALL", "GENERATED"], default: "ALL" },
    count: { type: Number, default: 0 },
    grossCents: { type: Number, default: 0 },
    createdById: { type: ObjectId, ref: "User" },
    sentTo: { type: String, maxlength: 254 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

AccountingExportSchema.index({ createdAt: -1 });

export const AccountingExport = defineModel("AccountingExport", AccountingExportSchema);
