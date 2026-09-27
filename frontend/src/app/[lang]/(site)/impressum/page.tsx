import { formattedVatId, hasRegisterEntry, ownerTitle } from "@fa/shared";
import type { Metadata } from "next";
import { company } from "@/content/company";
import { imageCredits } from "@/content/image-credits";
import { getLocale } from "@/i18n/server";
import { LegalPage } from "@/components/layout/LegalPage";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: (await getLocale()) === "en" ? "Legal notice" : "Impressum",
    alternates: { canonical: "/impressum" },
  };
}

// TODO(Recht): Anschrift, USt-IdNr. und Registerdaten kommen aus shared/src/company.ts –
// vor dem Livegang dort die echten Werte eintragen und die Seite rechtlich prüfen lassen.
export default async function ImpressumPage() {
  return (await getLocale()) === "en" ? <ImpressumEn /> : <ImpressumDe />;
}

function ImpressumDe() {
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

      <h3>{company.legalForm === "EINZELUNTERNEHMEN" ? "Inhaber" : "Vertreten durch den Geschäftsführer"}</h3>
      <p>{company.owner}</p>

      <h3>Kontakt</h3>
      <p>
        Telefon: <a href={contact.phoneHref}>{contact.phone}</a>
        <br />
        E-Mail: <a href={`mailto:${contact.email}`}>{contact.email}</a>
      </p>

      {hasRegisterEntry() && (
        <>
          <h3>Registereintrag</h3>
          <p>
            Registergericht: {register.court}
            <br />
            Registernummer: {register.number}
          </p>
        </>
      )}

      <h3>Umsatzsteuer-ID</h3>
      <p>
        Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz:
        <br />
        <strong>{formattedVatId()}</strong>
      </p>

      <h3>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h3>
      <p>
        {company.owner} ({ownerTitle()})
        <br />
        Anschrift wie oben
      </p>

      <h2>Verbraucherstreitbeilegung</h2>
      <p>Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>

      <h2>Haftung für Inhalte und Links</h2>
      <p>
        Die Inhalte dieser Website erstellen wir mit größter Sorgfalt. Für die Richtigkeit, Vollständigkeit und Aktualität
        können wir jedoch keine Gewähr übernehmen. Unsere Ratgeber-Beiträge ersetzen keine Rechts- oder Steuerberatung.
        Für Inhalte verlinkter externer Websites sind ausschließlich deren Betreiber verantwortlich; zum Zeitpunkt der
        Verlinkung waren keine Rechtsverstöße erkennbar. Werden uns Rechtsverletzungen bekannt, entfernen wir die
        betreffenden Links umgehend.
      </p>

      <h2>Urheberrecht</h2>
      <p>
        Texte, Videos, Grafiken und das Layout dieser Website unterliegen dem deutschen Urheberrecht. Vervielfältigung,
        Bearbeitung und Verbreitung außerhalb der Grenzen des Urheberrechts bedürfen unserer schriftlichen Zustimmung.
        Kundenbewertungen stammen von MyHammer und sind dort mit Quelle verlinkt.
      </p>

      <h2>Bildnachweise</h2>
      <p>
        Die Videos auf den Leistungsseiten sind eigenes Material. Die folgenden Fotos sind Symbolbilder von{" "}
        <a href="https://www.pexels.com/license/" target="_blank" rel="noopener noreferrer">
          Pexels (Pexels-Lizenz)
        </a>
        ; die abgebildeten Personen sind keine Mitarbeiter von {company.name}.
      </p>
      <ul>
        {imageCredits.map((credit) => (
          <li key={credit.src}>
            {credit.subject}: Foto von{" "}
            <a href={credit.sourceUrl} target="_blank" rel="noopener noreferrer">
              {credit.photographer}
            </a>
          </li>
        ))}
      </ul>
    </LegalPage>
  );
}

function ImpressumEn() {
  const { address, contact, register } = company;
  return (
    <LegalPage title="Legal notice">
      <p>
        <em>This is a translation for your convenience. Only the German version (Impressum) is legally binding.</em>
      </p>

      <h2>Information pursuant to § 5 DDG (German Digital Services Act)</h2>
      <p>
        {company.legalName}
        <br />
        {address.street}
        <br />
        {address.postalCode} {address.city}
        <br />
        Germany
      </p>

      <h3>{company.legalForm === "EINZELUNTERNEHMEN" ? "Owner" : "Represented by the Managing Director"}</h3>
      <p>{company.owner}</p>

      <h3>Contact</h3>
      <p>
        Phone: <a href={contact.phoneHref}>{contact.phone}</a>
        <br />
        Email: <a href={`mailto:${contact.email}`}>{contact.email}</a>
      </p>

      {hasRegisterEntry() && (
        <>
          <h3>Commercial register</h3>
          <p>
            Register court: {register.court}
            <br />
            Registration number: {register.number}
          </p>
        </>
      )}

      <h3>VAT ID</h3>
      <p>
        VAT identification number pursuant to § 27a of the German VAT Act (UStG):
        <br />
        <strong>{formattedVatId()}</strong>
      </p>

      <h3>Responsible for content pursuant to § 18 (2) MStV</h3>
      <p>
        {company.owner} ({ownerTitle("en")})
        <br />
        Address as above
      </p>

      <h2>Consumer dispute resolution</h2>
      <p>We are neither willing nor obliged to take part in dispute resolution proceedings before a consumer arbitration board.</p>

      <h2>Liability for content and links</h2>
      <p>
        We create the content of this website with the greatest care. However, we cannot guarantee that it is correct, complete
        and up to date. Our guides do not replace legal or tax advice. The operators of linked external websites are solely
        responsible for their content; no legal violations were apparent at the time of linking. If we become aware of any
        infringements, we will remove the links concerned immediately.
      </p>

      <h2>Copyright</h2>
      <p>
        Texts, videos, graphics and the layout of this website are subject to German copyright law. Reproduction, editing and
        distribution beyond the limits of copyright law require our written consent. Customer reviews are taken from MyHammer
        and linked to their source.
      </p>

      <h2>Image credits</h2>
      <p>
        The videos on the service pages are our own material. The following photos are stock images from{" "}
        <a href="https://www.pexels.com/license/" target="_blank" rel="noopener noreferrer">
          Pexels (Pexels licence)
        </a>
        ; the people shown are not employees of {company.name}.
      </p>
      <ul>
        {imageCredits.map((credit) => (
          <li key={credit.src}>
            {credit.subjectEn}: photo by{" "}
            <a href={credit.sourceUrl} target="_blank" rel="noopener noreferrer">
              {credit.photographer}
            </a>
          </li>
        ))}
      </ul>
    </LegalPage>
  );
}
