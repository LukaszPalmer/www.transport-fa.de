/**
 * Rendert alle E-Mail-Vorlagen mit Beispieldaten nach backend/.mail-preview/ –
 * zum Prüfen des Designs im Browser, ohne etwas zu versenden.
 * npm run mail:preview -w @fa/backend
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { LOGO_MARK_PNG_BASE64 } from "../src/mail/assets/logo";
import { LOGO_CID } from "../src/mail/layout";
import { invitationMail, invoiceDeliveryMail, passwordResetMail, verificationMail, welcomeMail } from "../src/mail/templates";

const dir = path.resolve(".mail-preview");
mkdirSync(dir, { recursive: true });

const samples = {
  "willkommen-google": welcomeMail({
    firstName: "Anna",
    email: "anna.beispiel@gmail.com",
    customerNumber: "K-10001",
    signInMethod: "google",
    portalUrl: "https://www.transport-fa.de/kundenportal",
  }),
  "bestaetigung": verificationMail("Anna", "https://www.transport-fa.de/kundenportal/email-bestaetigen?token=beispiel-token-1234567890"),
  "passwort-reset": passwordResetMail("Anna", "https://www.transport-fa.de/kundenportal/passwort-zuruecksetzen?token=beispiel-token-1234567890"),
  einladung: invitationMail({
    firstName: "Anna",
    email: "anna.beispiel@gmail.com",
    customerNumber: "K-10001",
    url: "https://www.transport-fa.de/kundenportal/passwort-zuruecksetzen?token=beispiel-token-1234567890&willkommen=1",
    googleSignIn: true,
  }),
  rechnung: invoiceDeliveryMail({
    greetingName: "Anna",
    number: "RE-2026-00042",
    issueDate: "26.09.2026",
    amount: "2.981,55 €",
    payment: { dueDate: "10.10.2026", iban: "DE00 0000 0000 0000 0000 00", accountHolder: "FA Transport GmbH" },
    shipmentNumber: "SN-2026-00123",
    fileName: "Rechnung_RE-2026-00042.pdf",
    url: "https://www.transport-fa.de/kundenportal/rechnungen",
  }),
};

for (const [name, mail] of Object.entries(samples)) {
  const file = path.join(dir, `vorlage-${name}.html`);
  writeFileSync(file, mail.html.replaceAll(`cid:${LOGO_CID}`, `data:image/png;base64,${LOGO_MARK_PNG_BASE64}`));
  console.log(`${mail.subject}\n  → ${file}`);
}
