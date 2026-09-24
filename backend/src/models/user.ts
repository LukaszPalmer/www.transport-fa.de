import { ROLES, USER_STATES, type Role, type UserState } from "@fa/shared";
import { Schema } from "mongoose";
import { defineModel, type Id } from "../db/schema-kit";

export interface UserMfa {
  secretEncrypted: string; // TOTP-Secret, AES-256-GCM mit MFA_ENCRYPTION_KEY
  enabledAt: Date;
  recoveryCodeHashes: string[];
}

export interface IUser {
  _id: Id;
  email: string; // kleingeschrieben, eindeutig
  emailVerifiedAt?: Date;
  passwordHash?: string; // Argon2id – fehlt bei reinen Google-Konten
  googleSub?: string; // stabile Google-Konto-ID
  name: string;
  avatarUrl?: string;
  role: Role;
  state: UserState;
  failedLoginCount: number;
  lockedUntil?: Date; // Sperre nach wiederholten Fehlversuchen
  lastLoginAt?: Date;
  passwordChangedAt?: Date;
  mfa?: UserMfa; // Pflicht für ADMIN
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, lowercase: true, trim: true, maxlength: 254 },
    emailVerifiedAt: Date,
    passwordHash: { type: String, select: false },
    googleSub: String,
    name: { type: String, required: true, trim: true, maxlength: 120 },
    avatarUrl: { type: String, maxlength: 2048 },
    role: { type: String, enum: ROLES, default: "CUSTOMER" },
    state: { type: String, enum: USER_STATES, default: "ACTIVE" },
    failedLoginCount: { type: Number, default: 0, min: 0 },
    lockedUntil: Date,
    lastLoginAt: Date,
    passwordChangedAt: Date,
    mfa: {
      type: new Schema<UserMfa>(
        {
          secretEncrypted: { type: String, required: true },
          enabledAt: { type: Date, required: true },
          recoveryCodeHashes: { type: [String], default: [] },
        },
        { _id: false },
      ),
      select: false,
    },
  },
  { timestamps: true },
);

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ googleSub: 1 }, { unique: true, partialFilterExpression: { googleSub: { $exists: true } } });
UserSchema.index({ role: 1, createdAt: -1 }); // Kundenliste im Admin

export const User = defineModel("User", UserSchema);
