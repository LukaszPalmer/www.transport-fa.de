import { COUNTRY_CODES, type PostalAddress } from "@fa/shared";
import { intlLocale, type Locale } from "@/i18n/config";

/** Länder und Anschriften – für Server- und Client-Komponenten (Formulare, Kundenakte, Tabellen). */

/** Feste Namen statt Intl.DisplayNames – Server und Browser liefern sonst teils andere Texte (Hydration). */
const COUNTRY_NAMES: Record<(typeof COUNTRY_CODES)[number], { de: string; en: string }> = {
  DE: { de: "Deutschland", en: "Germany" },
  AT: { de: "Österreich", en: "Austria" },
  BE: { de: "Belgien", en: "Belgium" },
  BG: { de: "Bulgarien", en: "Bulgaria" },
  CH: { de: "Schweiz", en: "Switzerland" },
  CY: { de: "Zypern", en: "Cyprus" },
  CZ: { de: "Tschechien", en: "Czechia" },
  DK: { de: "Dänemark", en: "Denmark" },
  EE: { de: "Estland", en: "Estonia" },
  ES: { de: "Spanien", en: "Spain" },
  FI: { de: "Finnland", en: "Finland" },
  FR: { de: "Frankreich", en: "France" },
  GB: { de: "Vereinigtes Königreich", en: "United Kingdom" },
  GR: { de: "Griechenland", en: "Greece" },
  HR: { de: "Kroatien", en: "Croatia" },
  HU: { de: "Ungarn", en: "Hungary" },
  IE: { de: "Irland", en: "Ireland" },
  IS: { de: "Island", en: "Iceland" },
  IT: { de: "Italien", en: "Italy" },
  LI: { de: "Liechtenstein", en: "Liechtenstein" },
  LT: { de: "Litauen", en: "Lithuania" },
  LU: { de: "Luxemburg", en: "Luxembourg" },
  LV: { de: "Lettland", en: "Latvia" },
  MT: { de: "Malta", en: "Malta" },
  NL: { de: "Niederlande", en: "Netherlands" },
  NO: { de: "Norwegen", en: "Norway" },
  PL: { de: "Polen", en: "Poland" },
  PT: { de: "Portugal", en: "Portugal" },
  RO: { de: "Rumänien", en: "Romania" },
  SE: { de: "Schweden", en: "Sweden" },
  SI: { de: "Slowenien", en: "Slovenia" },
  SK: { de: "Slowakei", en: "Slovakia" },
};

export function countryName(code: string, locale: Locale = "de"): string {
  return COUNTRY_NAMES[code as keyof typeof COUNTRY_NAMES]?.[locale] ?? code;
}

/** Länderauswahl in der Sprache der Seite – Deutschland zuerst, der Rest alphabetisch. */
export function countryOptions(locale: Locale): Array<{ value: string; label: string }> {
  const [home, ...rest] = COUNTRY_CODES.map((code) => ({ value: code, label: COUNTRY_NAMES[code][locale] }));
  return [home!, ...rest.sort((a, b) => a.label.localeCompare(b.label, intlLocale(locale)))];
}

/** Anschrift einzeilig für Tabellen und Akten, z. B. „Hauptstr. 1, 41460 Neuss“. */
export function formatAddress(address: PostalAddress, locale: Locale = "de"): string {
  const place = `${address.postalCode} ${address.city}`;
  return [address.line1, address.line2, address.countryCode === "DE" ? place : `${place}, ${countryName(address.countryCode, locale)}`]
    .filter(Boolean)
    .join(", ");
}
