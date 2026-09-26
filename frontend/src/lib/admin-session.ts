import "server-only";
import type { Permission, StaffMe } from "@fa/shared";
import { redirect } from "next/navigation";
import { cache } from "react";
import { routes } from "@/content/navigation";
import { ApiError } from "./api/errors";
import { apiServer } from "./api/server";

/**
 * Data Access Layer des Admin-Bereichs. Die API prüft Rolle und zweiten Faktor –
 * hier wird nur übersetzt: nicht angemeldet → Login, 2FA fehlt → Code-Eingabe.
 */
type StaffResult = { status: "ok"; me: StaffMe } | { status: "login" | "mfa" | "forbidden" };

export const getStaff = cache(async (): Promise<StaffResult> => {
  try {
    return { status: "ok", me: await apiServer<StaffMe>("/admin/me") };
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return { status: "login" };
    if (error instanceof ApiError && error.code === "MFA_REQUIRED") return { status: "mfa" };
    if (error instanceof ApiError && error.status === 403) return { status: "forbidden" };
    throw error;
  }
});

export async function requireStaff(): Promise<StaffMe> {
  const result = await getStaff();
  if (result.status === "ok") return result.me;
  if (result.status === "mfa") redirect(`${routes.adminLogin}?schritt=code`);
  if (result.status === "forbidden") redirect(`${routes.adminLogin}?fehler=kein-zugang`);
  redirect(routes.adminLogin);
}

export function can(me: StaffMe, permission: Permission): boolean {
  return me.staff.permissions.includes(permission);
}
