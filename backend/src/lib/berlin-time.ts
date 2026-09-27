/**
 * Kalendergrenzen in deutscher Zeit. Der Server läuft in UTC (Railway) – „dieser Monat" soll
 * trotzdem am 1. um 0:00 Uhr in Deutschland beginnen, auch bei Sommer-/Winterzeit.
 */

const ZONE = "Europe/Berlin";

/** Versatz von Berlin zu UTC (in Minuten) zum angegebenen Zeitpunkt, z. B. +120 im Sommer. */
function berlinOffsetMinutes(at: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: ZONE,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(at);
  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return Math.round((asUtc - at.getTime()) / 60_000);
}

/** Zeitpunkt für eine Berliner Uhrzeit (Jahr, Monat 1–12, Tag, 0:00 Uhr). */
export function berlinMidnight(year: number, month: number, day = 1): Date {
  const guess = new Date(Date.UTC(year, month - 1, day));
  return new Date(guess.getTime() - berlinOffsetMinutes(guess) * 60_000);
}

/** Jahr und Monat (1–12) in deutscher Zeit. */
export function berlinYearMonth(now = new Date()): { year: number; month: number } {
  const [year, month] = new Intl.DateTimeFormat("en-CA", { timeZone: ZONE }).format(now).split("-").map(Number);
  return { year: year!, month: month! };
}

export function berlinMonthStart(now = new Date()): Date {
  const { year, month } = berlinYearMonth(now);
  return berlinMidnight(year, month);
}

export function berlinYearStart(now = new Date()): Date {
  return berlinMidnight(berlinYearMonth(now).year, 1);
}

/** Kalendertag (JJJJ-MM-TT) in deutscher Zeit. */
export function berlinDay(at: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: ZONE }).format(at);
}
