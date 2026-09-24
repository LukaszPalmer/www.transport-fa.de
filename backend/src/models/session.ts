import { ROLES, type Role } from "@fa/shared";
import { Schema } from "mongoose";
import { defineModel, ObjectId, type Id } from "../db/schema-kit";

/**
 * Serverseitige Sitzungen: sofort widerrufbar (Logout überall, Passwort-Reset,
 * Kontolöschung). Im Cookie steht nur ein Zufallstoken, hier nur dessen Hash.
 */
export interface ISession {
  _id: Id;
  tokenHash: string; // SHA-256 des Cookie-Werts
  userId: Id;
  role: Role; // denormalisiert: Rechteprüfung ohne zweite Abfrage
  mfaVerified: boolean; // ADMIN: erst nach TOTP-Eingabe true
  reauthenticatedAt?: Date; // "Sudo-Modus" (5 Min.) für Konto löschen, Passwort/2FA ändern
  expiresAt: Date; // gleitend: Kunde 14 Tage, Admin 12 Stunden
  lastSeenAt: Date;
  ip?: string;
  userAgent?: string;
  createdAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    tokenHash: { type: String, required: true },
    userId: { type: ObjectId, ref: "User", required: true },
    role: { type: String, enum: ROLES, required: true },
    mfaVerified: { type: Boolean, default: false },
    reauthenticatedAt: Date,
    expiresAt: { type: Date, required: true },
    lastSeenAt: { type: Date, default: Date.now },
    ip: { type: String, maxlength: 64 },
    userAgent: { type: String, maxlength: 500 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

SessionSchema.index({ tokenHash: 1 }, { unique: true });
SessionSchema.index({ userId: 1 });
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // MongoDB löscht abgelaufene Sitzungen selbst

export const Session = defineModel("Session", SessionSchema);
