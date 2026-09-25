import { ApiError, NETWORK_ERROR, toApiError } from "./errors";

/**
 * API-Zugriff aus dem Browser (Client Components). Das Sitzungs-Cookie ist
 * httpOnly und wird per credentials: "include" automatisch mitgeschickt.
 */
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function apiRequest<T = void>(path: string, init: { method?: "GET" | "POST" | "PATCH" | "DELETE"; body?: unknown } = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}/api/v1${path}`, {
      method: init.method ?? (init.body === undefined ? "GET" : "POST"),
      credentials: "include",
      headers: init.body === undefined ? undefined : { "Content-Type": "application/json" },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    });
  } catch {
    throw new ApiError(0, "NETWORK", NETWORK_ERROR);
  }
  if (!response.ok) throw await toApiError(response);
  if (response.status === 204 || response.status === 202) return undefined as T;
  return (await response.json()) as T;
}

/** Start der Google-Anmeldung – eine normale Seitennavigation zur API. */
export function googleSignInUrl(redirectTo?: string): string {
  const url = new URL("/api/v1/auth/google", API_URL);
  if (redirectTo) url.searchParams.set("weiter", redirectTo);
  return url.toString();
}
