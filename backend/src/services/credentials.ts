import type { Types } from "mongoose";
import { hashPassword } from "../auth/password";
import { revokeAllSessions } from "../auth/sessions";
import { env } from "../config/env";
import { emailTakenError } from "../http/errors";
import { logger } from "../lib/logger";
import { sendMail } from "../mail/mailer";
import { securityNoticeMail, verificationMail } from "../mail/templates";
import { CustomerProfile, User } from "../models";
import { issueAuthToken } from "./auth-tokens";
import { buildSearchText } from "./customers";

/**
 * Zugangsdaten ändern – gemeinsam genutzt von den Kunden-Einstellungen und dem
 * Admin-Bereich. Passwörter werden neu gehasht (Argon2id) und sind nie auslesbar;
 * jede Änderung beendet Sitzungen und informiert die bisherige Adresse.
 */

export interface CredentialChange {
  userId: Types.ObjectId;
  email?: string;
  password?: string;
  changedBy: "self" | "staff";
  /** Eigene Änderung: die aktuelle Sitzung bleibt angemeldet. */
  keepSessionId?: Types.ObjectId;
}

export interface CredentialChangeResult {
  emailChanged: boolean;
  passwordChanged: boolean;
  sessionsEnded: number;
}

export async function changeCredentials({ userId, email, password, changedBy, keepSessionId }: CredentialChange): Promise<CredentialChangeResult> {
  const user = await User.findById(userId).lean();
  if (!user) throw new Error("Nutzer nicht gefunden");

  const newEmail = email && email !== user.email ? email : undefined;
  if (newEmail && (await User.exists({ email: newEmail, _id: { $ne: userId } }))) throw emailTakenError();

  const update: Record<string, unknown> = {};
  const unset: Record<string, 1> = {};
  if (newEmail) {
    update.email = newEmail;
    // Neue Adresse muss bestätigt werden (Kunden) – der Link geht an die neue Adresse.
    if (user.role === "CUSTOMER") unset.emailVerifiedAt = 1;
  }
  if (password) {
    update.passwordHash = await hashPassword(password);
    update.passwordChangedAt = new Date();
    update.failedLoginCount = 0;
    unset.lockedUntil = 1;
  }
  if (!newEmail && !password) return { emailChanged: false, passwordChanged: false, sessionsEnded: 0 };

  // Unique-Index auf email fängt parallele Änderungen ab (→ 409 über den Error-Handler).
  await User.updateOne({ _id: userId }, { ...update, ...(Object.keys(unset).length ? { $unset: unset } : {}) });

  const profile = user.role === "CUSTOMER" ? await CustomerProfile.findOne({ userId }).lean() : null;
  if (profile && newEmail) {
    await CustomerProfile.updateOne({ _id: profile._id }, { searchText: buildSearchText(profile, newEmail) });
  }

  const sessionsEnded = await revokeAllSessions(userId, { except: keepSessionId });
  const firstName = profile?.firstName ?? (user.name.split(" ")[0] || user.name);
  const loginPath = user.role === "CUSTOMER" ? "/kundenportal/anmelden" : "/admin/login";

  const mails: Promise<boolean>[] = [
    sendMail({
      type: "SECURITY_NOTICE",
      to: user.email, // bisherige Adresse – so fällt ein Missbrauch auf
      userId,
      customerId: profile?._id,
      ...securityNoticeMail({
        firstName,
        changedBy,
        passwordChanged: Boolean(password),
        newEmail,
        loginUrl: new URL(loginPath, env.FRONTEND_URL).toString(),
        account: user.role === "CUSTOMER" ? "customer" : "staff",
      }),
    }),
  ];
  if (newEmail && user.role === "CUSTOMER") {
    const token = await issueAuthToken(userId, "EMAIL_VERIFICATION");
    const url = new URL(`/kundenportal/email-bestaetigen?token=${token}`, env.FRONTEND_URL).toString();
    mails.push(sendMail({ type: "VERIFICATION", to: newEmail, userId, customerId: profile?._id, ...verificationMail(firstName, url, "change") }));
  }
  await Promise.all(mails).catch((error: unknown) => logger.error({ err: error }, "Hinweis-Mails zu Zugangsdaten fehlgeschlagen"));

  return { emailChanged: Boolean(newEmail), passwordChanged: Boolean(password), sessionsEnded };
}
