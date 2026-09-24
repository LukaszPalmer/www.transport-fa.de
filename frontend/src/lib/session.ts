import "server-only";
import { headers } from "next/headers";
import { auth, ensureAuthSchema } from "./auth";

/** Aktuelle Portal-Sitzung in Server Components (null, wenn nicht angemeldet). */
export async function getSession() {
  await ensureAuthSchema();
  return auth.api.getSession({ headers: await headers() });
}

/** Nur interne Pfade als Weiterleitungsziel zulassen (verhindert Open Redirects). */
export function safeRedirectPath(value: unknown, fallback: string): string {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/\\")
    ? value
    : fallback;
}
