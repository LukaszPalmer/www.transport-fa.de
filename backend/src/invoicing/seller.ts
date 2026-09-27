import { COMPANY, hasRegisterEntry, ownerTitle } from "@fa/shared";
import type { SellerSnapshot } from "./types";

/** Rechnungssteller aus den Stammdaten (shared/src/company.ts) – wird je Rechnung eingefroren. */
export function sellerSnapshot(): SellerSnapshot {
  return {
    name: COMPANY.legalName,
    tradeName: COMPANY.name,
    street: COMPANY.address.street,
    postalCode: COMPANY.address.postalCode,
    city: COMPANY.address.city,
    countryCode: COMPANY.address.countryCode,
    vatId: COMPANY.register.vatId.replace(/\s/g, "") || undefined,
    taxNumber: COMPANY.register.taxNumber || undefined,
    phone: COMPANY.contact.phone,
    email: COMPANY.contact.email,
    website: COMPANY.websiteUrl,
    registerCourt: hasRegisterEntry() ? COMPANY.register.court : undefined,
    registerNumber: hasRegisterEntry() ? COMPANY.register.number : undefined,
    managingDirectors: COMPANY.register.managingDirectors,
    ownerTitle: ownerTitle(),
    bank: { name: COMPANY.bank.name, iban: COMPANY.bank.iban.replace(/\s/g, ""), bic: COMPANY.bank.bic || undefined },
  };
}

/** Stammdaten, die noch Platzhalter sind. Mit Platzhaltern gehen in Produktion keine Rechnungen raus. */
export function sellerWarnings(): string[] {
  const checks: Array<[label: string, placeholder: boolean]> = [
    ["Firmenanschrift", /^Muster/.test(COMPANY.address.street) || /^12345$/.test(COMPANY.address.postalCode)],
    ["USt-IdNr.", /^DE0+$/.test(COMPANY.register.vatId.replace(/\s/g, ""))],
    ["Steuernummer", /^[0/\s]+$/.test(COMPANY.register.taxNumber)],
    ["Handelsregister", hasRegisterEntry() && /^HRB 0+$/.test(COMPANY.register.number)],
    ["Geschäftsführer", /^Vorname Nachname$/.test(COMPANY.register.managingDirectors)],
    ["Bankverbindung", /^DE0+$/.test(COMPANY.bank.iban.replace(/\s/g, "")) || /^Musterbank$/.test(COMPANY.bank.name)],
    ["Telefonnummer", /123 456/.test(COMPANY.contact.phone)],
  ];
  return checks.filter(([, placeholder]) => placeholder).map(([label]) => label);
}
