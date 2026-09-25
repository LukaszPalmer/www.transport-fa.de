import { createHash } from "node:crypto";
import { hash, verify } from "@node-rs/argon2";
import { logger } from "../lib/logger";

/**
 * Passwörter mit Argon2id (Empfehlung von OWASP), Parameter nach OWASP-Mindestwerten:
 * 19 MiB Speicher, 2 Iterationen, 1 Thread.
 */
const ARGON2_OPTIONS = { memoryCost: 19_456, timeCost: 2, parallelism: 1 };

export function hashPassword(password: string): Promise<string> {
  return hash(password, ARGON2_OPTIONS);
}

export async function verifyPassword(passwordHash: string, password: string): Promise<boolean> {
  try {
    return await verify(passwordHash, password);
  } catch {
    return false;
  }
}

let dummyHash: Promise<string> | undefined;

/**
 * Gleicht die Antwortzeit an, wenn es das Konto nicht gibt – sonst ließe sich
 * an der Dauer ablesen, welche E-Mail-Adressen registriert sind.
 */
export async function verifyAgainstDummy(password: string): Promise<void> {
  dummyHash ??= hashPassword("dummy-password-for-timing-equalization");
  await verifyPassword(await dummyHash, password);
}

/**
 * Prüft gegen bekannte Datenlecks (Have I Been Pwned, k-Anonymität: nur die ersten
 * 5 Zeichen des SHA-1-Hashes verlassen den Server). Bei Störungen wird nicht blockiert.
 */
export async function isPasswordPwned(password: string): Promise<boolean> {
  const digest = createHash("sha1").update(password).digest("hex").toUpperCase();
  const prefix = digest.slice(0, 5);
  const suffix = digest.slice(5);
  try {
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: { "Add-Padding": "true" },
      signal: AbortSignal.timeout(2500),
    });
    if (!response.ok) return false;
    const body = await response.text();
    return body.split("\n").some((line) => {
      const [hashSuffix, count] = line.trim().split(":");
      return hashSuffix === suffix && Number(count) > 0;
    });
  } catch (error) {
    logger.warn({ err: error }, "Passwort-Leak-Prüfung nicht erreichbar – wird übersprungen");
    return false;
  }
}
