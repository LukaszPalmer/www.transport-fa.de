import type { IconName } from "@/components/ui/Icon";
import type { Locale } from "@/i18n/config";
import { referralProgram as referralEn } from "./en/referral";
import { routes } from "./navigation";

/**
 * Empfehlungsprogramm (Startseite): Wer uns einen Kunden vermittelt, erhält eine Provision,
 * sobald daraus ein Auftrag wird. Die Höhe wird individuell vereinbart.
 *
 * TODO(Inhalt): Konditionen und Zielgruppen mit der Geschäftsführung abstimmen.
 */
export const referralProgram = {
  eyebrow: "Empfehlungsprogramm",
  title: "Empfehlen Sie uns –",
  titleAccent: "und verdienen Sie mit.",
  description:
    "Wir arbeiten auf Provisionsbasis: Vermitteln Sie uns einen Kunden und kommt es zum Auftrag, erhalten Sie eine Provision. Ob Privatperson oder Unternehmen – die Höhe vereinbaren wir fair und individuell mit Ihnen.",
  steps: [
    {
      icon: "handshake",
      title: "Kontakt herstellen",
      text: "Sie empfehlen uns weiter oder nennen uns einen Interessenten – natürlich mit dessen Einverständnis.",
    },
    {
      icon: "calendar-check",
      title: "Auftrag kommt zustande",
      text: "Wir beraten, besichtigen und erstellen ein Angebot. Sie müssen sich um nichts weiter kümmern.",
    },
    {
      icon: "coins",
      title: "Provision erhalten",
      text: "Wird aus Ihrer Empfehlung ein Auftrag, zahlen wir Ihnen die vereinbarte Provision aus.",
    },
  ] satisfies Array<{ icon: IconName; title: string; text: string }>,
  audiences: ["Privatpersonen", "Bestandskunden", "Hausverwaltungen & Makler", "Unternehmen & Handwerk"],
  card: {
    label: "Ihre Provision",
    value: "Verhandelbar",
    note: "Prozentsatz nach Auftragsart und -volumen – individuell vereinbart.",
    benefits: [
      "Für alle Leistungen: Umzug, Entrümpelung, Haushaltsauflösung und Transport",
      "Keine Kosten, kein Risiko – Provision nur bei zustande gekommenem Auftrag",
      "Klare Absprache vorab und ein fester Ansprechpartner",
    ],
  },
  cta: { label: "Partner werden", href: `${routes.contact}?leistung=empfehlung#anfrage` },
};

export function getReferralProgram(locale: Locale): typeof referralProgram {
  return locale === "en" ? referralEn : referralProgram;
}
