import { isStaffRole, MfaCodeInput, type MfaEnableResponse, type MfaSetupResponse, type MfaStatus } from "@fa/shared";
import { Router, type RequestHandler } from "express";
import { createMfaSetup, createRecoveryCodes, decryptSecret, encryptSecret, generateMfaSecret, hashRecoveryCode, isTotpFormat, verifyTotp } from "../auth/mfa";
import { consumeRateLimit } from "../auth/rate-limit";
import { markSessionMfaVerified, revokeAllSessions } from "../auth/sessions";
import { AppError } from "../http/errors";
import { audit } from "../lib/audit";
import { User } from "../models";

/**
 * /api/v1/auth/mfa – Zwei-Faktor-Authentifizierung für Mitarbeiter (Pflicht im Admin-Bereich).
 * Ablauf: Passwort-Login → (einmalig) Einrichtung per QR-Code → Code-Eingabe je Sitzung.
 */
export const mfaRouter = Router();

const WRONG_CODE = "Der Code ist nicht korrekt oder abgelaufen.";

const requireStaffSession: RequestHandler = (req, _res, next) => {
  if (!req.auth) throw AppError.unauthenticated();
  if (!isStaffRole(req.auth.user.role)) throw AppError.forbidden("Kein Zugang zum Admin-Bereich.");
  next();
};

mfaRouter.use(requireStaffSession);

mfaRouter.get("/status", async (req, res) => {
  const user = await User.findById(req.auth!.user.id).select("+mfa").lean();
  const body: MfaStatus = {
    enabled: Boolean(user?.mfa),
    verified: req.auth!.mfaVerified,
    recoveryCodesLeft: user?.mfa?.recoveryCodeHashes.length,
  };
  res.json(body);
});

/** Einmalige Einrichtung: neues Secret (noch unbestätigt) + QR-Code. */
mfaRouter.post("/setup", async (req, res) => {
  const { user } = req.auth!;
  await consumeRateLimit(`mfa-setup:user:${user.id}`, 10, 60 * 60);

  const record = await User.findById(user.id).select("+mfa +mfaPendingSecret").lean();
  if (record?.mfa) throw AppError.conflict("Die Zwei-Faktor-Authentifizierung ist bereits eingerichtet.");

  // Idempotent: Solange die Einrichtung nicht abgeschlossen ist, bleibt es beim selben Secret.
  // Das Speichern ist atomar (nur wenn noch keins existiert) – auch zwei gleichzeitige Anfragen
  // (Doppelklick, React StrictMode) liefern so garantiert denselben QR-Code.
  let secret = record?.mfaPendingSecret ? decryptSecret(record.mfaPendingSecret) : undefined;
  if (!secret) {
    const fresh = generateMfaSecret();
    const stored = await User.updateOne(
      { _id: user.id, mfa: { $exists: false }, mfaPendingSecret: { $exists: false } },
      { mfaPendingSecret: encryptSecret(fresh) },
    );
    if (stored.modifiedCount === 1) {
      secret = fresh;
    } else {
      const winner = await User.findById(user.id).select("+mfa +mfaPendingSecret").lean();
      if (winner?.mfa) throw AppError.conflict("Die Zwei-Faktor-Authentifizierung ist bereits eingerichtet.");
      if (!winner?.mfaPendingSecret) throw new Error("2FA-Einrichtung: Secret konnte nicht gespeichert werden");
      secret = decryptSecret(winner.mfaPendingSecret);
    }
  }
  const setup = await createMfaSetup(user.email, secret);

  const body: MfaSetupResponse = { qrDataUrl: setup.qrDataUrl, secret: setup.secret };
  res.json(body);
});

/** Einrichtung abschließen: erster gültiger Code aktiviert 2FA und liefert die Wiederherstellungscodes (einmalig). */
mfaRouter.post("/enable", async (req, res) => {
  const { user, sessionId } = req.auth!;
  await consumeRateLimit(`mfa:user:${user.id}`, 10, 15 * 60);
  const { code } = MfaCodeInput.parse(req.body);

  const record = await User.findById(user.id).select("+mfa +mfaPendingSecret").lean();
  if (record?.mfa) throw AppError.conflict("Die Zwei-Faktor-Authentifizierung ist bereits eingerichtet.");
  if (!record?.mfaPendingSecret) throw AppError.badRequest("Bitte starten Sie die Einrichtung erneut.");

  const step = verifyTotp(decryptSecret(record.mfaPendingSecret), code);
  if (step === null) {
    audit(req, "auth.mfa_failed", { targetType: "User", targetId: user.id, meta: { phase: "enable" } });
    throw AppError.validation({ code: WRONG_CODE }, WRONG_CODE);
  }

  const recovery = createRecoveryCodes();
  const result = await User.updateOne(
    { _id: user.id, mfa: { $exists: false } },
    {
      mfa: { secretEncrypted: record.mfaPendingSecret, enabledAt: new Date(), recoveryCodeHashes: recovery.hashes, lastUsedStep: step },
      $unset: { mfaPendingSecret: 1 },
    },
  );
  if (result.modifiedCount !== 1) throw AppError.conflict("Die Zwei-Faktor-Authentifizierung ist bereits eingerichtet.");

  // Andere (ggf. fremde) Sitzungen ohne zweiten Faktor sind ab jetzt wertlos – beenden.
  await revokeAllSessions(user.id, { except: sessionId });
  await markSessionMfaVerified(sessionId);
  audit(req, "auth.mfa_enabled", { targetType: "User", targetId: user.id });

  const body: MfaEnableResponse = { recoveryCodes: recovery.codes };
  res.json(body);
});

/** Code-Eingabe nach dem Login: Authenticator-Code oder einmaliger Wiederherstellungscode. */
mfaRouter.post("/verify", async (req, res) => {
  const { user, sessionId } = req.auth!;
  await consumeRateLimit(`mfa:user:${user.id}`, 10, 15 * 60);
  const { code } = MfaCodeInput.parse(req.body);

  const record = await User.findById(user.id).select("+mfa").lean();
  if (!record?.mfa) throw new AppError(403, "MFA_REQUIRED", "Bitte richten Sie zuerst die Zwei-Faktor-Authentifizierung ein.");

  let method: "totp" | "recovery";
  let accepted: boolean;
  if (isTotpFormat(code)) {
    method = "totp";
    const step = verifyTotp(decryptSecret(record.mfa.secretEncrypted), code);
    // Atomar: nur ein Code, der jünger ist als der zuletzt benutzte, wird akzeptiert.
    accepted =
      step !== null &&
      (
        await User.updateOne(
          { _id: user.id, $or: [{ "mfa.lastUsedStep": { $exists: false } }, { "mfa.lastUsedStep": { $lt: step } }] },
          { "mfa.lastUsedStep": step },
        )
      ).modifiedCount === 1;
  } else {
    method = "recovery";
    const hash = hashRecoveryCode(code);
    accepted =
      (await User.updateOne({ _id: user.id, "mfa.recoveryCodeHashes": hash }, { $pull: { "mfa.recoveryCodeHashes": hash } })).modifiedCount === 1;
  }

  if (!accepted) {
    audit(req, "auth.mfa_failed", { targetType: "User", targetId: user.id, meta: { method } });
    throw AppError.validation({ code: WRONG_CODE }, WRONG_CODE);
  }

  await markSessionMfaVerified(sessionId);
  audit(req, "auth.mfa_verified", { targetType: "User", targetId: user.id, meta: { method } });

  const left = method === "recovery" ? record.mfa.recoveryCodeHashes.length - 1 : record.mfa.recoveryCodeHashes.length;
  const body: MfaStatus = { enabled: true, verified: true, recoveryCodesLeft: left };
  res.json(body);
});
