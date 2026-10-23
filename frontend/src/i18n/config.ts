/**
 * Sprachen der Website und des Kundenportals. Der Admin-Bereich bleibt deutsch.
 *
 * Website: Deutsch unter der normalen URL (/kontakt), Englisch unter /en/… (/en/kontakt) – beide
 * Fassungen sind eigene, indexierbare URLs mit hreflang-Verweisen. Der Proxy schreibt deutsche URLs
 * intern auf /de/… um (Root-Segment [lang]); /en/… trifft das Segment direkt.
 * Kundenportal: keine eigenen Sprach-URLs – die Sprache steckt im Cookie `fa_lang`.
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

/** Ziele ohne Sprachfassung: Admin, API und Dateien (robots.txt, sitemap.xml, llms.txt, Bilder …). */
const UNLOCALIZED = /^\/(admin|api)(\/|$)|\.[a-z0-9]+$/i;

/**
 * Interner Link in der gewünschten Sprache: "/kontakt" → "/en/kontakt", "/#flotte" → "/en#flotte".
 * Externe Ziele, reine Anker, mailto:/tel:, Dateien und bereits englische Pfade bleiben unverändert.
 */
export function localizeHref(href: string, locale: Locale): string {
  if (locale === DEFAULT_LOCALE || !href.startsWith("/") || href.startsWith("//")) return href;
  const path = href.split(/[?#]/, 1)[0]!;
  if (UNLOCALIZED.test(path) || path === "/en" || path.startsWith("/en/")) return href;
  return path === "/" ? `/en${href.slice(1)}` : `/en${href}`;
}

/**
 * Pfad ohne Sprachpräfix: "/en/kontakt" → { locale: "en", path: "/kontakt" }. Akzeptiert auch das interne
 * "/de/…": Vorgerenderte deutsche Seiten entstehen unter /de/…, usePathname() liefert dort diesen Pfad.
 */
export function stripLocalePrefix(pathname: string): { locale: Locale; path: string } {
  const match = /^\/(de|en)(\/.*)?$/.exec(pathname);
  return match ? { locale: match[1] as Locale, path: match[2] || "/" } : { locale: DEFAULT_LOCALE, path: pathname };
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
