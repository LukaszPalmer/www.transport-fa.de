import { existsSync } from "node:fs";
import path from "node:path";

/**
 * Schriften der Website (Inter, Plus Jakarta Sans – SIL Open Font License) für Rechnungs-PDFs.
 * PDF/A verlangt eingebettete Schriften. Liegen in backend/assets/fonts – gesucht wird
 * aufwärts vom Modul aus, damit es in src/ (tsx) und im Bundle dist/ gleich funktioniert.
 */
const FILES = {
  regular: "Inter-Regular.ttf",
  semibold: "Inter-SemiBold.ttf",
  bold: "Inter-Bold.ttf",
  displayMedium: "PlusJakartaSans-Medium.ttf",
  display: "PlusJakartaSans-Bold.ttf",
  displayHeavy: "PlusJakartaSans-ExtraBold.ttf",
} as const;

export type InvoiceFont = keyof typeof FILES;

let fontsDir: string | undefined;

function findFontsDir(): string {
  let dir = import.meta.dirname;
  for (let depth = 0; depth < 5; depth++) {
    const candidate = path.join(dir, "assets", "fonts");
    if (existsSync(path.join(candidate, FILES.regular))) return candidate;
    dir = path.dirname(dir);
  }
  throw new Error("Schriften für Rechnungs-PDFs nicht gefunden (backend/assets/fonts)");
}

export function fontPath(font: InvoiceFont): string {
  fontsDir ??= findFontsDir();
  return path.join(fontsDir, FILES[font]);
}

export const INVOICE_FONTS = Object.keys(FILES) as InvoiceFont[];
