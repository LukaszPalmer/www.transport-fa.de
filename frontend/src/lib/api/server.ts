import "server-only";
import { cookies } from "next/headers";
import { toApiError } from "./errors";

/**
 * API-Zugriff aus Server Components: reicht die Cookies der Anfrage an die API
 * weiter (lokal localhost:4000, auf Railway über das interne Netz).
 */
const API_URL = process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function apiServer<T>(path: string): Promise<T> {
  const cookieHeader = (await cookies()).toString();
  const response = await fetch(`${API_URL}/api/v1${path}`, {
    headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
    cache: "no-store",
  });
  if (!response.ok) throw await toApiError(response);
  return (await response.json()) as T;
}
