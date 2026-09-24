import { model, Schema, type Model, type Types } from "mongoose";

/** Gemeinsame Bausteine aller Modelle. */

export type Id = Types.ObjectId;
export const ObjectId = Schema.Types.ObjectId;

/** Internationale Telefonnummer, z. B. +4917612345678 */
export const E164 = /^\+[1-9]\d{6,14}$/;

/** Felder, die nie in einer API-Antwort landen dürfen – auch wenn sie explizit selektiert wurden. */
const SECRET_FIELDS = ["passwordHash", "mfa", "tokenHash"] as const;

function applyJsonOptions(schema: Schema): void {
  schema.set("toJSON", {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret: Record<string, unknown>) => {
      delete ret._id;
      for (const field of SECRET_FIELDS) delete ret[field];
      return ret;
    },
  });
  for (const child of schema.childSchemas) applyJsonOptions(child.schema);
}

/** Kompiliert ein Modell mit einheitlicher API-Ausgabe: `id` statt `_id`, kein `__v`, keine Geheimnisse. */
export function defineModel<T>(name: string, schema: Schema<T>): Model<T> {
  applyJsonOptions(schema as Schema);
  return model<T>(name, schema);
}

/** GeoJSON Point – Reihenfolge [Längengrad, Breitengrad]! */
export interface GeoPoint {
  type: "Point";
  coordinates: [lng: number, lat: number];
}

export const GeoPointSchema = new Schema<GeoPoint>(
  {
    type: { type: String, enum: ["Point"], default: "Point", required: true },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: (c: number[]) => c.length === 2 && Math.abs(c[0]!) <= 180 && Math.abs(c[1]!) <= 90,
        message: "Koordinaten müssen [lng, lat] sein",
      },
    },
  },
  { _id: false },
);

export interface Address {
  line1: string;
  line2?: string;
  postalCode: string;
  city: string;
  countryCode: string; // ISO 3166-1 alpha-2
}

export const AddressSchema = new Schema<Address>(
  {
    line1: { type: String, required: true, trim: true, maxlength: 200 },
    line2: { type: String, trim: true, maxlength: 200 },
    postalCode: { type: String, required: true, trim: true, maxlength: 12 },
    city: { type: String, required: true, trim: true, maxlength: 100 },
    countryCode: { type: String, required: true, uppercase: true, match: /^[A-Z]{2}$/, default: "DE" },
  },
  { _id: false },
);

/** Geldbetrag in Cent (Ganzzahl) – nie Fließkomma. */
export const centsField = {
  type: Number,
  required: true,
  min: 0,
  validate: { validator: Number.isInteger, message: "Betrag muss in Cent (Ganzzahl) angegeben werden" },
} as const;
