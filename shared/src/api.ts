/**
 * API-Vertrag zwischen Backend und Frontend.
 * Jede Fehlerantwort der API hat exakt diese Form.
 */

export const API_ERROR_CODES = [
  "BAD_REQUEST",
  "VALIDATION_FAILED",
  "UNAUTHENTICATED",
  "FORBIDDEN",
  /** Sensible Aktion (z. B. Konto löschen) verlangt eine frische Anmeldung. */
  "REAUTH_REQUIRED",
  /** Admin-Bereich: zweiter Faktor (Authenticator-Code) fehlt oder ist noch nicht eingerichtet. */
  "MFA_REQUIRED",
  "NOT_FOUND",
  "CONFLICT",
  "PAYLOAD_TOO_LARGE",
  "RATE_LIMITED",
  "INTERNAL",
] as const;
export type ApiErrorCode = (typeof API_ERROR_CODES)[number];

export interface ApiErrorBody {
  error: {
    code: ApiErrorCode;
    /** Für Endnutzer formuliert (Deutsch). */
    message: string;
    /** Feldfehler bei VALIDATION_FAILED, z. B. { email: "Ungültige E-Mail-Adresse" } */
    fields?: Record<string, string>;
    /** Für Support-Anfragen und Log-Suche (Header X-Request-Id). */
    requestId?: string;
  };
}
