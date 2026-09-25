import type { AuthTokenType } from "@fa/shared";
import type { Types } from "mongoose";
import { randomToken, sha256 } from "../lib/crypto";
import { AuthToken } from "../models";

export const TOKEN_LIFETIME: Record<AuthTokenType, number> = {
  EMAIL_VERIFICATION: 24 * 60 * 60 * 1000,
  PASSWORD_RESET: 60 * 60 * 1000,
};

/** Stellt einen Einmal-Link aus. Ältere Links desselben Typs werden ungültig. */
export async function issueAuthToken(userId: Types.ObjectId, type: AuthTokenType): Promise<string> {
  const token = randomToken();
  await AuthToken.deleteMany({ userId, type });
  await AuthToken.create({ userId, type, tokenHash: sha256(token), expiresAt: new Date(Date.now() + TOKEN_LIFETIME[type]) });
  return token;
}

/** Löst einen Link genau einmal ein (atomar) und liefert die Nutzer-ID – sonst null. */
export async function consumeAuthToken(token: string, type: AuthTokenType): Promise<Types.ObjectId | null> {
  const entry = await AuthToken.findOneAndDelete({ tokenHash: sha256(token), type, expiresAt: { $gt: new Date() } }).lean();
  return entry?.userId ?? null;
}
