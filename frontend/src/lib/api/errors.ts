import type { ApiErrorBody, ApiErrorCode } from "@fa/shared";
import { apiMessageEn } from "./messages-en";

/**
 * Fehler der FA-Transport-API – mit Meldung in der Sprache der Seite und optionalen Feldfehlern.
 * Die API antwortet deutsch; in der englischen Oberfläche übersetzt apiMessageEn die bekannten Meldungen.
 */
export class ApiError extends Error {
  readonly fields?: Record<string, string>;

  constructor(
    readonly status: number,
    readonly code: ApiErrorCode | "NETWORK",
    message: string,
    fields?: Record<string, string>,
  ) {
    super(localizeMessage(message));
    this.name = "ApiError";
    this.fields = fields && Object.fromEntries(Object.entries(fields).map(([field, text]) => [field, localizeMessage(text)]));
  }
}

export const GENERIC_ERROR = "Das hat leider nicht geklappt. Bitte versuchen Sie es erneut.";
export const NETWORK_ERROR = "Der Server ist gerade nicht erreichbar. Bitte prüfen Sie Ihre Verbindung und versuchen Sie es erneut.";

/** Im Browser gilt die Sprache der Seite (<html lang>); auf dem Server bleibt es bei Deutsch. */
function pageIsEnglish(): boolean {
  return typeof document !== "undefined" && document.documentElement.lang === "en";
}

/** Deutsche API- bzw. Standardmeldung in die Sprache der Seite übertragen. */
export function localizeMessage(message: string): string {
  return pageIsEnglish() ? apiMessageEn(message) : message;
}

export async function toApiError(response: Response): Promise<ApiError> {
  const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
  return new ApiError(response.status, body?.error?.code ?? "INTERNAL", body?.error?.message ?? GENERIC_ERROR, body?.error?.fields);
}

/** Meldung für beliebige Fehler aus einem API-Aufruf. */
export function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : localizeMessage(GENERIC_ERROR);
}
