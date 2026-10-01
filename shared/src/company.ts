/**
 * Stammdaten des Unternehmens – eine Quelle für Website (Impressum, Footer, JSON-LD),
 * Backend (E-Mail-Fußzeilen, Rechnungen, DATEV-Export) und Kundenportal.
 *
 * Werte erscheinen überall: Impressum, Datenschutz, Footer, Kontaktseite, alle E-Mails,
 * Rechnungen (PDF + XML) und DATEV-Export. Bereits gesendete Rechnungen ändern sich dadurch
 * nicht (GoBD).
 *
 * Anschrift, USt-IdNr. und Steuernummer: Mitteilung des Bundeszentralamts für Steuern vom
 * 02.02.2026. Registereintrag laut öffentlichem Handelsregister-Auszug (northdata.de) –
 * mit dem aktuellen Registerauszug abgleichen (Sitzverlegung Neuss → Düsseldorf).
 * Bankverbindung: Commerzbank-Konto, vom Auftraggeber übermittelt am 28.09.2026.
 */
export const COMPANY = {
  name: "FA Transport",
  legalName: "FA Transport GmbH",
  legalForm: "GMBH" as "GMBH" | "EINZELUNTERNEHMEN",
  websiteUrl: "https://www.transport-fa.de",
  /** Inhaber bzw. Geschäftsführer – Impressum, Rechnungen, E-Mail-Fußzeile. */
  owner: "Reda Fakih",
  contact: {
    phone: "015679 678637",
    phoneHref: "tel:+4915679678637",
    email: "kontakt@transport-fa.de",
    hours: "Mo–Fr 7–19 Uhr · Disposition 24/7",
    hoursEn: "Mon–Fri 7 am–7 pm · Dispatch 24/7",
  },
  address: {
    street: "Torfbruchstr. 46",
    postalCode: "40625",
    city: "Düsseldorf",
    country: "Deutschland",
    countryCode: "DE",
    /** Koordinaten der Anschrift (OpenStreetMap) – für Google, Karten und KI-Suchen (JSON-LD). */
    geo: { latitude: 51.23532, longitude: 6.84248 },
  },
  register: {
    court: "Amtsgericht Neuss",
    number: "HRB 23714",
    /** Umsatzsteuer-Identifikationsnummer (§ 27a UStG), zugleich Wirtschafts-Identifikationsnummer (§ 139c AO). */
    vatId: "DE453977991",
    /** Steuernummer vom Finanzamt – steht auf Rechnungen und im DATEV-Export, nicht im Impressum. */
    taxNumber: "122/5723/2183",
    managingDirectors: "Reda Fakih",
  },
  /** Bankverbindung für Rechnungen (Überweisung und GiroCode). */
  bank: {
    name: "Commerzbank",
    iban: "DE59 3004 0000 0301 2929 00",
    bic: "COBADEFFXXX",
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
