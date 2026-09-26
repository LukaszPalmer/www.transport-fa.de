import { EMAIL_TAKEN_MESSAGE, type ApiErrorCode } from "@fa/shared";

/**
 * Erwartbare Fehler mit HTTP-Status und nutzertauglicher Meldung.
 * Services werfen AppError – der zentrale errorHandler formt daraus die API-Antwort.
 */
export class AppError extends Error {
  constructor(
    readonly status: number,
    readonly code: ApiErrorCode,
    message: string,
    readonly fields?: Record<string, string>,
  ) {
    super(message);
    this.name = "AppError";
  }

  static badRequest(message = "Die Anfrage ist ungültig.") {
    return new AppError(400, "BAD_REQUEST", message);
  }

  static validation(fields: Record<string, string>, message = "Bitte überprüfen Sie Ihre Eingaben.") {
    return new AppError(422, "VALIDATION_FAILED", message, fields);
  }

  static unauthenticated(message = "Bitte melden Sie sich an.") {
    return new AppError(401, "UNAUTHENTICATED", message);
  }

  static forbidden(message = "Dafür fehlt Ihnen die Berechtigung.") {
    return new AppError(403, "FORBIDDEN", message);
  }

  static notFound(message = "Der Eintrag wurde nicht gefunden.") {
    return new AppError(404, "NOT_FOUND", message);
  }

  static conflict(message = "Der Eintrag existiert bereits.") {
    return new AppError(409, "CONFLICT", message);
  }

  static rateLimited(message = "Zu viele Anfragen. Bitte versuchen Sie es später erneut.") {
    return new AppError(429, "RATE_LIMITED", message);
  }
}

/** 409 mit Feldfehler – das Formular zeigt die Meldung direkt am E-Mail-Feld. */
export function emailTakenError(): AppError {
  return new AppError(409, "CONFLICT", EMAIL_TAKEN_MESSAGE, { email: EMAIL_TAKEN_MESSAGE });
}
