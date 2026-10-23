"use client";

import { Globe } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { apiRequest } from "@/lib/api/client";
import { cn } from "@/lib/cn";
import { useLocale } from "./client";
import { localizeHref, LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE, LOCALES, stripLocalePrefix, type Locale } from "./config";

const LABELS: Record<Locale, { short: string; name: string }> = {
  de: { short: "DE", name: "Deutsch" },
  en: { short: "EN", name: "English" },
};

/** Sprachwahl speichern – auf der Hauptdomain, damit auch die API (api.transport-fa.de) sie kennt. */
export function storeLocale(locale: Locale): void {
  const host = window.location.hostname;
  const domain = host.endsWith("transport-fa.de") ? "; domain=transport-fa.de" : "";
  const secure = window.location.protocol === "https:" ? "; secure" : "";
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; samesite=lax${domain}${secure}`;
}

/**
 * Umschalter Deutsch/Englisch. Setzt das Sprach-Cookie und öffnet auf der Website dieselbe Seite unter
 * der URL der anderen Sprache (/kontakt ↔ /en/kontakt). Das Kundenportal hat keine Sprach-URLs: Dort
 * lädt die Seite neu, und die Sprache wird zusätzlich im Konto gespeichert, damit auch E-Mails in
 * dieser Sprache kommen.
 */
export function LanguageSwitcher({ tone = "dark", className }: { tone?: "dark" | "light"; className?: string }) {
  const current = useLocale();
  // Ohne Sprachpräfix – je nach Render-Art liefert usePathname() "/kontakt", "/de/kontakt" oder "/en/kontakt".
  const { path } = stripLocalePrefix(usePathname());
  const [pending, setPending] = useState(false);
  const inPortal = path.startsWith("/kundenportal");

  const choosePortal = async (locale: Locale) => {
    if (locale === current || pending) return;
    setPending(true);
    storeLocale(locale);
    await apiRequest("/account/locale", { method: "PATCH", body: { locale } }).catch(() => undefined);
    window.location.reload();
  };

  const itemClass = (active: boolean) =>
    cn(
      "rounded-lg px-2 py-1 transition-colors",
      active
        ? tone === "dark"
          ? "bg-white text-primary"
          : "bg-primary text-white"
        : tone === "dark"
          ? "text-slate-300 hover:text-white"
          : "text-slate-600 hover:text-primary",
    );

  return (
    <div
      role="group"
      aria-label={current === "en" ? "Language" : "Sprache"}
      className={cn(
        "inline-flex items-center gap-0.5 rounded-xl p-1 text-xs font-bold",
        tone === "dark" ? "bg-white/5 ring-1 ring-white/15" : "bg-slate-100 ring-1 ring-slate-200",
        pending && "opacity-60",
        className,
      )}
    >
      <Globe aria-hidden="true" className={cn("mx-1 size-3.5", tone === "dark" ? "text-slate-400" : "text-slate-500")} />
      {LOCALES.map((locale) => {
        const active = locale === current;
        if (inPortal) {
          return (
            <button
              key={locale}
              type="button"
              lang={locale}
              onClick={() => void choosePortal(locale)}
              aria-pressed={active}
              aria-label={`${LABELS[locale].short} – ${LABELS[locale].name}`}
              title={LABELS[locale].name}
              className={itemClass(active)}
            >
              {LABELS[locale].short}
            </button>
          );
        }
        // Website: echter Link auf die Sprachfassung – auch ohne JavaScript nutzbar und für Crawler sichtbar.
        return (
          <a
            key={locale}
            href={localizeHref(path, locale)}
            hrefLang={locale}
            lang={locale}
            onClick={() => storeLocale(locale)}
            aria-current={active ? "true" : undefined}
            // Sichtbares Kürzel im Namen (WCAG 2.5.3 „Label in Name"), ausgeschrieben für Screenreader.
            aria-label={`${LABELS[locale].short} – ${LABELS[locale].name}`}
            title={LABELS[locale].name}
            className={itemClass(active)}
          >
            {LABELS[locale].short}
          </a>
        );
      })}
    </div>
  );
}
