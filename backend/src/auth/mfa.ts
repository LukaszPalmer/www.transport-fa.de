import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { COMPANY } from "@fa/shared";
import { Secret, TOTP } from "otpauth";
import QRCode from "qrcode";
import { env } from "../config/env";
import { sha256 } from "../lib/crypto";

/**
 * Zwei-Faktor-Authentifizierung (TOTP, RFC 6238) für Mitarbeiter.
 * Das Secret liegt AES-256-GCM-verschlüsselt in der Datenbank – ein Datenbank-Leak
 * allein genügt also nicht, um Codes zu erzeugen. Wiederherstellungscodes nur als Hash.
 */
const KEY = Buffer.from(env.MFA_ENCRYPTION_KEY, "base64");
const ISSUER = `${COMPANY.name} Admin`;

export function encryptSecret(secret: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", KEY, iv);
  const encrypted = Buffer.concat([cipher.update(secret, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), encrypted].map((part) => part.toString("base64url")).join(".");
}

export function decryptSecret(payload: string): string {
  const [iv, tag, data] = payload.split(".").map((part) => Buffer.from(part, "base64url"));
  if (!iv || !tag || !data) throw new Error("Ungültiges 2FA-Secret");
  const decipher = createDecipheriv("aes-256-gcm", KEY, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}

function totpFor(secretBase32: string, label: string): TOTP {
  return new TOTP({ issuer: ISSUER, label, algorithm: "SHA1", digits: 6, period: 30, secret: Secret.fromBase32(secretBase32) });
}

/** Neues TOTP-Secret (160 Bit, Base32). */
export function generateMfaSecret(): string {
  return new Secret({ size: 20 }).base32;
}

/** QR-Code (Data-URL) und otpauth-Link zu einem Secret – für die Authenticator-App. */
export async function createMfaSetup(email: string, secret: string): Promise<{ secret: string; otpauthUrl: string; qrDataUrl: string }> {
  const otpauthUrl = totpFor(secret, email).toString();
  const qrDataUrl = await QRCode.toDataURL(otpauthUrl, { margin: 1, width: 220, color: { dark: "#0b132b", light: "#ffffff" } });
  return { secret, otpauthUrl, qrDataUrl };
}

const PERIOD_MS = 30_000;

export function isTotpFormat(code: string): boolean {
  return /^\d{6}$/.test(code.replace(/\s+/g, ""));
}

/**
 * Prüft einen 6-stelligen Code (±1 Zeitfenster Toleranz für abweichende Uhren) und
 * liefert dessen Zeitschritt – der Aufrufer speichert ihn, damit jeder Code nur
 * einmal gilt (Schutz gegen abgefangene und wiederverwendete Codes).
 */
export function verifyTotp(secretBase32: string, code: string, now = Date.now()): number | null {
  const normalized = code.replace(/\s+/g, "");
  if (!/^\d{6}$/.test(normalized)) return null;
  const delta = totpFor(secretBase32, "check").validate({ token: normalized, window: 1, timestamp: now });
  return delta === null ? null : Math.floor(now / PERIOD_MS) + delta;
}

// Ohne leicht verwechselbare Zeichen (0/o, 1/l/i) – wird ggf. abgetippt.
const RECOVERY_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";

/** 10 Wiederherstellungscodes (Format xxxx-xxxx, ~39 Bit), gespeichert werden nur Hashes. */
export function createRecoveryCodes(): { codes: string[]; hashes: string[] } {
  const codes = Array.from({ length: 10 }, () => {
    const raw = Array.from(randomBytes(8), (byte) => RECOVERY_ALPHABET[byte % RECOVERY_ALPHABET.length]).join("");
    return `${raw.slice(0, 4)}-${raw.slice(4)}`;
  });
  return { codes, hashes: codes.map((code) => sha256(code)) };
}

export function hashRecoveryCode(code: string): string {
  const compact = code.trim().toLowerCase().replace(/[\s-]/g, "");
  return sha256(`${compact.slice(0, 4)}-${compact.slice(4)}`);
}
