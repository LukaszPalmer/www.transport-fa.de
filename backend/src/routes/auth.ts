import {
  ForgotPasswordInput,
  isStaffRole,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  VerifyEmailInput,
  type AuthProvidersResponse,
  type Locale,
  type Role,
} from "@fa/shared";
import { Router, type Request, type Response } from "express";
import mongoose, { type Types } from "mongoose";
import { clearOAuthCookie, clearSessionCookie, SESSION_COOKIE, setOAuthCookie, setSessionCookie } from "../auth/cookies";
import { createGoogleAuthorization, exchangeGoogleCode, googleEnabled, type GoogleProfile } from "../auth/google";
import { requireAuth } from "../auth/middleware";
import { hashPassword, isPasswordPwned, verifyAgainstDummy, verifyPassword } from "../auth/password";
import { consumeRateLimit, emailKey } from "../auth/rate-limit";
import { createSession, revokeAllSessions, revokeSession } from "../auth/sessions";
import { env } from "../config/env";
import { AppError, emailTakenError } from "../http/errors";
import { audit } from "../lib/audit";
import { customerLocaleOf, requestLocale } from "../lib/locale";
import { logger } from "../lib/logger";
import { sendMail } from "../mail/mailer";
import { passwordResetMail, verificationMail, welcomeMail } from "../mail/templates";
import { CustomerProfile, User, type IUser } from "../models";
import { consumeAuthToken, issueAuthToken } from "../services/auth-tokens";
import { createCustomerProfile } from "../services/customers";
import { buildMeResponse } from "../services/me";

/**
 * /api/v1/auth – Registrierung, Anmeldung (E-Mail + Google), Abmeldung,
 * E-Mail-Bestätigung und Passwort-Reset für das Kundenportal.
 */
export const authRouter = Router();

const MAX_FAILED_LOGINS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;
const INVALID_CREDENTIALS = "E-Mail-Adresse oder Passwort ist nicht korrekt.";
const PWNED_PASSWORD = "Dieses Passwort ist aus Datenlecks bekannt. Bitte wählen Sie ein anderes.";

const LANDING: Record<Role, string> = { CUSTOMER: "/kundenportal", EMPLOYEE: "/admin", ADMIN: "/admin", DRIVER: "/" };
const LOGIN_PAGE = "/kundenportal/anmelden";

const OAUTH_STATE = "fa_oauth_state";
const OAUTH_VERIFIER = "fa_oauth_verifier";
const OAUTH_REDIRECT = "fa_oauth_redirect";

/** Nur interne Pfade als Rücksprungziel (verhindert Open Redirects). */
function safeRedirectPath(value: unknown): string | undefined {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/\\")
    ? value
    : undefined;
}

function frontendUrl(path: string): string {
  return new URL(path, env.FRONTEND_URL).toString();
}

async function startSession(req: Request, res: Response, user: Pick<IUser, "_id" | "role">, persistent: boolean) {
  const { token, cookieMaxAgeMs } = await createSession(user, req, { persistent });
  setSessionCookie(res, token, cookieMaxAgeMs);
}

async function sendVerificationMail(user: Pick<IUser, "_id" | "email" | "name">, customerId?: Types.ObjectId) {
  const token = await issueAuthToken(user._id, "EMAIL_VERIFICATION");
  const locale = await customerLocaleOf(user._id);
  const mail = verificationMail(user.name.split(" ")[0] || user.name, frontendUrl(`/kundenportal/email-bestaetigen?token=${token}`), "register", locale);
  await sendMail({ type: "VERIFICATION", to: user.email, userId: user._id, customerId, ...mail });
}

/** Persönliche Willkommens-Mail, sobald das Kundenkonto aktiv ist – blockiert die Antwort nicht. */
function sendWelcomeMail(user: Pick<IUser, "_id" | "email">, signInMethod: "google" | "password"): void {
  CustomerProfile.findOne({ userId: user._id })
    .lean()
    .then(async (profile) => {
      if (!profile) return;
      const mail = welcomeMail({
        firstName: profile.firstName,
        email: user.email,
        customerNumber: profile.customerNumber,
        signInMethod,
        portalUrl: frontendUrl("/kundenportal"),
        locale: profile.locale,
      });
      await sendMail({ type: "WELCOME", to: user.email, userId: user._id, customerId: profile._id, ...mail });
    })
    .catch((error: unknown) => logger.error({ err: error }, "Willkommens-Mail konnte nicht vorbereitet werden"));
}

// --- Status -----------------------------------------------------------------

authRouter.get("/providers", (_req, res) => {
  const body: AuthProvidersResponse = { google: googleEnabled };
  res.json(body);
});

authRouter.get("/me", requireAuth, async (req, res) => {
  res.json(await buildMeResponse(req.auth!.user.id));
});

// --- Registrierung ----------------------------------------------------------

authRouter.post("/register", async (req, res) => {
  await consumeRateLimit(`register:ip:${req.ip}`, 10, 60 * 60);
  const input = RegisterInput.parse(req.body);

  if (await User.exists({ email: input.email })) throw emailTakenError();
  if (await isPasswordPwned(input.password)) throw AppError.validation({ password: PWNED_PASSWORD });

  const passwordHash = await hashPassword(input.password);
  const { user, profile } = await mongoose.connection.transaction(async (session) => {
    const [created] = await User.create(
      [{ email: input.email, name: `${input.firstName} ${input.lastName}`, passwordHash, passwordChangedAt: new Date() }],
      { session },
    );
    if (!created) throw new Error("Nutzer konnte nicht angelegt werden");
    const customer = await createCustomerProfile(
      { userId: created._id, email: input.email, firstName: input.firstName, lastName: input.lastName, locale: input.locale ?? requestLocale(req) },
      session,
    );
    return { user: created, profile: customer };
  });

  await startSession(req, res, user, true);
  audit(req, "auth.registered", { actorId: user._id, actorRole: "CUSTOMER", targetType: "User", targetId: user._id, customerId: profile._id });
  await sendVerificationMail(user, profile._id);

  res.status(201).json(await buildMeResponse(user._id));
});

// --- Anmeldung mit E-Mail + Passwort ------------------------------------------

authRouter.post("/login", async (req, res) => {
  const input = LoginInput.parse(req.body);
  const user = await signInWithPassword(req, input, "portal");
  await startSession(req, res, user, input.remember);
  res.json(await buildMeResponse(user._id));
});

/**
 * Anmeldung im Admin-Bereich (/admin/login). Kundenkonten werden hier wie falsche
 * Zugangsdaten behandelt. Danach fehlt noch der zweite Faktor (/auth/mfa/*).
 */
authRouter.post("/staff/login", async (req, res) => {
  const input = LoginInput.parse(req.body);
  const user = await signInWithPassword(req, input, "staff");
  await startSession(req, res, user, false);
  res.json(await buildMeResponse(user._id));
});

async function signInWithPassword(req: Request, input: LoginInput, audience: "portal" | "staff") {
  await consumeRateLimit(`login:ip:${req.ip}`, 30, 15 * 60);
  await consumeRateLimit(emailKey("login", input.email), 10, 15 * 60);

  const user = await User.findOne({ email: input.email }).select("+passwordHash");
  const wrongAudience = audience === "staff" && user !== null && !isStaffRole(user.role);
  if (!user?.passwordHash || wrongAudience) {
    await verifyAgainstDummy(input.password);
    audit(req, "auth.login_failed", { meta: { reason: !user ? "unknown_email" : wrongAudience ? "not_staff" : "no_password", audience } });
    const googleOnly = user && !user.passwordHash && audience === "portal";
    throw AppError.unauthenticated(googleOnly ? "Für dieses Konto ist die Anmeldung mit Google eingerichtet." : INVALID_CREDENTIALS);
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    throw AppError.rateLimited("Zu viele Fehlversuche – das Konto ist für 15 Minuten gesperrt. Sie können Ihr Passwort zurücksetzen.");
  }

  if (!(await verifyPassword(user.passwordHash, input.password))) {
    const failed = user.failedLoginCount + 1;
    const locked = failed >= MAX_FAILED_LOGINS;
    await User.updateOne(
      { _id: user._id },
      locked ? { failedLoginCount: 0, lockedUntil: new Date(Date.now() + LOCK_DURATION_MS) } : { failedLoginCount: failed },
    );
    audit(req, locked ? "auth.account_locked" : "auth.login_failed", { actorId: user._id, targetType: "User", targetId: user._id });
    throw AppError.unauthenticated(INVALID_CREDENTIALS);
  }

  assertCanSignIn(user);
  await User.updateOne({ _id: user._id }, { failedLoginCount: 0, $unset: { lockedUntil: 1 }, lastLoginAt: new Date() });
  audit(req, "auth.login", { actorId: user._id, actorRole: user.role, targetType: "User", targetId: user._id, meta: { audience } });
  return user;
}

function assertCanSignIn(user: Pick<IUser, "state" | "role">): void {
  if (user.state !== "ACTIVE") throw AppError.forbidden("Dieses Konto ist deaktiviert. Bitte wenden Sie sich an uns.");
  if (user.role === "DRIVER") throw AppError.forbidden("Fahrerkonten melden sich in der Fahrer-App an.");
}

// --- Abmeldung ----------------------------------------------------------------

authRouter.post("/logout", async (req, res) => {
  const token: unknown = req.cookies?.[SESSION_COOKIE];
  if (typeof token === "string" && token) await revokeSession(token);
  if (req.auth) audit(req, "auth.logout");
  clearSessionCookie(res);
  res.status(204).end();
});

// --- E-Mail-Bestätigung ----------------------------------------------------------

authRouter.post("/verify-email", async (req, res) => {
  await consumeRateLimit(`verify:ip:${req.ip}`, 20, 15 * 60);
  const { token } = VerifyEmailInput.parse(req.body);

  const userId = await consumeAuthToken(token, "EMAIL_VERIFICATION");
  if (!userId) throw AppError.badRequest("Der Bestätigungslink ist ungültig oder abgelaufen. Bitte fordern Sie einen neuen an.");

  const before = await User.findByIdAndUpdate(userId, { emailVerifiedAt: new Date() }, { returnDocument: "before" });
  if (!before) throw AppError.notFound();
  const user = before;
  assertCanSignIn(user);
  if (!before.emailVerifiedAt && user.role === "CUSTOMER") sendWelcomeMail(user, "password");

  // Der Link beweist den Zugriff auf das Postfach – ohne passende Sitzung direkt anmelden.
  if (!req.auth || !req.auth.user.id.equals(user._id)) await startSession(req, res, user, true);
  audit(req, "auth.email_verified", { actorId: user._id, actorRole: user.role, targetType: "User", targetId: user._id });

  res.json(await buildMeResponse(user._id));
});

authRouter.post("/resend-verification", requireAuth, async (req, res) => {
  const { user } = req.auth!;
  if (user.emailVerified) {
    res.status(204).end();
    return;
  }
  await consumeRateLimit(`verify-resend:user:${user.id}`, 3, 60 * 60);
  const profile = await CustomerProfile.findOne({ userId: user.id }).select("_id").lean();
  await sendVerificationMail({ _id: user.id, email: user.email, name: user.name }, profile?._id);
  res.status(202).json({ ok: true });
});

// --- Passwort vergessen / zurücksetzen -----------------------------------------

authRouter.post("/forgot-password", async (req, res) => {
  await consumeRateLimit(`forgot:ip:${req.ip}`, 10, 60 * 60);
  const { email } = ForgotPasswordInput.parse(req.body);
  await consumeRateLimit(emailKey("forgot", email), 3, 60 * 60);

  // Immer dieselbe Antwort – kein Rückschluss darauf, ob ein Konto existiert.
  const user = await User.findOne({ email, state: "ACTIVE", role: { $ne: "DRIVER" } }).lean();
  if (user) {
    const token = await issueAuthToken(user._id, "PASSWORD_RESET");
    const locale = user.role === "CUSTOMER" ? await customerLocaleOf(user._id) : "de";
    const mail = passwordResetMail(user.name.split(" ")[0] || user.name, frontendUrl(`/kundenportal/passwort-zuruecksetzen?token=${token}`), locale);
    await sendMail({ type: "PASSWORD_RESET", to: user.email, userId: user._id, ...mail });
    audit(req, "auth.password_reset_requested", { actorId: user._id, targetType: "User", targetId: user._id });
  }
  res.status(202).json({ ok: true });
});

authRouter.post("/reset-password", async (req, res) => {
  await consumeRateLimit(`reset:ip:${req.ip}`, 20, 15 * 60);
  const input = ResetPasswordInput.parse(req.body);
  if (await isPasswordPwned(input.password)) throw AppError.validation({ password: PWNED_PASSWORD });

  const userId = await consumeAuthToken(input.token, "PASSWORD_RESET");
  if (!userId) throw AppError.badRequest("Der Link ist ungültig oder abgelaufen. Bitte fordern Sie einen neuen an.");

  const passwordHash = await hashPassword(input.password);
  const now = new Date();
  // Der Link beweist zudem den Zugriff auf das Postfach → E-Mail gilt als bestätigt.
  // $literal: Argon2-Hashes beginnen mit "$" und würden in der Pipeline sonst als Feldpfad gelesen.
  await User.updateOne(
    { _id: userId },
    [
      {
        $set: {
          passwordHash: { $literal: passwordHash },
          passwordChangedAt: now,
          failedLoginCount: 0,
          emailVerifiedAt: { $ifNull: ["$emailVerifiedAt", now] },
        },
      },
      { $unset: "lockedUntil" },
    ],
    { updatePipeline: true },
  );
  await revokeAllSessions(userId);
  clearSessionCookie(res);
  audit(req, "auth.password_reset", { actorId: userId, targetType: "User", targetId: userId });

  res.json({ ok: true });
});

// --- Google ---------------------------------------------------------------------

authRouter.get("/google", async (req, res) => {
  if (!googleEnabled) {
    res.redirect(frontendUrl(`${LOGIN_PAGE}?fehler=google`));
    return;
  }
  await consumeRateLimit(`google:ip:${req.ip}`, 30, 15 * 60);

  const { url, state, codeVerifier } = createGoogleAuthorization();
  setOAuthCookie(res, OAUTH_STATE, state);
  setOAuthCookie(res, OAUTH_VERIFIER, codeVerifier);
  const redirect = safeRedirectPath(req.query.weiter);
  if (redirect) setOAuthCookie(res, OAUTH_REDIRECT, redirect);
  else clearOAuthCookie(res, OAUTH_REDIRECT);

  res.redirect(url.toString());
});

authRouter.get("/google/callback", async (req, res) => {
  const cookies = req.cookies as Record<string, string | undefined>;
  const storedState = cookies[OAUTH_STATE];
  const codeVerifier = cookies[OAUTH_VERIFIER];
  const redirect = safeRedirectPath(cookies[OAUTH_REDIRECT]);
  for (const name of [OAUTH_STATE, OAUTH_VERIFIER, OAUTH_REDIRECT]) clearOAuthCookie(res, name);

  const fail = (reason: string) => {
    audit(req, "auth.google_failed", { meta: { reason } });
    res.redirect(frontendUrl(`${LOGIN_PAGE}?fehler=${reason === "disabled" ? "gesperrt" : "google"}`));
  };

  const { code, state } = req.query;
  if (typeof code !== "string" || typeof state !== "string" || !storedState || !codeVerifier || state !== storedState) {
    fail(typeof req.query.error === "string" ? `google_${req.query.error}` : "state_mismatch");
    return;
  }

  let profile: GoogleProfile;
  try {
    profile = await exchangeGoogleCode(code, codeVerifier);
  } catch (error) {
    logger.warn({ err: error }, "Google-Code konnte nicht eingelöst werden");
    fail("code_exchange");
    return;
  }
  if (!profile.emailVerified) {
    fail("email_unverified");
    return;
  }

  const { user, created } = await findOrCreateGoogleUser(profile, requestLocale(req));
  if (user.state !== "ACTIVE" || user.role === "DRIVER") {
    fail("disabled");
    return;
  }

  await User.updateOne({ _id: user._id }, { lastLoginAt: new Date(), failedLoginCount: 0 });
  await startSession(req, res, user, true);
  audit(req, created ? "auth.registered" : "auth.login", { actorId: user._id, actorRole: user.role, targetType: "User", targetId: user._id, meta: { method: "google" } });
  if (created) sendWelcomeMail(user, "google");

  res.redirect(frontendUrl(redirect ?? LANDING[user.role]));
});

/**
 * 1. Bekanntes Google-Konto → anmelden.
 * 2. E-Mail existiert schon (Registrierung mit Passwort) → Google verknüpfen;
 *    Google hat die Adresse bestätigt, damit gilt sie auch bei uns als bestätigt.
 * 3. Sonst neues Kundenkonto samt Kundenprofil anlegen.
 */
async function findOrCreateGoogleUser(profile: GoogleProfile, locale: Locale) {
  const byGoogle = await User.findOne({ googleSub: profile.sub });
  if (byGoogle) return { user: byGoogle, created: false };

  const byEmail = await User.findOne({ email: profile.email });
  if (byEmail) {
    byEmail.googleSub = profile.sub;
    byEmail.emailVerifiedAt ??= new Date();
    byEmail.avatarUrl ??= profile.avatarUrl;
    await byEmail.save();
    return { user: byEmail, created: false };
  }

  const user = await mongoose.connection.transaction(async (session) => {
    const [created] = await User.create(
      [
        {
          email: profile.email,
          name: `${profile.firstName} ${profile.lastName}`.trim(),
          googleSub: profile.sub,
          avatarUrl: profile.avatarUrl,
          emailVerifiedAt: new Date(),
        },
      ],
      { session },
    );
    if (!created) throw new Error("Nutzer konnte nicht angelegt werden");
    await createCustomerProfile(
      { userId: created._id, email: profile.email, firstName: profile.firstName, lastName: profile.lastName, locale },
      session,
    );
    return created;
  });
  return { user, created: true };
}
