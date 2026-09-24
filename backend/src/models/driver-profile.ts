import { Schema } from "mongoose";
import { defineModel, E164, GeoPointSchema, ObjectId, type GeoPoint, type Id } from "../db/schema-kit";

/** Zugang der Fahrer-App zur GPS-API. Klartext-Token wird nur einmal angezeigt. */
export interface DeviceToken {
  _id: Id;
  tokenHash: string; // SHA-256 – schneller Hash genügt bei 256-Bit-Zufallstoken
  label: string; // "Pixel 8 – LKW 3"
  createdAt: Date;
  lastUsedAt?: Date;
  revokedAt?: Date;
}

export interface IDriverProfile {
  _id: Id;
  firstName: string;
  lastName: string;
  phone: string; // E.164 – für Kunden während aktiver Sendung sichtbar
  userId?: Id; // optionaler Login für die Android-App (Rolle DRIVER)
  vehicle?: { plate: string; label?: string };
  active: boolean;
  lastLocation?: GeoPoint; // denormalisiert für die Flottenkarte
  lastLocationAt?: Date;
  deviceTokens: DeviceToken[];
  createdAt: Date;
  updatedAt: Date;
}

const DeviceTokenSchema = new Schema<DeviceToken>({
  tokenHash: { type: String, required: true },
  label: { type: String, required: true, trim: true, maxlength: 80 },
  createdAt: { type: Date, default: Date.now },
  lastUsedAt: Date,
  revokedAt: Date,
});

const DriverProfileSchema = new Schema<IDriverProfile>(
  {
    firstName: { type: String, required: true, trim: true, maxlength: 100 },
    lastName: { type: String, required: true, trim: true, maxlength: 100 },
    phone: { type: String, required: true, match: E164 },
    userId: { type: ObjectId, ref: "User" },
    vehicle: new Schema(
      {
        plate: { type: String, required: true, uppercase: true, trim: true, maxlength: 15 },
        label: { type: String, trim: true, maxlength: 80 },
      },
      { _id: false },
    ),
    active: { type: Boolean, default: true },
    lastLocation: GeoPointSchema,
    lastLocationAt: Date,
    deviceTokens: { type: [DeviceTokenSchema], default: [], select: false },
  },
  { timestamps: true },
);

DriverProfileSchema.index({ lastLocation: "2dsphere" });
DriverProfileSchema.index({ active: 1, lastName: 1 });
DriverProfileSchema.index({ userId: 1 }, { unique: true, partialFilterExpression: { userId: { $exists: true } } });
DriverProfileSchema.index(
  { "deviceTokens.tokenHash": 1 },
  { unique: true, partialFilterExpression: { "deviceTokens.tokenHash": { $exists: true } } },
);

export const DriverProfile = defineModel("DriverProfile", DriverProfileSchema);
