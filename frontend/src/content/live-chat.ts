import type { Feature } from "@/types/content";

/** Live-Chat im Kundenportal – Inhalte der Marketing-Sektion auf der Startseite. */
export const liveChat = {
  eyebrow: "Live-Chat im Kundenportal",
  title: "Fragen? Direkt mit unserer Disposition chatten.",
  description:
    "Keine Warteschleife, kein E-Mail-Pingpong: Im Kundenportal erreichen Sie unser Team per Live-Chat. Wir sehen sofort Ihre Kundennummer und Aufträge – und können gezielt helfen.",
  features: [
    { icon: "clock", title: "Antwort in Minuten", description: "Sie sehen, ob gerade jemand online ist – und wann wir Ihre Nachricht gelesen haben." },
    { icon: "users", title: "Persönlich & mit Kontext", description: "Ihr Ansprechpartner kennt Ihre Aufträge, Termine und Dokumente." },
    { icon: "mail", title: "Nichts verpassen", description: "Antworten erreichen Sie auch per E-Mail, wenn Sie gerade offline sind." },
    { icon: "shield-check", title: "Datensparsam", description: "Beendete Chats werden nach 24 Stunden automatisch gelöscht." },
  ] satisfies Feature[],
  mockup: {
    customerNumber: "K-10042",
    staff: "Sarah · Disposition",
    messages: [
      { from: "customer", text: "Hallo! Kommt der LKW morgen wie geplant um 8 Uhr?", time: "09:41" },
      { from: "staff", text: "Guten Morgen! Ja – Fahrer Marco ist eingeplant. Ab Abfahrt sehen Sie ihn live im Tracking.", time: "09:42" },
      { from: "customer", text: "Super, danke! Kann er auch die Kartons aus dem Keller mitnehmen?", time: "09:43" },
    ] as const,
  },
};
