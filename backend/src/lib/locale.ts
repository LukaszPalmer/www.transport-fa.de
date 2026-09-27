import type { Locale } from "@fa/shared";
import type { Request } from "express";
import type { Types } from "mongoose";
import { CustomerProfile } from "../models";

/**
 * Sprache der Kundenkommunikation. Die Website setzt das Cookie „fa_lang“ auf der Hauptdomain
 * (siehe frontend/src/i18n/LanguageSwitcher.tsx) – die API sieht es bei Registrierung und Google-Anmeldung.
 * Danach gilt die im Kundenprofil gespeicherte Sprache.
 */
export const LOCALE_COOKIE = "fa_lang";

export function requestLocale(req: Request): Locale {
  return (req.cookies as Record<string, string | undefined>)[LOCALE_COOKIE] === "en" ? "en" : "de";
}

/** Profilsprache eines Nutzers – Mitarbeiter und Konten ohne Kundenprofil erhalten Deutsch. */
export async function customerLocaleOf(userId: Types.ObjectId): Promise<Locale> {
  const profile = await CustomerProfile.findOne({ userId }).select("locale").lean();
  return profile?.locale ?? "de";
}

/** Formatierung von Beträgen und Tagesdaten in Kunden-E-Mails. */
export function mailFormats(locale: Locale) {
  const tag = locale === "en" ? "en-GB" : "de-DE";
  const euro = new Intl.NumberFormat(tag, { style: "currency", currency: "EUR" });
  const day = new Intl.DateTimeFormat(tag, { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Berlin" });
  return {
    euro: (cents: number) => euro.format(cents / 100),
    day: (date: Date) => day.format(date),
    /** ISO-Tag „2026-09-27“ → „27.09.2026“ bzw. „27/09/2026“. */
    isoDay: (isoDay: string) => isoDay.split("-").reverse().join(locale === "en" ? "/" : "."),
  };
}
