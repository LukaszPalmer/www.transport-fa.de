import { CHAT_RETENTION_HOURS, formattedVatId, LOCATION_HISTORY_DAYS, ownerTitle } from "@fa/shared";
import type { Metadata } from "next";
import { company } from "@/content/company";
import { getLocale } from "@/i18n/server";
import { LegalPage } from "@/components/layout/LegalPage";
import { DatenschutzEn } from "./DatenschutzEn";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: (await getLocale()) === "en" ? "Privacy policy" : "Datenschutz",
    alternates: { canonical: "/datenschutz" },
  };
}

/** Stand der Datenschutzerklärung – bei inhaltlichen Änderungen anpassen. */
const LAST_UPDATED = "27. September 2026";

// TODO(Recht): Vor dem Livegang rechtlich prüfen lassen. Prüfen: Railway-Region (EU West),
// Anschrift und USt-IdNr. in shared/src/company.ts, Auftragsverarbeitungsverträge (AVV) mit allen
// unter „Empfänger" genannten Dienstleistern abschließen bzw. in deren Konten bestätigen.
export default async function DatenschutzPage() {
  return (await getLocale()) === "en" ? <DatenschutzEn /> : <DatenschutzDe />;
}

function DatenschutzDe() {
  const { address, contact } = company;

  return (
    <LegalPage title="Datenschutzerklärung">
      <p>Stand: {LAST_UPDATED}</p>

      <h2>1. Verantwortlicher</h2>
      <p>
        {company.legalName}
        <br />
        {address.street}, {address.postalCode} {address.city}, {address.country}
        <br />
        {ownerTitle()}: {company.owner}
        <br />
        Telefon: <a href={contact.phoneHref}>{contact.phone}</a> · E-Mail: <a href={`mailto:${contact.email}`}>{contact.email}</a>
        <br />
        USt-IdNr.: {formattedVatId()}
      </p>
      <p>
        Für alle Fragen zum Datenschutz und zur Ausübung Ihrer Rechte erreichen Sie uns unter{" "}
        <a href={`mailto:${contact.email}`}>{contact.email}</a>. Einen Datenschutzbeauftragten müssen wir nach
        Art. 37 DSGVO und § 38 BDSG nicht benennen.
      </p>

      <h2>2. Überblick und Rechtsgrundlagen</h2>
      <p>
        Wir verarbeiten personenbezogene Daten nur, soweit es für die Website, Ihre Anfragen, unsere Aufträge und das
        Kundenportal erforderlich ist. Rechtsgrundlagen sind insbesondere Art. 6 Abs. 1 lit. b DSGVO (Vertrag und
        vorvertragliche Maßnahmen), lit. c (gesetzliche Pflichten, z. B. Aufbewahrung nach Handels- und Steuerrecht),
        lit. f (berechtigte Interessen, z. B. sicherer Betrieb) und lit. a (Einwilligung, wo wir ausdrücklich darum bitten).
      </p>

      <h2>3. Hosting und Server-Logfiles</h2>
      <p>
        Die Website wird bei Vercel Inc. (340 S Lemon Ave #4133, Walnut, CA 91789, USA) betrieben; die Auslieferung
        erfolgt über Rechenzentren in Frankfurt am Main. Die Programmierschnittstelle des Kundenportals (API) betreibt
        Railway Corporation (USA) in der Region Europa. Beim Aufruf verarbeiten diese Anbieter technisch notwendige
        Daten (IP-Adresse, Datum und Uhrzeit, aufgerufene Seite, Browsertyp), um die Website sicher und stabil
        auszuliefern (Art. 6 Abs. 1 lit. f DSGVO). Logdaten werden nach spätestens 30 Tagen gelöscht.
      </p>
      <p>
        Übermittlungen in die USA stützen wir auf den Angemessenheitsbeschluss zum EU-US Data Privacy Framework bzw.
        auf die EU-Standardvertragsklauseln (Art. 45, 46 DSGVO).
      </p>

      <h2>4. Cookies und Speicherung im Browser</h2>
      <p>
        Wir setzen keine Tracking- oder Marketing-Cookies und keine Analysewerkzeuge ein. Technisch notwendig sind nur
        (§ 25 Abs. 2 Nr. 2 TDDDG):
      </p>
      <ul>
        <li>ein Sitzungs-Cookie nach der Anmeldung im Kundenportal bzw. Admin-Bereich (bis zur Abmeldung, höchstens 14 Tage),</li>
        <li>ein Cookie mit Ihrer gewählten Sprache (Deutsch/Englisch, 1 Jahr), wenn Sie die Sprache umstellen,</li>
        <li>ein Eintrag im lokalen Speicher Ihres Browsers, wenn Sie Google Maps in der App-Vorstellung zulassen (siehe Ziffer 12).</li>
      </ul>
      <p>Alle Schriftarten liefern wir von unserem eigenen Server aus; es besteht keine Verbindung zu Google Fonts.</p>

      <h2>5. Kontakt- und Angebotsformular, Anfragen</h2>
      <p>
        Die im Formular angegebenen Daten (Name, Kontaktdaten, Angaben zum Auftrag, Nachricht) verarbeiten wir zur
        Bearbeitung Ihrer Anfrage und zur Erstellung eines Angebots (Art. 6 Abs. 1 lit. b DSGVO). Die Anfrage geht
        verschlüsselt per E-Mail an unser Team und wird zur Bearbeitung in unserer Kundenverwaltung gespeichert
        (Bearbeitungsstand, Notizen, Wiedervorlage). Zum Schutz vor Missbrauch verarbeiten wir Ihre IP-Adresse kurzzeitig
        im Arbeitsspeicher (Art. 6 Abs. 1 lit. f DSGVO).
      </p>
      <p>
        Anfragen, aus denen kein Auftrag entsteht, löschen wir automatisch sechs Monate nach der letzten Bearbeitung.
        Kommt ein Auftrag zustande, speichern wir die Anfrage drei Jahre (regelmäßige Verjährungsfrist); Rechnungen
        unterliegen den Aufbewahrungsfristen unter Ziffer 9.
      </p>

      <h2>6. Bewerbungen</h2>
      <p>
        Bewerbungsdaten einschließlich hochgeladener Unterlagen verarbeiten wir zur Durchführung des
        Bewerbungsverfahrens (§ 26 BDSG, Art. 6 Abs. 1 lit. b DSGVO). Dateien werden nicht auf dem Webserver
        gespeichert, sondern direkt per E-Mail übermittelt. Nach Abschluss des Verfahrens löschen wir die Daten
        spätestens nach sechs Monaten, sofern Sie keiner längeren Aufbewahrung zugestimmt haben.
      </p>

      <h2>7. Kundenportal</h2>
      <p>
        Für die Registrierung verarbeiten wir Name, E-Mail-Adresse und ein verschlüsselt gespeichertes Passwort
        (Argon2id). Im Portal verarbeiten wir Ihre Aufträge, Dokumente, Angebote, Rechnungen und Nachrichten
        (Art. 6 Abs. 1 lit. b DSGVO). Zur Absicherung speichern wir Sitzungsdaten (Zeitpunkt, IP-Adresse, Browser) und
        ein Sicherheitsprotokoll mit Anmeldeereignissen (12 Monate, Art. 6 Abs. 1 lit. f DSGVO).
      </p>
      <p>
        Während ein Transport für Sie unterwegs ist, sehen Sie die Position des Fahrzeugs. Die GPS-Daten gehören zum
        Fahrzeug, nicht zu Ihnen, und werden nach {LOCATION_HISTORY_DAYS} Tagen automatisch gelöscht.
      </p>

      <h3>Anmeldung mit Google</h3>
      <p>
        Wenn Sie „Mit Google anmelden“ wählen, werden Sie zu Google (Google Ireland Ltd., Gordon House, Barrow Street,
        Dublin 4, Irland) weitergeleitet. Wir erhalten dabei Ihren Namen, Ihre E-Mail-Adresse und ggf. Ihr Profilbild.
        Die Verbindung zu Google entsteht ausschließlich nach Ihrem Klick (Art. 6 Abs. 1 lit. b DSGVO).
      </p>

      <h3>Live-Chat</h3>
      <p>
        Nachrichten im Live-Chat speichern wir, bis der Chat beendet ist, und löschen sie {CHAT_RETENTION_HOURS} Stunden
        danach automatisch. Ist niemand aus unserem Team online und haben Sie es zugelassen, benachrichtigen wir Sie
        per E-Mail über Antworten.
      </p>

      <h3>Konto löschen</h3>
      <p>
        Sie können Ihr Konto in den Einstellungen jederzeit selbst löschen. Wir löschen dann Ihre Anmeldedaten,
        Sitzungen, Aufträge, Dokumente, Nachrichten und E-Mail-Verläufe. Ausgenommen sind Rechnungen, Gutschriften,
        Angebote und Auftragsbestätigungen, die wir gesetzlich aufbewahren müssen (Ziffer 9, Art. 17 Abs. 3 lit. b
        DSGVO): Sie sind danach nicht mehr im Portal sichtbar, werden nur noch für Buchhaltung und Steuerprüfung genutzt
        und nach Ablauf der Frist automatisch gelöscht. Mit der Löschbestätigung senden wir Ihnen Ihre Rechnungen als PDF.
      </p>

      <h2>8. E-Mails</h2>
      <p>
        Transaktions-E-Mails (z. B. Bestätigungslinks, Rechnungen, Statusmeldungen) versenden wir über Resend
        (Resend Inc., USA; Versand über Server in Irland). Welche Benachrichtigungen Sie erhalten, stellen Sie im
        Kundenportal unter „Einstellungen“ ein. Rechnungen, Zahlungserinnerungen und sicherheitsrelevante Hinweise senden
        wir unabhängig davon. Unser Postfach und die E-Mails des Kontaktformulars laufen über IONOS SE (Montabaur).
      </p>

      <h2>9. Rechnungen, Zahlungen und Buchhaltung</h2>
      <p>
        Für Angebote, Rechnungen und Zahlungen verarbeiten wir Name, Anschrift, ggf. Firma und USt-IdNr., Leistungs- und
        Zahlungsdaten (Art. 6 Abs. 1 lit. b und c DSGVO). Rechnungen erstellen wir als E-Rechnung (ZUGFeRD/XRechnung).
        Für die Buchhaltung und Steuererklärungen übermitteln wir Rechnungen und Buchungsdaten an unsere
        Steuerberatung, die der beruflichen Schweigepflicht unterliegt (Art. 6 Abs. 1 lit. c DSGVO).
      </p>
      <p>
        Aufbewahrungsfristen (§ 147 AO, § 257 HGB): Rechnungen und Gutschriften 8 Jahre, Angebote und
        Auftragsbestätigungen 6 Jahre, jeweils ab dem Ende des Kalenderjahres, in dem sie erstellt wurden. Ist eine
        Rechnung überfällig, erinnern wir Sie per E-Mail an die Zahlung.
      </p>

      <h2>10. Speicherung von Dateien und Daten</h2>
      <p>
        Die Daten des Kundenportals speichern wir in einer Datenbank bei MongoDB Inc. (Rechenzentrum der Amazon Web
        Services in Frankfurt am Main), Dokumente und PDFs bei Cloudflare, Inc. (R2-Speicher mit Datenhaltung
        ausschließlich in der EU). Mit allen Dienstleistern bestehen Verträge zur Auftragsverarbeitung (Art. 28 DSGVO).
      </p>

      <h2>11. Bewertungen</h2>
      <p>
        Auf unserer Website zeigen wir Kundenbewertungen, die auf unserem Profil bei MyHammer (MyHammer GmbH, Berlin)
        öffentlich veröffentlicht sind – unverändert, mit gekürztem Namen, Ort und Datum (Art. 6 Abs. 1 lit. f DSGVO).
        Wer seine Bewertung hier nicht sehen möchte, schreibt uns kurz; wir entfernen sie dann umgehend. Ein Profil bei
        Google ist in Vorbereitung. Erst beim Anklicken der Links zu den Plattformen werden Daten an deren Betreiber
        übertragen; es gelten dann deren Datenschutzbestimmungen.
      </p>

      <h2>12. Google Maps</h2>
      <p>
        In der Vorstellung unserer Tracking-App zeigen wir standardmäßig eine lokal gespeicherte Karte (Kartendaten ©
        OpenStreetMap-Mitwirkende). Erst wenn Sie „Google Maps laden“ anklicken, wird der Kartendienst Google Maps
        (Google Ireland Ltd.) geladen und dabei u. a. Ihre IP-Adresse an Google übertragen (Art. 6 Abs. 1 lit. a
        DSGVO). Ihre Entscheidung speichern wir lokal in Ihrem Browser; Sie können sie durch Löschen der Website-Daten
        jederzeit widerrufen.
      </p>

      <h2>13. Empfänger im Überblick</h2>
      <ul>
        <li>Vercel Inc. – Hosting der Website</li>
        <li>Railway Corporation – Betrieb der API des Kundenportals</li>
        <li>MongoDB Inc. – Datenbank (Frankfurt am Main)</li>
        <li>Cloudflare, Inc. – Dateispeicher (EU)</li>
        <li>Resend Inc. – Versand von E-Mails</li>
        <li>IONOS SE – E-Mail-Postfach und Domain</li>
        <li>Google Ireland Ltd. – nur bei Anmeldung mit Google bzw. nach Freigabe von Google Maps</li>
        <li>unsere Steuerberatung – Buchhaltung und Steuern</li>
      </ul>

      <h2>14. Ihre Rechte</h2>
      <p>
        Sie haben das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der
        Verarbeitung (Art. 18), Datenübertragbarkeit (Art. 20) und Widerruf erteilter Einwilligungen mit Wirkung für die
        Zukunft (Art. 7 Abs. 3). Soweit wir Daten auf Grundlage berechtigter Interessen verarbeiten, können Sie aus
        Gründen, die sich aus Ihrer besonderen Situation ergeben, jederzeit widersprechen (Art. 21 DSGVO).
      </p>
      <p>
        Sie können sich außerdem bei einer Datenschutz-Aufsichtsbehörde beschweren, z. B. bei der für uns zuständigen
        Landesbeauftragten für Datenschutz und Informationsfreiheit Nordrhein-Westfalen, Kavalleriestraße 2–4, 40213
        Düsseldorf, <a href="https://www.ldi.nrw.de">www.ldi.nrw.de</a>.
      </p>
    </LegalPage>
  );
}
