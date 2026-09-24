import type { Metadata } from "next";
import { company } from "@/content/company";
import { LegalPage } from "@/components/layout/LegalPage";

export const metadata: Metadata = {
  title: "Datenschutz",
  alternates: { canonical: "/datenschutz" },
};

// TODO(Recht): Gliederung als Ausgangspunkt – vor Livegang durch eine rechtlich geprüfte
// Datenschutzerklärung ersetzen (Hosting-Anbieter, E-Mail-Dienstleister, Speicherfristen ergänzen).
export default function DatenschutzPage() {
  const { address, contact } = company;

  return (
    <LegalPage title="Datenschutzerklärung">
      <h2>1. Verantwortlicher</h2>
      <p>
        {company.legalName}, {address.street}, {address.postalCode} {address.city}
        <br />
        E-Mail: <a href={`mailto:${contact.email}`}>{contact.email}</a> · Telefon: {contact.phone}
      </p>

      <h2>2. Hosting und Server-Logfiles</h2>
      <p>
        Beim Aufruf dieser Website verarbeitet unser Hosting-Anbieter technisch notwendige Daten (z. B. IP-Adresse,
        Datum und Uhrzeit, aufgerufene Seite, Browsertyp), um die Website sicher und stabil auszuliefern.
        Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO.
      </p>

      <h2>3. Schriftarten, Cookies und externe Dienste</h2>
      <p>
        Alle Schriftarten werden lokal von unserem Server ausgeliefert; es findet keine Verbindung zu Google Fonts
        statt. Die Website setzt keine Tracking- oder Marketing-Cookies ein. Lediglich im Kundenportal wird nach der
        Anmeldung ein technisch notwendiges Sitzungs-Cookie gesetzt (§ 25 Abs. 2 Nr. 2 TDDDG).
      </p>

      <h3>Google Maps</h3>
      <p>
        In der Vorstellung unserer Tracking-App zeigen wir standardmäßig eine lokal gespeicherte Karte
        (Kartendaten © OpenStreetMap-Mitwirkende). Erst wenn Sie „Google Maps laden“ anklicken, wird der Kartendienst
        Google Maps (Google Ireland Ltd.) geladen und dabei u. a. Ihre IP-Adresse an Google übertragen
        (Art. 6 Abs. 1 lit. a DSGVO). Ihre Entscheidung speichern wir lokal in Ihrem Browser; Sie können sie durch
        Löschen der Website-Daten jederzeit widerrufen.
      </p>

      <h2>4. Kontakt- und Angebotsformular</h2>
      <p>
        Die im Formular angegebenen Daten (Name, Kontaktdaten, Angaben zum Auftrag, Nachricht) verarbeiten wir zur
        Bearbeitung Ihrer Anfrage und zur Erstellung eines Angebots (Art. 6 Abs. 1 lit. b DSGVO). Die Übermittlung
        erfolgt verschlüsselt per E-Mail an unser Team. Zum Schutz vor Missbrauch wird Ihre IP-Adresse kurzzeitig im
        Arbeitsspeicher verarbeitet (Art. 6 Abs. 1 lit. f DSGVO). Anfragen, aus denen kein Auftrag entsteht, löschen
        wir nach spätestens sechs Monaten.
      </p>

      <h2>5. Bewerbungen</h2>
      <p>
        Bewerbungsdaten einschließlich hochgeladener Unterlagen verarbeiten wir zur Durchführung des
        Bewerbungsverfahrens (§ 26 BDSG, Art. 6 Abs. 1 lit. b DSGVO). Dateien werden nicht auf dem Webserver
        gespeichert, sondern direkt an unsere Personalabteilung übermittelt. Nach Abschluss des Verfahrens löschen wir
        die Daten spätestens nach sechs Monaten, sofern Sie keiner längeren Aufbewahrung zugestimmt haben.
      </p>

      <h2>6. Kundenportal</h2>
      <p>
        Für die Registrierung verarbeiten wir Name, E-Mail-Adresse und ein verschlüsselt gespeichertes Passwort
        (Art. 6 Abs. 1 lit. b DSGVO). Zur Absicherung speichern wir Sitzungsdaten (Zeitpunkt, IP-Adresse, Browser).
        Sie können Ihr Konto jederzeit löschen lassen.
      </p>

      <h3>Anmeldung mit Google</h3>
      <p>
        Wenn Sie „Mit Google anmelden“ wählen, werden Sie zu Google (Google Ireland Ltd., Gordon House, Barrow Street,
        Dublin 4, Irland) weitergeleitet. Wir erhalten dabei Ihren Namen, Ihre E-Mail-Adresse und ggf. Ihr Profilbild.
        Die Verbindung zu Google entsteht ausschließlich nach Ihrem Klick (Art. 6 Abs. 1 lit. b DSGVO).
      </p>

      <h2>7. Bewertungsplattformen</h2>
      <p>
        Auf unserer Website verlinken wir auf unsere Profile bei Google und MyHammer. Erst beim Anklicken eines Links
        werden Daten an den jeweiligen Anbieter übertragen; es gelten dann dessen Datenschutzbestimmungen. Angezeigte
        Bewertungen geben wir mit Namenskürzel so wieder, wie sie auf der Plattform öffentlich veröffentlicht sind.
      </p>

      <h2>8. Ihre Rechte</h2>
      <p>
        Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung,
        Datenübertragbarkeit sowie Widerspruch. Zudem steht Ihnen ein Beschwerderecht bei einer
        Datenschutz-Aufsichtsbehörde zu.
      </p>
    </LegalPage>
  );
}
