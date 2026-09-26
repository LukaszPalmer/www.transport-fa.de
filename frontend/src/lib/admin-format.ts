import type { ServiceSlug } from "@fa/shared";
import { services } from "@/content/services";

/** Formatierungen für den Admin-Bereich. */

const timeFormat = new Intl.DateTimeFormat("de-DE", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Berlin" });
const shortDate = new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Berlin" });

/** „gerade eben", „vor 5 Min.", „vor 3 Std.", „gestern, 14:05", sonst Datum. */
export function formatRelative(iso: string | undefined, now = Date.now()): string {
  if (!iso) return "–";
  const date = new Date(iso);
  const minutes = Math.round((now - date.getTime()) / 60_000);
  if (minutes < 1) return "gerade eben";
  if (minutes < 60) return `vor ${minutes} Min.`;
  if (minutes < 12 * 60) return `vor ${Math.round(minutes / 60)} Std.`;
  const yesterday = new Date(now - 24 * 60 * 60 * 1000);
  if (shortDate.format(date) === shortDate.format(new Date(now))) return `heute, ${timeFormat.format(date)}`;
  if (shortDate.format(date) === shortDate.format(yesterday)) return `gestern, ${timeFormat.format(date)}`;
  return shortDate.format(date);
}

export const formatTime = (iso: string) => timeFormat.format(new Date(iso));

const serviceNames = Object.fromEntries(services.map((service) => [service.slug, service.name])) as Record<ServiceSlug, string>;
export const serviceLabel = (slug: ServiceSlug) => serviceNames[slug] ?? slug;

/** Sicheres Zufallspasswort zum Weitergeben (ohne verwechselbare Zeichen). */
export function generatePassword(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(20));
  const raw = Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
  return `${raw.slice(0, 5)}-${raw.slice(5, 10)}-${raw.slice(10, 15)}-${raw.slice(15)}`;
}
