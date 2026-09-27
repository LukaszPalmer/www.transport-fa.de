/**
 * Englische Fassungen der Meldungen, die Kunden von der API (backend/src, shared/src) oder aus dem
 * Frontend sehen können. Neue Kunden-Meldungen im Backend hier ergänzen – unbekannte Meldungen
 * erscheinen in der englischen Oberfläche als allgemeiner Hinweis statt auf Deutsch.
 */
const GENERIC_DE = "Das hat leider nicht geklappt. Bitte versuchen Sie es erneut.";

const exact: Record<string, string> = {
  // Allgemein (http/errors.ts, http/error-handler.ts, Frontend)
  [GENERIC_DE]: "Sorry, that didn't work. Please try again.",
  "Der Server ist gerade nicht erreichbar. Bitte prüfen Sie Ihre Verbindung und versuchen Sie es erneut.":
    "The server can't be reached right now. Please check your connection and try again.",
  "Die Anfrage ist ungültig.": "The request is invalid.",
  "Bitte überprüfen Sie Ihre Eingaben.": "Please check your entries.",
  "Bitte melden Sie sich an.": "Please sign in.",
  "Dafür fehlt Ihnen die Berechtigung.": "You don't have permission to do that.",
  "Der Eintrag wurde nicht gefunden.": "The entry was not found.",
  "Der Eintrag existiert bereits.": "The entry already exists.",
  "Zu viele Anfragen. Bitte versuchen Sie es später erneut.": "Too many requests. Please try again later.",
  "Dieser Endpunkt existiert nicht.": "This endpoint does not exist.",
  "Die Anfrage ist zu groß.": "The request is too large.",
  "Der Anfrageinhalt ist kein gültiges JSON.": "The request body is not valid JSON.",
  "Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.": "An unexpected error occurred. Please try again.",
  "Anfrage von einer nicht erlaubten Herkunft.": "Request from a disallowed origin.",
  "Zu viele Versuche. Bitte warten Sie einen Moment und versuchen Sie es erneut.": "Too many attempts. Please wait a moment and try again.",

  // Anmeldung & Registrierung (routes/auth.ts, auth/middleware.ts, shared/auth.ts)
  "E-Mail-Adresse oder Passwort ist nicht korrekt.": "Email address or password is incorrect.",
  "Dieses Passwort ist aus Datenlecks bekannt. Bitte wählen Sie ein anderes.": "This password is known from data breaches. Please choose a different one.",
  "Für dieses Konto ist die Anmeldung mit Google eingerichtet.": "This account is set up to sign in with Google.",
  "Zu viele Fehlversuche – das Konto ist für 15 Minuten gesperrt. Sie können Ihr Passwort zurücksetzen.":
    "Too many failed attempts – the account is locked for 15 minutes. You can reset your password.",
  "Dieses Konto ist deaktiviert. Bitte wenden Sie sich an uns.": "This account has been deactivated. Please contact us.",
  "Der Bestätigungslink ist ungültig oder abgelaufen. Bitte fordern Sie einen neuen an.":
    "The confirmation link is invalid or has expired. Please request a new one.",
  "Der Link ist ungültig oder abgelaufen. Bitte fordern Sie einen neuen an.": "The link is invalid or has expired. Please request a new one.",
  "Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse.": "Please confirm your email address first.",
  "E-Mail-Adresse wird bereits verwendet.": "This email address is already in use.",
  "Bitte geben Sie Ihre E-Mail-Adresse ein.": "Please enter your email address.",
  "Die E-Mail-Adresse ist zu lang.": "The email address is too long.",
  "Bitte geben Sie eine gültige E-Mail-Adresse ein.": "Please enter a valid email address.",
  "Bitte wählen Sie ein Passwort.": "Please choose a password.",
  "Bitte geben Sie Ihren Vornamen ein.": "Please enter your first name.",
  "Bitte geben Sie Ihren Nachnamen ein.": "Please enter your last name.",
  "Bitte geben Sie eine Telefonnummer ein.": "Please enter a phone number.",
  "Bitte mit internationaler Vorwahl angeben, z. B. +49 170 1234567.": "Please include the international code, e.g. +49 170 1234567.",
  "Der Link ist unvollständig.": "The link is incomplete.",
  "Bitte stimmen Sie der Datenschutzerklärung zu.": "Please accept the privacy policy.",
  "Bitte geben Sie Ihr Passwort ein.": "Please enter your password.",

  // Konto (routes/account.ts, shared/account.ts)
  "Das Passwort ist nicht korrekt.": "The password is incorrect.",
  "Bitte melden Sie sich zur Bestätigung erneut mit Google an.": "Please sign in with Google again to confirm.",
  "Ihr Konto nutzt die Anmeldung mit Google. Ein Passwort legen Sie über „Passwort vergessen“ fest.":
    "Your account uses Google sign-in. You can set a password via “Forgot password”.",
  "Das aktuelle Passwort ist nicht korrekt.": "The current password is incorrect.",
  "Das ist bereits Ihre aktuelle E-Mail-Adresse.": "This is already your current email address.",
  "Bitte geben Sie Ihr aktuelles Passwort ein.": "Please enter your current password.",
  "Die Passwörter stimmen nicht überein.": "The passwords do not match.",
  "Das neue Passwort muss sich vom bisherigen unterscheiden.": "The new password must be different from the current one.",
  "Kundenprofil nicht gefunden.": "Customer profile not found.",

  // Dokumente, Belege, Aufträge (routes/portal-*.ts, services/documents.ts, shared/portal.ts)
  "Dokument nicht gefunden.": "Document not found.",
  "Dieses Dokument wurde von FA Transport bereitgestellt und kann nicht gelöscht werden.":
    "This document was provided by FA Transport and cannot be deleted.",
  "Beleg nicht gefunden.": "Document not found.",
  "Die PDF zu diesem Beleg ist nicht mehr verfügbar.": "The PDF for this document is no longer available.",
  "Auftrag nicht gefunden.": "Job not found.",
  "Dieser Auftrag gehört nicht zu Ihrem Konto.": "This job does not belong to your account.",
  "Bitte senden Sie die Datei als Formular-Upload.": "Please send the file as a form upload.",
  "Das Formular enthält zu viele Felder.": "The form contains too many fields.",
  "Der Upload konnte nicht gelesen werden.": "The upload could not be read.",
  "Bitte wählen Sie eine Datei aus.": "Please choose a file.",
  "Dieser Dateityp wird nicht unterstützt. Erlaubt sind PDF, JPG, PNG, WEBP und HEIC.":
    "This file type is not supported. Allowed are PDF, JPG, PNG, WEBP and HEIC.",
  "Bitte geben Sie eine Bezeichnung ein.": "Please enter a title.",
  "Bitte wählen Sie eine Kategorie.": "Please choose a category.",
  "Ungültiger Auftrag.": "Invalid job.",
  "Das Hochladen hat leider nicht geklappt. Bitte versuchen Sie es erneut.": "Sorry, the upload didn't work. Please try again.",

  // Chat (services/chat.ts, shared/chat.ts)
  "Die Nachricht ist leer.": "The message is empty.",
  "Die Nachricht ist zu lang.": "The message is too long.",
  "Dieser Chat existiert nicht mehr.": "This chat no longer exists.",
};

const patterns: Array<[RegExp, (...groups: string[]) => string]> = [
  [/^Mindestens (\d+) Zeichen\.$/, (count) => `At least ${count} characters.`],
  [/^Höchstens (\d+) Zeichen\.$/, (count) => `At most ${count} characters.`],
  [/^Die Datei ist größer als (\d+) MB\.$/, (size) => `The file is larger than ${size} MB.`],
  [/^Ungültiger Wert für "(.+)"\.$/, (field) => `Invalid value for "${field}".`],
  [/^Bitte geben Sie zur Bestätigung „(.+)" ein\.$/, () => `Please type “DELETE” to confirm.`],
];

export function apiMessageEn(message: string): string {
  const known = exact[message];
  if (known) return known;
  for (const [pattern, translate] of patterns) {
    const match = pattern.exec(message);
    if (match) return translate(...match.slice(1));
  }
  // Englische oder unbekannte Meldungen: englische bleiben, deutsche werden allgemein
  return /[äöüßÄÖÜ]|\b(Sie|Ihre?|Bitte|bitte|nicht|ist|wurde)\b/.test(message) ? exact[GENERIC_DE] : message;
}
