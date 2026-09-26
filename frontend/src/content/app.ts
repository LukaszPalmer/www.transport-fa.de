import type { Feature } from "@/types/content";

/**
 * FA Tracking App – Inhalte der App-Sektion (Startseite, Umzüge, Transport).
 *
 * TODO(Inhalt): Store-Links als `href` eintragen, sobald die App veröffentlicht ist – bis
 * dahin erscheinen die Badges ohne Link mit „Demnächst verfügbar". Die Badges sind die
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
  comingSoonNote: "Bis zum Start verfolgen Sie Ihre Sendung live im Kundenportal.",
  stores: {
    appStore: {
      href: undefined as string | undefined,
      name: "App Store",
      label: "FA Tracking im App Store laden",
      badge: { src: "/brands/app-store-badge.svg", width: 119.66, height: 40 },
    },
    googlePlay: {
      href: undefined as string | undefined,
      name: "Google Play",
      label: "FA Tracking bei Google Play herunterladen",
      badge: { src: "/brands/google-play-badge.svg", width: 180, height: 53.333 },
    },
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
  ] as const,
  driver: { initials: "MK", name: "Marco K.", vehicle: "Ihr Fahrer · HH-FA 142" },
  notification: { title: "FA Tracking", time: "jetzt", text: "Ihr Fahrer ist in 15 Minuten bei Ihnen." },
  delivered: { title: "Zugestellt · 14:28", text: "Abliefernachweis steht bereit" },
};
