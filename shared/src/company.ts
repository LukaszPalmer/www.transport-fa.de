/**
 * Stammdaten des Unternehmens – eine Quelle für Website (Impressum, Footer, JSON-LD),
 * Backend (E-Mail-Fußzeilen, Rechnungen, DATEV-Export) und Kundenportal.
 *
 * TODO(Inhalt): Straße, PLZ/Ort, USt-IdNr., Steuernummer, Handelsregister und Bank sind noch
 * Platzhalter. Die Werte stehen im Schreiben des Bundeszentralamts für Steuern bzw. im
 * Handelsregisterauszug. Sobald sie hier eingetragen sind, erscheinen sie überall: Impressum,
 * Datenschutz, Footer, Kontaktseite, alle E-Mails, Rechnungen (PDF + XML) und DATEV-Export.
 * Bereits gesendete Rechnungen ändern sich dadurch nicht (GoBD).
 *
 * TODO(Recht): Rechtsform klären. Auf MyHammer firmiert der Betrieb als
 * „FA Transporte & Dienstleistungen" (Neuss). Ist es ein Einzelunternehmen, `legalForm` auf
 * "EINZELUNTERNEHMEN" setzen, `legalName` anpassen und `register.court/number` leeren –
 * Impressum und Rechnungen zeigen dann „Inhaber" statt „Geschäftsführer" und keinen Registereintrag.
 */
export const COMPANY = {
  name: "FA Transport",
  legalName: "FA Transport GmbH",
  legalForm: "GMBH" as "GMBH" | "EINZELUNTERNEHMEN",
  websiteUrl: "https://www.transport-fa.de",
  /** Inhaber bzw. Geschäftsführer – Impressum, Rechnungen, E-Mail-Fußzeile. */
  owner: "Ali Ftouni",
  contact: {
    phone: "+49 163 3788887",
    phoneHref: "tel:+491633788887",
    email: "kontakt@transport-fa.de",
    hours: "Mo–Fr 7–19 Uhr · Disposition 24/7",
    hoursEn: "Mon–Fri 7 am–7 pm · Dispatch 24/7",
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
    /** Umsatzsteuer-Identifikationsnummer (§ 27a UStG) – Format DE + 9 Ziffern. */
    vatId: "DE000000000",
    /** Steuernummer vom Finanzamt – optional neben der USt-IdNr. */
    taxNumber: "000/000/00000",
    managingDirectors: "Ali Ftouni",
  },
  /** Bankverbindung für Rechnungen (Überweisung und GiroCode). */
  bank: {
    name: "Musterbank",
    iban: "DE00 0000 0000 0000 0000 00",
    bic: "MUSTDEXXXXX",
  },
} as const;

/** „Geschäftsführer" (GmbH) bzw. „Inhaber" (Einzelunternehmen). */
export function ownerTitle(locale: "de" | "en" = "de"): string {
  if (COMPANY.legalForm === "EINZELUNTERNEHMEN") return locale === "en" ? "Owner" : "Inhaber";
  return locale === "en" ? "Managing Director" : "Geschäftsführer";
}

/** Hat das Unternehmen einen Handelsregistereintrag (nicht bei Einzelunternehmen ohne Eintragung)? */
export function hasRegisterEntry(): boolean {
  return Boolean(COMPANY.register.court && COMPANY.register.number);
}

/** USt-IdNr. in lesbarer Schreibweise (DE 123 456 789). */
export function formattedVatId(): string {
  const raw = COMPANY.register.vatId.replace(/\s/g, "");
  return /^DE\d{9}$/.test(raw) ? `DE ${raw.slice(2, 5)} ${raw.slice(5, 8)} ${raw.slice(8)}` : raw;
}
