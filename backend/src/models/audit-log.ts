import { ROLES, type Role } from "@fa/shared";
import { Schema } from "mongoose";
import { defineModel, ObjectId, type Id } from "../db/schema-kit";

export const AUDIT_TARGET_TYPES = ["User", "CustomerProfile", "Shipment", "Invoice", "InvoiceDraft", "Document", "DriverProfile", "Lead"] as const;

/** Sicherheits- und Admin-Ereignisse (12 Monate). */
export interface IAuditLog {
  _id: Id;
  actorId?: Id; // fehlt bei anonymen Versuchen (z. B. Fehl-Login)
  actorRole?: Role;
  action: string; // "auth.login", "auth.login_failed", "invoice.created", "driver.history_exported" …
  targetType?: (typeof AUDIT_TARGET_TYPES)[number];
  targetId?: Id;
  customerId?: Id; // Tab "Aktivität" in der 360°-Ansicht + Kontolöschung
  ip?: string;
  meta?: Record<string, unknown>;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    actorId: { type: ObjectId, ref: "User" },
    actorRole: { type: String, enum: ROLES },
    action: { type: String, required: true, maxlength: 60 },
    targetType: { type: String, enum: AUDIT_TARGET_TYPES },
    targetId: ObjectId,
    customerId: { type: ObjectId, ref: "CustomerProfile" },
    ip: { type: String, maxlength: 64 },
    meta: Schema.Types.Mixed,
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

AuditLogSchema.index({ customerId: 1, createdAt: -1 });
AuditLogSchema.index({ actorId: 1, createdAt: -1 });
AuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 365 });

export const AuditLog = defineModel("AuditLog", AuditLogSchema);
