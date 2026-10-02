import { argon2, createHash, randomBytes, timingSafeEqual, type Argon2Algorithm } from "node:crypto";
import { promisify } from "node:util";
import { logger } from "../lib/logger";

/**
 * Passwörter mit Argon2id (Empfehlung von OWASP), Parameter nach OWASP-Mindestwerten:
 * 19 MiB Speicher, 2 Iterationen, 1 Thread.
 *
 * Gerechnet wird mit dem Argon2 aus node:crypto (OpenSSL, ab Node 24.7) statt mit einem nativen
 * npm-Addon: unsignierte .node-Dateien blockiert die Windows-Funktion „Smart App Control“.
 * Gespeichert wird im PHC-Format wie zuvor mit @node-rs/argon2, bestehende Hashes bleiben gültig:
 * $argon2id$v=19$m=19456,t=2,p=1$<Salz>$<Hash> (Base64 ohne Padding; v=19 ist Argon2 1.3,
 * die einzige Version, die node:crypto rechnet).
 */
const ARGON2_OPTIONS = { memory: 19_456, passes: 2, parallelism: 1 };
const SALT_BYTES = 16;
const HASH_BYTES = 32;
const PHC_HASH = /^\$(argon2id|argon2i|argon2d)\$v=19\$m=(\d+),t=(\d+),p=(\d+)\$([^$]+)\$([^$]+)$/;

const deriveKey = promisify(argon2);

function toPhcBase64(bytes: Buffer): string {
  return bytes.toString("base64").replace(/=+$/, "");
}

/** Nur kanonisches Base64 – Buffer.from überginge ungültige Zeichen stillschweigend. */
function fromPhcBase64(value: string | undefined): Buffer | undefined {
  if (!value) return undefined;
  const bytes = Buffer.from(value, "base64");
  return toPhcBase64(bytes) === value ? bytes : undefined;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES);
  const hash = await deriveKey("argon2id", { message: password, nonce: salt, tagLength: HASH_BYTES, ...ARGON2_OPTIONS });
  const { memory, passes, parallelism } = ARGON2_OPTIONS;
  return `$argon2id$v=19$m=${memory},t=${passes},p=${parallelism}$${toPhcBase64(salt)}$${toPhcBase64(hash)}`;
}

export async function verifyPassword(passwordHash: string, password: string): Promise<boolean> {
  try {
    const [, algorithm, memory, passes, parallelism, encodedSalt, encodedHash] = PHC_HASH.exec(passwordHash) ?? [];
    const salt = fromPhcBase64(encodedSalt);
    const expected = fromPhcBase64(encodedHash);
    if (!salt || !expected) return false;
    const actual = await deriveKey(algorithm as Argon2Algorithm, {
      message: password,
      nonce: salt,
      tagLength: expected.length,
      memory: Number(memory),
      passes: Number(passes),
      parallelism: Number(parallelism),
    });
    return timingSafeEqual(actual, expected);
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
