import type { Feature } from "@/types/content";
import type { Locale } from "@/i18n/config";
import { appStores } from "./app-stores";
import * as appEn from "./en/app";

/**
 * FA Tracking App – Inhalte der App-Sektion (Startseite, Umzüge, Transport).
 *
 * Store-Links (href) stehen in app-stores.ts. Die Badges sind die
 * unveränderten Originale von Apple bzw. Google (public/brands/) und dürfen laut
 * Richtlinien nur auf die eigene App verlinken.
 */
export const trackingApp = {
  eyebrow: "FA Tracking App",
  title: "Ihre Sendung. Live in der Hosentasche.",
  description:
    "Mit der kostenlosen FA Tracking App sehen Sie jederzeit, wo Ihr Umzugsgut oder Ihre Fracht gerade ist – mit Live-Position auf der Karte, minutengenauer Ankunftszeit und Benachrichtigung bei jedem Statuswechsel.",
  features: [
    { icon: "map-pin", title: "Live-Position & ETA", description: "Fahrzeug in Echtzeit auf der Karte, Ankunftszeit laufend neu berechnet." },
    { icon: "bell", title: "Push-Nachrichten", description: "Bei Abholung, 15 Minuten vor Ankunft und bei Zustellung." },
    { icon: "file-text", title: "Digitale Dokumente", description: "Lieferschein, Übergabeprotokoll und Abliefernachweis direkt in der App." },
    { icon: "message", title: "Direkter Draht", description: "Fahrer oder Disposition mit einem Tipp erreichen." },
  ] satisfies Feature[],
  note: "Kostenlos für iOS und Android · Anmeldung mit Ihrem Kundenportal-Zugang",
  comingSoonNote: "Bis zum Start hält Sie Ihr fester Ansprechpartner über jeden Status Ihrer Sendung auf dem Laufenden.",
  stores: {
    appStore: { ...appStores.appStore, label: "FA Tracking im App Store laden" },
    googlePlay: { ...appStores.googlePlay, label: "FA Tracking bei Google Play herunterladen" },
  },
};

/**
 * Beispiel-Tour im App-Screen (Route: siehe app-map.generated.ts,
 * erzeugt mit `npm run build:app-map`).
 */
export const trackingDemo = {
  shipmentId: "FA-26-04817",
  /** Anteil der bereits gefahrenen Strecke (Position des Fahrzeugs). */
  progress: 0.62,
  etaMinutes: 18,
  etaTime: "14:30",
  destination: "Osterstraße 120, Hamburg-Eimsbüttel",
  status: "Im Plan",
  steps: [
    { label: "Abgeholt", time: "13:52", state: "done" },
    { label: "Unterwegs", time: "live", state: "current" },
    { label: "Zustellung", time: "14:30", state: "open" },
  ] as Array<{ label: string; time: string; state: "done" | "current" | "open" }>,
  driver: { initials: "MK", name: "Marco K.", vehicle: "Ihr Fahrer · HH-FA 142" },
  notification: { title: "FA Tracking", time: "jetzt", text: "Ihr Fahrer ist in 15 Minuten bei Ihnen." },
  delivered: { title: "Zugestellt · 14:28", text: "Abliefernachweis steht bereit" },
};

const appByLocale = {
  de: () => ({ trackingApp, trackingDemo }),
  en: () => ({ trackingApp: appEn.trackingApp, trackingDemo: appEn.trackingDemo }),
} satisfies Record<Locale, () => { trackingApp: typeof trackingApp; trackingDemo: typeof trackingDemo }>;

/** Inhalte der App-Vorstellung in der gewünschten Sprache. */
export function getTrackingApp(locale: Locale) {
  return appByLocale[locale]();
}
