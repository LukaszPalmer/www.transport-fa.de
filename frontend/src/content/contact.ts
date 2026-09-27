import type { Locale } from "@/i18n/config";
import { getServices, services } from "./services";

/** Auswahl „Worum geht es?“ im Kontaktformular – abgeleitet aus den Leistungsbereichen. */
export const contactTopics = [
  ...services.map((service) => ({ value: service.slug, label: service.name, description: service.highlights[0] })),
  { value: "empfehlung", label: "Empfehlung & Provision", description: "Kunden vermitteln und Provision erhalten" },
  { value: "sonstiges", label: "Sonstiges", description: "Allgemeine Frage oder Kombination" },
];

export type ContactTopic = (typeof contactTopics)[number]["value"];

/** Leistungen mit Start- und Zieladresse (Umzug/Transport) – blendet das Feld „Nach“ ein. */
export const topicsWithDestination = ["umzuege", "transport"];

export const contactPage = {
  seo: {
    title: "Kontakt & Angebot anfordern",
    description:
      "Kostenloses Angebot für Umzug, Entrümpelung, Haushaltsauflösung oder Transport anfordern. Antwort in der Regel innerhalb von 24 Stunden.",
  },
  eyebrow: "Kontakt & Angebot",
  title: "Sprechen Sie mit uns.",
  description:
    "Schildern Sie uns kurz Ihr Vorhaben – Sie erhalten schnell ein unverbindliches, transparentes Angebot. Für Besichtigungen kommen wir kostenlos zu Ihnen.",
  promises: ["Antwort innerhalb von 24 Stunden", "Kostenlose Besichtigung", "Verbindlicher Festpreis"],
  hours: [
    { days: "Montag – Freitag", time: "07:00 – 19:00 Uhr" },
    { days: "Samstag", time: "08:00 – 14:00 Uhr" },
    { days: "Disposition Transport", time: "24/7 erreichbar" },
  ],
};

const contactPageEn: typeof contactPage = {
  seo: {
    title: "Contact & request a quote",
    description: "Request a free quote for a removal, clearance, house clearance or transport. We usually reply within 24 hours.",
  },
  eyebrow: "Contact & quote",
  title: "Talk to us.",
  description:
    "Tell us briefly about your project – you will quickly receive a non-binding, transparent quote. We come to you for a free survey.",
  promises: ["Reply within 24 hours", "Free survey", "Binding fixed price"],
  hours: [
    { days: "Monday – Friday", time: "7:00 am – 7:00 pm" },
    { days: "Saturday", time: "8:00 am – 2:00 pm" },
    { days: "Transport dispatch", time: "Available 24/7" },
  ],
};

/** Kontaktseite und Formular-Themen in der gewünschten Sprache (Themen-Werte sind sprachunabhängig). */
export function getContact(locale: Locale) {
  if (locale === "de") return { contactPage, contactTopics, topicsWithDestination };
  return {
    contactPage: contactPageEn,
    contactTopics: [
      ...getServices("en").map((service) => ({ value: service.slug, label: service.name, description: service.highlights[0] })),
      { value: "empfehlung", label: "Referral & commission", description: "Refer customers and earn a commission" },
      { value: "sonstiges", label: "Other", description: "General question or a combination" },
    ],
    topicsWithDestination,
  };
}
