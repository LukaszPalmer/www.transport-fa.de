import {
  ChangeEmailInput,
  ChangePasswordInput,
  DEFAULT_NOTIFICATION_PREFERENCES,
  DeleteAccountInput,
  NotificationPreferencesInput,
  UpdateLocaleInput,
  UpdateProfileInput,
  type AccountSettings,
} from "@fa/shared";
import { Router } from "express";
import type { Types } from "mongoose";
import { clearSessionCookie } from "../auth/cookies";
import { requireRole } from "../auth/middleware";
import { isPasswordPwned, verifyPassword } from "../auth/password";
import { consumeRateLimit } from "../auth/rate-limit";
import { AppError } from "../http/errors";
import { audit } from "../lib/audit";
import { logger } from "../lib/logger";
import { CustomerProfile, User } from "../models";
import { deleteCustomerAccount } from "../services/account-deletion";
import { changeCredentials } from "../services/credentials";
import { buildSearchText, toPostalAddress } from "../services/customers";

/** /api/v1/account – Selbstverwaltung des Kundenkontos (Einstellungen, Zugangsdaten, Löschung). */
export const accountRouter = Router();

accountRouter.use(requireRole("CUSTOMER"));

/** Google-Konten haben kein Passwort – dort gilt eine frische Anmeldung als Bestätigung. */
const REAUTH_WINDOW_MS = 10 * 60 * 1000;
const WRONG_PASSWORD = "Das Passwort ist nicht korrekt.";
const PWNED_PASSWORD = "Dieses Passwort ist aus Datenlecks bekannt. Bitte wählen Sie ein anderes.";

async function buildSettings(userId: Types.ObjectId): Promise<AccountSettings> {
  const [user, profile] = await Promise.all([
    User.findById(userId).select("+passwordHash").lean(),
    CustomerProfile.findOne({ userId }).lean(),
  ]);
  if (!user || !profile) throw AppError.unauthenticated();
  return {
    profile: {
      firstName: profile.firstName,
      lastName: profile.lastName,
      companyName: profile.companyName,
      phone: profile.phone,
      billingAddress: profile.billingAddress ? toPostalAddress(profile.billingAddress) : undefined,
      email: user.email,
      customerNumber: profile.customerNumber,
    },
    notifications: { ...DEFAULT_NOTIFICATION_PREFERENCES, ...profile.notifications },
    locale: profile.locale ?? "de",
    hasPassword: Boolean(user.passwordHash),
    googleLinked: Boolean(user.googleSub),
    emailVerified: Boolean(user.emailVerifiedAt),
    passwordChangedAt: user.passwordChangedAt?.toISOString(),
  };
}

/** Passwort bzw. frische Google-Anmeldung als Bestätigung für sensible Änderungen. */
async function confirmIdentity(auth: NonNullable<Express.Request["auth"]>, password: string | undefined, field: string): Promise<void> {
  const record = await User.findById(auth.user.id).select("+passwordHash").lean();
  if (!record) throw AppError.unauthenticated();
  if (record.passwordHash) {
    if (!password || !(await verifyPassword(record.passwordHash, password))) throw AppError.validation({ [field]: WRONG_PASSWORD }, WRONG_PASSWORD);
  } else if (Date.now() - auth.signedInAt.getTime() > REAUTH_WINDOW_MS) {
    throw new AppError(403, "REAUTH_REQUIRED", "Bitte melden Sie sich zur Bestätigung erneut mit Google an.");
  }
}

// --- Einstellungen ------------------------------------------------------------------

accountRouter.get("/settings", async (req, res) => {
  res.json(await buildSettings(req.auth!.user.id));
});

accountRouter.patch("/profile", async (req, res) => {
  const { user } = req.auth!;
  await consumeRateLimit(`profile:user:${user.id}`, 30, 15 * 60);
  const input = UpdateProfileInput.parse(req.body);

  const profile = await CustomerProfile.findOne({ userId: user.id }).lean();
  if (!profile) throw AppError.unauthenticated();

  const next = { ...profile, firstName: input.firstName, lastName: input.lastName, companyName: input.companyName, billingAddress: input.billingAddress };
  const set: Record<string, unknown> = {
    firstName: input.firstName,
    lastName: input.lastName,
    billingAddress: input.billingAddress,
    searchText: buildSearchText(next, user.email),
  };
  const unset: Record<string, 1> = {};
  if (input.companyName) set.companyName = input.companyName;
  else unset.companyName = 1;
  if (input.phone) set.phone = input.phone;
  else unset.phone = 1;
  await CustomerProfile.updateOne(
    { _id: profile._id },
    { $set: set, ...(Object.keys(unset).length ? { $unset: unset } : {}) },
    { runValidators: true },
  );
  await User.updateOne({ _id: user.id }, { name: `${input.firstName} ${input.lastName}` });
  audit(req, "account.profile_updated", { targetType: "CustomerProfile", targetId: profile._id, customerId: profile._id });

  res.json(await buildSettings(user.id));
});

accountRouter.patch("/notifications", async (req, res) => {
  const { user } = req.auth!;
  await consumeRateLimit(`profile:user:${user.id}`, 30, 15 * 60);
  const notifications = NotificationPreferencesInput.parse(req.body);
  await CustomerProfile.updateOne({ userId: user.id }, { notifications });
  res.json(await buildSettings(user.id));
});

/** Sprache für E-Mails – der Sprachumschalter im Portal ruft das bei jedem Wechsel auf. */
accountRouter.patch("/locale", async (req, res) => {
  const { user } = req.auth!;
  await consumeRateLimit(`profile:user:${user.id}`, 30, 15 * 60);
  const { locale } = UpdateLocaleInput.parse(req.body);
  await CustomerProfile.updateOne({ userId: user.id }, { locale });
  res.status(204).end();
});

// --- Zugangsdaten ------------------------------------------------------------------

/** Passwort ändern: altes Passwort prüfen, neues hashen, alle anderen Sitzungen beenden. */
accountRouter.post("/password", async (req, res) => {
  const auth = req.auth!;
  await consumeRateLimit(`password-change:user:${auth.user.id}`, 5, 15 * 60);
  const input = ChangePasswordInput.parse(req.body);

  const record = await User.findById(auth.user.id).select("+passwordHash").lean();
  if (!record?.passwordHash) {
    throw AppError.badRequest("Ihr Konto nutzt die Anmeldung mit Google. Ein Passwort legen Sie über „Passwort vergessen“ fest.");
  }
  if (!(await verifyPassword(record.passwordHash, input.currentPassword))) {
    audit(req, "account.password_change_failed", { targetType: "User", targetId: auth.user.id });
    throw AppError.validation({ currentPassword: "Das aktuelle Passwort ist nicht korrekt." });
  }
  if (await isPasswordPwned(input.newPassword)) throw AppError.validation({ newPassword: PWNED_PASSWORD });

  const result = await changeCredentials({ userId: auth.user.id, password: input.newPassword, changedBy: "self", keepSessionId: auth.sessionId });
  audit(req, "account.password_changed", { targetType: "User", targetId: auth.user.id, meta: { sessionsEnded: result.sessionsEnded } });

  res.json({ ok: true, sessionsEnded: result.sessionsEnded });
});

/** E-Mail ändern: Bestätigung per Passwort, danach muss die neue Adresse bestätigt werden. */
accountRouter.post("/email", async (req, res) => {
  const auth = req.auth!;
  await consumeRateLimit(`email-change:user:${auth.user.id}`, 5, 60 * 60);
  const input = ChangeEmailInput.parse(req.body);
  if (input.email === auth.user.email) throw AppError.validation({ email: "Das ist bereits Ihre aktuelle E-Mail-Adresse." });

  await confirmIdentity(auth, input.currentPassword, "currentPassword");
  const result = await changeCredentials({ userId: auth.user.id, email: input.email, changedBy: "self", keepSessionId: auth.sessionId });
  audit(req, "account.email_changed", { targetType: "User", targetId: auth.user.id, meta: { sessionsEnded: result.sessionsEnded } });

  res.json(await buildSettings(auth.user.id));
});

// --- Konto löschen ------------------------------------------------------------------

/**
 * Konto endgültig löschen (DSGVO Art. 17). Bestätigung per Passwort bzw. frischer
 * Google-Anmeldung plus Eingabe „LÖSCHEN". Bewusst ohne Audit-Eintrag: Danach
 * soll es keine personenbezogene Spur mehr geben.
 */
accountRouter.post("/delete", async (req, res) => {
  const auth = req.auth!;
  await consumeRateLimit(`delete:user:${auth.user.id}`, 5, 15 * 60);
  const input = DeleteAccountInput.parse(req.body);

  await confirmIdentity(auth, input.password, "password");

  await deleteCustomerAccount(auth.user.id);
  logger.info("Kundenkonto auf Wunsch gelöscht");
  clearSessionCookie(res);
  res.status(204).end();
});
