/**
 * Stammdaten des Unternehmens – eine Quelle für Website (Impressum, Footer, JSON-LD)
 * und Backend (E-Mail-Fußzeilen).
 *
 * TODO(Inhalt): Adresse, Telefon und Registerdaten sind Platzhalter und müssen vor
 * dem Livegang durch die echten Daten ersetzt werden.
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
    managingDirectors: "Vorname Nachname",
  },
} as const;
