import { lang } from "next/root-params";
import { DEFAULT_LOCALE, isLocale, type Locale, type Messages } from "./config";

/**
 * Aktuelle Sprache in Server Components – aus dem Root-Segment [lang] (next/root-params).
 * Nicht in Server Actions oder Route Handlern nutzbar: Dort die Sprache als Formularfeld mitgeben.
 */
export async function getLocale(): Promise<Locale> {
  const value = await lang();
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export async function getMessages<T>(messages: Messages<T>): Promise<T> {
  return messages[await getLocale()];
}
