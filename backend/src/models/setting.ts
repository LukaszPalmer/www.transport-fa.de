import { Schema } from "mongoose";
import { defineModel, ObjectId, type Id } from "../db/schema-kit";

/**
 * Einstellungen des Unternehmens als Schlüssel/Wert – z. B. "accounting" (DATEV-Beraternummer,
 * Kontenrahmen, Steuerberater). Der Inhalt wird beim Lesen und Schreiben per Zod geprüft.
 */
export interface ISetting {
  _id: string; // Schlüssel, z. B. "accounting"
  value: unknown;
  updatedById?: Id;
  createdAt: Date;
  updatedAt: Date;
}

const SettingSchema = new Schema<ISetting>(
  {
    _id: { type: String, required: true },
    value: { type: Schema.Types.Mixed, required: true },
    updatedById: { type: ObjectId, ref: "User" },
  },
  { timestamps: true, minimize: false },
);

export const Setting = defineModel("Setting", SettingSchema);
