import { services } from "./services";

/** Auswahl „Worum geht es?“ im Kontaktformular – abgeleitet aus den Leistungsbereichen. */
export const contactTopics = [
  ...services.map((service) => ({ value: service.slug, label: service.name, description: service.highlights[0] })),
  { value: "empfehlung", label: "Empfehlung & Provision", description: "Kunden vermitteln und Provision erhalten" },
  { value: "sonstiges", label: "Sonstiges", description: "Allgemeine Frage oder Kombination" },
];

export type ContactTopic = (typeof contactTopics)[number]["value"];

/** Leistungen mit Start- und Zieladresse (Umzug/Transport) – blendet das Feld „Nach“ ein. */
export const topicsWithDestination = ["umzuege", "transport-logistik"];

export const contactPage = {
  seo: {
    title: "Kontakt & Angebot anfordern",
    description:
      "Kostenloses Angebot für Umzug, Entrümpelung, Haushaltsauflösung oder Transport anfordern. Antwort in der Regel innerhalb von 2 Stunden.",
  },
  eyebrow: "Kontakt & Angebot",
  title: "Sprechen Sie mit uns.",
  description:
    "Schildern Sie uns kurz Ihr Vorhaben – Sie erhalten schnell ein unverbindliches, transparentes Angebot. Für Besichtigungen kommen wir kostenlos zu Ihnen.",
  promises: ["Antwort meist innerhalb von 2 Stunden", "Kostenlose Besichtigung", "Verbindlicher Festpreis"],
  hours: [
    { days: "Montag – Freitag", time: "07:00 – 19:00 Uhr" },
    { days: "Samstag", time: "08:00 – 14:00 Uhr" },
    { days: "Disposition Transport", time: "24/7 erreichbar" },
  ],
};
