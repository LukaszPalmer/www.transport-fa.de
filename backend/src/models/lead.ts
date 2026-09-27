import { LEAD_SOURCES, LEAD_STATUSES, LEAD_TOPICS, type LeadSource, type LeadStatus, type LeadTopic } from "@fa/shared";
import { Schema } from "mongoose";
import { defineModel, ObjectId, type Id } from "../db/schema-kit";

export interface LeadNote {
  _id: Id;
  authorId?: Id; // fehlt, wenn der Mitarbeiter-Zugang gelöscht wurde
  body: string;
  createdAt: Date;
}

/**
 * Anfrage (Lead) aus dem Kontaktformular oder manuell erfasst (Telefon, MyHammer …) –
 * durchläuft die Pipeline Neu → Kontaktiert → Angebot → Gewonnen/Verloren.
 *
 * Datenschutz: Anfragen ohne Auftrag werden 6 Monate nach der letzten Aktivität automatisch
 * gelöscht (TTL auf expiresAt), gewonnene nach 3 Jahren.
 */
export interface ILead {
  _id: Id;
  number: string; // "A-2026-00017"
  status: LeadStatus;
  source: LeadSource;
  topic: LeadTopic;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  from?: string;
  to?: string;
  preferredDate?: string;
  message: string;
  callback: boolean;
  locale: "de" | "en";
  assignedToId?: Id; // → User (Mitarbeiter)
  customerId?: Id; // → CustomerProfile, sobald verknüpft
  followUpAt?: Date; // Wiedervorlage
  estimatedValueCents?: number;
  lostReason?: string;
  notes: LeadNote[];
  statusChangedAt: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const LeadNoteSchema = new Schema<LeadNote>(
  {
    authorId: { type: ObjectId, ref: "User" },
    body: { type: String, required: true, trim: true, maxlength: 2000 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

const LeadSchema = new Schema<ILead>(
  {
    number: { type: String, required: true },
    status: { type: String, enum: LEAD_STATUSES, default: "NEW" },
    source: { type: String, enum: LEAD_SOURCES, default: "WEBSITE" },
    topic: { type: String, enum: LEAD_TOPICS, required: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    company: { type: String, trim: true, maxlength: 120 },
    email: { type: String, lowercase: true, trim: true, maxlength: 254 },
    phone: { type: String, trim: true, maxlength: 40 },
    from: { type: String, trim: true, maxlength: 160 },
    to: { type: String, trim: true, maxlength: 160 },
    preferredDate: { type: String, trim: true, maxlength: 40 },
    message: { type: String, default: "", maxlength: 4000 },
    callback: { type: Boolean, default: false },
    locale: { type: String, enum: ["de", "en"], default: "de" },
    assignedToId: { type: ObjectId, ref: "User" },
    customerId: { type: ObjectId, ref: "CustomerProfile" },
    followUpAt: Date,
    estimatedValueCents: { type: Number, min: 0 },
    lostReason: { type: String, trim: true, maxlength: 300 },
    notes: { type: [LeadNoteSchema], default: [] },
    statusChangedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

LeadSchema.index({ number: 1 }, { unique: true });
LeadSchema.index({ status: 1, createdAt: -1 }); // Pipeline-Reiter
LeadSchema.index({ followUpAt: 1 }, { partialFilterExpression: { followUpAt: { $exists: true } } }); // fällige Wiedervorlagen
LeadSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Löschfrist
LeadSchema.index({ customerId: 1 }, { partialFilterExpression: { customerId: { $exists: true } } });

export const Lead = defineModel("Lead", LeadSchema);
