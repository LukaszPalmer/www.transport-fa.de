/**
 * Rendert alle E-Mail-Vorlagen mit Beispieldaten nach backend/.mail-preview/ –
 * zum Prüfen des Designs im Browser, ohne etwas zu versenden.
 * npm run mail:preview -w @fa/backend
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { LOGO_MARK_PNG_BASE64 } from "../src/mail/assets/logo";
import { LOGO_CID } from "../src/mail/layout";
import { passwordResetMail, verificationMail, welcomeMail } from "../src/mail/templates";

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
};

for (const [name, mail] of Object.entries(samples)) {
  const file = path.join(dir, `vorlage-${name}.html`);
  writeFileSync(file, mail.html.replaceAll(`cid:${LOGO_CID}`, `data:image/png;base64,${LOGO_MARK_PNG_BASE64}`));
  console.log(`${mail.subject}\n  → ${file}`);
}
