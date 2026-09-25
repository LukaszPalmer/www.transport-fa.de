import type { ApiErrorBody, ApiErrorCode } from "@fa/shared";

/** Fehler der FA-Transport-API – mit deutscher Meldung und optionalen Feldfehlern. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: ApiErrorCode | "NETWORK",
    message: string,
    readonly fields?: Record<string, string>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const GENERIC_ERROR = "Das hat leider nicht geklappt. Bitte versuchen Sie es erneut.";
export const NETWORK_ERROR = "Der Server ist gerade nicht erreichbar. Bitte prüfen Sie Ihre Verbindung und versuchen Sie es erneut.";

export async function toApiError(response: Response): Promise<ApiError> {
  const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
  return new ApiError(response.status, body?.error?.code ?? "INTERNAL", body?.error?.message ?? GENERIC_ERROR, body?.error?.fields);
}

/** Meldung für beliebige Fehler aus einem API-Aufruf. */
export function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : GENERIC_ERROR;
}
