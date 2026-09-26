import type { UploadMimeType } from "@fa/shared";

/** Mindestens so viele Bytes braucht die Erkennung. */
export const FILE_SIGNATURE_BYTES = 12;

const HEIF_BRANDS = new Set(["heic", "heix", "hevc", "heim", "heis", "hevm", "hevs", "mif1", "msf1"]);

/**
 * Erkennt den Dateityp an der Signatur der ersten Bytes – eine umbenannte
 * .exe wird so nicht zur „rechnung.pdf". Unbekannte Typen ergeben null.
 */
export function detectFileType(head: Buffer): UploadMimeType | null {
  if (head.length < 4) return null;
  if (head.subarray(0, 5).toString("latin1") === "%PDF-") return "application/pdf";
  if (head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff) return "image/jpeg";
  if (head.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (head.length >= 12 && head.subarray(0, 4).toString("latin1") === "RIFF" && head.subarray(8, 12).toString("latin1") === "WEBP") {
    return "image/webp";
  }
  if (head.length >= 12 && head.subarray(4, 8).toString("latin1") === "ftyp" && HEIF_BRANDS.has(head.subarray(8, 12).toString("latin1"))) {
    return "image/heic";
  }
  return null;
}
