/** Eingaben für Beträge und Mengen in Formularen – deutsche Schreibweise, Beträge in Cent. */

/** „1.234,56“, „1234,56“ oder „1234.56“ → Cent. Leer oder ungültig → undefined. */
export function parseEuro(value: string): number | undefined {
  const cleaned = value.replace(/[\s€]/g, "");
  if (!cleaned) return undefined;
  const normalized = cleaned.includes(",") ? cleaned.replace(/\./g, "").replace(",", ".") : cleaned;
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return undefined;
  return Math.round(Number(normalized) * 100);
}

export const centsToInput = (cents: number) => (cents / 100).toFixed(2).replace(".", ",");

/** „2,5“ oder „2.5“ → 2.5 (max. drei Nachkommastellen). Leer oder ungültig → undefined. */
export function parseQuantity(value: string): number | undefined {
  const normalized = value.replace(/\s/g, "").replace(",", ".");
  if (!/^\d+(\.\d{1,3})?$/.test(normalized)) return undefined;
  return Number(normalized);
}

export const quantityToInput = (quantity: number) => String(quantity).replace(".", ",");

/** Kalendertag in deutscher Zeit als JJJJ-MM-TT (Wert für <input type="date">). */
export function berlinDay(offsetDays = 0): string {
  const date = new Date(Date.now() + offsetDays * 24 * 60 * 60 * 1000);
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin" }).format(date);
}

/** JJJJ-MM-TT + Tage → JJJJ-MM-TT (kalendarisch, ohne Zeitzonen-Sprünge). */
export function addDays(isoDay: string, days: number): string {
  const date = new Date(`${isoDay}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
