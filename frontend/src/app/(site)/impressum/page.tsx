import type { Metadata } from "next";
import { company } from "@/content/company";
import { LegalPage } from "@/components/layout/LegalPage";

export const metadata: Metadata = {
  title: "Impressum",
  alternates: { canonical: "/impressum" },
};

// TODO(Recht): Angaben vor Livegang vollständig prüfen (lassen) – Daten stammen aus src/content/company.ts.
export default function ImpressumPage() {
  const { address, contact, register } = company;

  return (
    <LegalPage title="Impressum">
      <h2>Angaben gemäß § 5 DDG</h2>
      <p>
        {company.legalName}
        <br />
        {address.street}
        <br />
        {address.postalCode} {address.city}
        <br />
        {address.country}
      </p>

      <h3>Vertreten durch die Geschäftsführung</h3>
      <p>{register.managingDirectors}</p>

      <h3>Kontakt</h3>
      <p>
        Telefon: <a href={contact.phoneHref}>{contact.phone}</a>
        <br />
        E-Mail: <a href={`mailto:${contact.email}`}>{contact.email}</a>
      </p>

      <h3>Registereintrag</h3>
      <p>
        Registergericht: {register.court}
        <br />
        Registernummer: {register.number}
      </p>

      <h3>Umsatzsteuer-ID</h3>
      <p>Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: {register.vatId}</p>

      <h2>Verbraucherstreitbeilegung</h2>
      <p>
        Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
        Verbraucherschlichtungsstelle teilzunehmen.
      </p>
    </LegalPage>
  );
}
