import { createHash, randomBytes } from "node:crypto";

/** Kryptografisch zufälliges Token (Standard 256 Bit), URL-sicher kodiert. */
export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

/** SHA-256 als Hex – für Tokens mit hoher Entropie (Sitzungen, Einmal-Links), nicht für Passwörter. */
export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}
