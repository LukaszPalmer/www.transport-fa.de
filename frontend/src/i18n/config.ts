/**
 * Sprachen der Website und des Kundenportals. Der Admin-Bereich bleibt deutsch.
 *
 * Die Sprache steckt im Cookie `fa_lang`; der Proxy schreibt jede Seiten-URL intern auf
 * /de/… bzw. /en/… um (Root-Segment [lang]). Die sichtbaren URLs bleiben gleich, beide
 * Sprachfassungen werden statisch vorgerendert. transport-fa.de/en setzt Englisch per Link.
 */
export const LOCALES = ["de", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "de";
export const LOCALE_COOKIE = "fa_lang";
/** Ein Jahr – die Wahl gilt beim nächsten Besuch weiter. */
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function isLocale(value: unknown): value is Locale {
  return value === "de" || value === "en";
}

/** BCP-47-Tag für Intl (Datum, Zahlen, Währung). */
export function intlLocale(locale: Locale): string {
  return locale === "en" ? "en-GB" : "de-DE";
}

/** Texte einer Komponente in beiden Sprachen – `en` muss exakt die Struktur von `de` haben. */
export type Messages<T> = { de: T; en: T };

export function defineMessages<T>(messages: { de: T; en: NoInfer<T> }): Messages<T> {
  return messages;
}

/** Wert je Sprache wählen, z. B. localized(locale, { de: "Kunde", en: "Customer" }). */
export function localized<T>(locale: Locale, values: Messages<T>): T {
  return values[locale];
}
