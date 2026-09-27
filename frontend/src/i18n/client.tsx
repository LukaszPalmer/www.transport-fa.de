"use client";

import { createContext, useContext, type ReactNode } from "react";
import { DEFAULT_LOCALE, type Locale, type Messages } from "./config";

const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);

/** Stellt die Sprache für Client Components bereit (im Root-Layout gesetzt). */
export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <LocaleContext value={locale}>{children}</LocaleContext>;
}

export function useLocale(): Locale {
  return useContext(LocaleContext);
}

export function useMessages<T>(messages: Messages<T>): T {
  return messages[useContext(LocaleContext)];
}
