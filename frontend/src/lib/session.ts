import "server-only";
import type { AuthProvidersResponse, CustomerSummary, MeResponse } from "@fa/shared";
import { redirect } from "next/navigation";
import { cache } from "react";
import { routes } from "@/content/navigation";
import { ApiError } from "./api/errors";
import { apiServer } from "./api/server";

/**
 * Data Access Layer des Kundenportals: einzige Stelle, die Sitzung und Nutzer
 * auflöst. React cache() dedupliziert die Anfrage innerhalb eines Render-Durchlaufs.
 */
export const getMe = cache(async (): Promise<MeResponse | null> => {
  try {
    return await apiServer<MeResponse>("/auth/me");
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
});

export type CustomerSession = MeResponse & { customer: CustomerSummary };

/** Für geschützte Portal-Seiten: ohne Sitzung zur Anmeldung, mit Rücksprung. */
export async function requireCustomer(currentPath: string): Promise<CustomerSession> {
  const me = await getMe();
  if (!me) redirect(`${routes.portalLogin}?weiter=${encodeURIComponent(currentPath)}`);
  if (me.user.role !== "CUSTOMER" || !me.customer) redirect("/");
  return me as CustomerSession;
}

export const getAuthProviders = cache(async (): Promise<AuthProvidersResponse> => {
  try {
    return await apiServer<AuthProvidersResponse>("/auth/providers");
  } catch {
    return { google: false };
  }
});

/** Nur interne Pfade als Weiterleitungsziel zulassen (verhindert Open Redirects). */
export function safeRedirectPath(value: unknown, fallback: string): string {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/\\")
    ? value
    : fallback;
}
