/**
 * Stammdaten des Unternehmens – eine Quelle für Website (Impressum, Footer, JSON-LD)
 * und Backend (E-Mail-Fußzeilen, Rechnungen).
 *
 * TODO(Inhalt): Adresse, Telefon, Register-, Steuer- und Bankdaten sind Platzhalter und
 * müssen vor dem Livegang durch die echten Daten ersetzt werden. Rechnungen übernehmen
 * die Werte beim Versand – bereits gesendete Rechnungen ändern sich dadurch nicht.
 */
export const COMPANY = {
  name: "FA Transport",
  legalName: "FA Transport GmbH",
  websiteUrl: "https://www.transport-fa.de",
  contact: {
    phone: "+49 (0) 123 456 78-0",
    phoneHref: "tel:+49123456780",
    email: "kontakt@transport-fa.de",
    hours: "Mo–Fr 7–19 Uhr · Disposition 24/7",
  },
  address: {
    street: "Musterstraße 1",
    postalCode: "12345",
    city: "Musterstadt",
    country: "Deutschland",
    countryCode: "DE",
  },
  register: {
    court: "Amtsgericht Musterstadt",
    number: "HRB 000000",
    vatId: "DE000000000",
    /** Steuernummer vom Finanzamt – optional neben der USt-IdNr. */
    taxNumber: "000/000/00000",
    managingDirectors: "Vorname Nachname",
  },
  /** Bankverbindung für Rechnungen (Überweisung und GiroCode). */
  bank: {
    name: "Musterbank",
    iban: "DE00 0000 0000 0000 0000 00",
    bic: "MUSTDEXXXXX",
  },
} as const;
