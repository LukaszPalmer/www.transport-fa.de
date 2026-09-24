import { PRESENCE_STATES, type PresenceState } from "@fa/shared";
import { Schema } from "mongoose";
import { defineModel, ObjectId, type Id } from "../db/schema-kit";

export interface IStaffProfile {
  _id: Id;
  userId: Id; // → User (ADMIN)
  displayName: string; // im Chat für Kunden sichtbar
  presence: PresenceState; // expliziter Schalter – Antworten im Chat nur bei ONLINE (serverseitig geprüft)
  presenceChangedAt: Date;
  soundEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const StaffProfileSchema = new Schema<IStaffProfile>(
  {
    userId: { type: ObjectId, ref: "User", required: true },
    displayName: { type: String, required: true, trim: true, maxlength: 60 },
    presence: { type: String, enum: PRESENCE_STATES, default: "OFFLINE" },
    presenceChangedAt: { type: Date, default: Date.now },
    soundEnabled: { type: Boolean, default: true },
  },
  { timestamps: true },
);

StaffProfileSchema.index({ userId: 1 }, { unique: true });

export const StaffProfile = defineModel("StaffProfile", StaffProfileSchema);
