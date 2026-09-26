import { sessionCookieName } from "@fa/shared";
import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = sessionCookieName(process.env.NODE_ENV === "production");

/**
 * Optimistische Vorprüfung für den Admin-Bereich: ohne Sitzungs-Cookie direkt zur
 * Anmeldung, ohne die Seite zu rendern. Die eigentliche Prüfung (Rolle, 2FA, Rechte)
 * machen API und Admin-Layout – ein vorhandenes Cookie allein gewährt nichts.
 */
export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/admin/login") return NextResponse.next();
  if (request.cookies.has(SESSION_COOKIE)) return NextResponse.next();
  return NextResponse.redirect(new URL("/admin/login", request.url));
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
