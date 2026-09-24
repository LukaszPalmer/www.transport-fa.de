import { AUTH_TOKEN_TYPES, type AuthTokenType } from "@fa/shared";
import { Schema } from "mongoose";
import { defineModel, ObjectId, type Id } from "../db/schema-kit";

/** Einmal-Links (E-Mail-Bestätigung, Passwort-Reset). */
export interface IAuthToken {
  _id: Id;
  type: AuthTokenType;
  userId: Id;
  tokenHash: string; // SHA-256; Einlösen per findOneAndDelete → garantiert einmalig, auch bei Doppelklick
  expiresAt: Date; // Bestätigung 24 Std., Reset 60 Min.
  createdAt: Date;
}

const AuthTokenSchema = new Schema<IAuthToken>(
  {
    type: { type: String, enum: AUTH_TOKEN_TYPES, required: true },
    userId: { type: ObjectId, ref: "User", required: true },
    tokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

AuthTokenSchema.index({ tokenHash: 1 }, { unique: true });
AuthTokenSchema.index({ userId: 1, type: 1 }); // neuer Link ersetzt alte desselben Typs
AuthTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const AuthToken = defineModel("AuthToken", AuthTokenSchema);
