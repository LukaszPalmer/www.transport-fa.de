import { createAuthClient } from "better-auth/react";

/** Browser-Client des Kundenportals (Basis-URL = aktuelle Origin). */
export const authClient = createAuthClient();

/** Deutsche Fehlermeldungen für die Codes von Better Auth. */
const messages: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "E-Mail-Adresse oder Passwort ist nicht korrekt.",
  INVALID_EMAIL: "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
  INVALID_PASSWORD: "Das Passwort ist nicht korrekt.",
  USER_ALREADY_EXISTS: "Für diese E-Mail-Adresse existiert bereits ein Konto. Bitte melden Sie sich an.",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "Für diese E-Mail-Adresse existiert bereits ein Konto. Bitte melden Sie sich an.",
  PASSWORD_TOO_SHORT: "Das Passwort muss mindestens 10 Zeichen lang sein.",
  PASSWORD_TOO_LONG: "Das Passwort darf höchstens 128 Zeichen lang sein.",
  INVALID_TOKEN: "Der Link ist ungültig oder abgelaufen. Bitte fordern Sie einen neuen an.",
  EMAIL_NOT_VERIFIED: "Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse.",
  FAILED_TO_CREATE_USER: "Das Konto konnte nicht angelegt werden. Bitte versuchen Sie es erneut.",
};

export function authErrorMessage(error: { code?: string; status?: number; message?: string } | null | undefined): string {
  if (!error) return "Ein unbekannter Fehler ist aufgetreten.";
  if (error.status === 429) return "Zu viele Versuche. Bitte warten Sie einen Moment und versuchen Sie es erneut.";
  return (error.code && messages[error.code]) || "Das hat leider nicht geklappt. Bitte versuchen Sie es erneut.";
}
