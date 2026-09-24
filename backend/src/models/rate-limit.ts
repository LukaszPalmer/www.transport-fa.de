import { Schema } from "mongoose";
import { defineModel } from "../db/schema-kit";

/** Feste Zeitfenster pro Schlüssel, z. B. "login:ip:<ip>" oder "login:email:<sha256>". */
export interface IRateLimit {
  _id: string;
  count: number;
  expiresAt: Date;
}

const RateLimitSchema = new Schema<IRateLimit>(
  {
    _id: { type: String, required: true },
    count: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
  },
  { versionKey: false },
);

RateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RateLimit = defineModel("RateLimit", RateLimitSchema);
