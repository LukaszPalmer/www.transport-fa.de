import { PERMISSIONS, PRESENCE_STATES, type Permission, type PresenceState } from "@fa/shared";
import { Schema } from "mongoose";
import { defineModel, ObjectId, type Id } from "../db/schema-kit";

export interface IStaffProfile {
  _id: Id;
  userId: Id; // → User (ADMIN oder EMPLOYEE)
  displayName: string; // im Chat für Kunden sichtbar
  jobTitle?: string; // z. B. „Disposition"
  /** Rechte für EMPLOYEE – ADMIN hat unabhängig davon alle Rechte. */
  permissions: Permission[];
  presence: PresenceState; // expliziter Schalter – Antworten im Chat nur bei ONLINE (serverseitig geprüft)
  presenceChangedAt: Date;
  soundEnabled: boolean;
  createdById?: Id; // Admin, der den Zugang angelegt hat
  createdAt: Date;
  updatedAt: Date;
}

const StaffProfileSchema = new Schema<IStaffProfile>(
  {
    userId: { type: ObjectId, ref: "User", required: true },
    displayName: { type: String, required: true, trim: true, maxlength: 60 },
    jobTitle: { type: String, trim: true, maxlength: 60 },
    permissions: { type: [{ type: String, enum: PERMISSIONS }], default: [] },
    presence: { type: String, enum: PRESENCE_STATES, default: "OFFLINE" },
    presenceChangedAt: { type: Date, default: Date.now },
    soundEnabled: { type: Boolean, default: true },
    createdById: { type: ObjectId, ref: "User" },
  },
  { timestamps: true },
);

StaffProfileSchema.index({ userId: 1 }, { unique: true });

export const StaffProfile = defineModel("StaffProfile", StaffProfileSchema);
