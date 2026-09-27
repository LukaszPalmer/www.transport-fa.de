import { sessionCookieName } from "@fa/shared";
import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE } from "@/i18n/config";

const SESSION_COOKIE = sessionCookieName(process.env.NODE_ENV === "production");

/**
 * 1. Admin-Bereich: optimistische Vorprüfung – ohne Sitzungs-Cookie direkt zur Anmeldung. Die eigentliche
 *    Prüfung (Rolle, 2FA, Rechte) machen API und Admin-Layout; ein vorhandenes Cookie allein gewährt nichts.
 * 2. Sprache: /en bzw. /de (auch mit Unterpfad) speichert die Sprache und leitet auf die normale URL weiter –
 *    so lässt sich die englische Seite als Link teilen (transport-fa.de/en).
 * 3. Alle anderen Seiten: intern auf /de/… bzw. /en/… umschreiben (Root-Segment [lang]). Die sichtbare
 *    URL bleibt gleich; beide Sprachfassungen sind statisch vorgerendert.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (pathname === "/admin/login" || request.cookies.has(SESSION_COOKIE)) return NextResponse.next();
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const explicit = /^\/(de|en)(\/.*)?$/.exec(pathname);
  if (explicit) {
    const url = request.nextUrl.clone();
    url.pathname = explicit[2] || "/";
    const response = NextResponse.redirect(url);
    response.cookies.set(LOCALE_COOKIE, explicit[1]!, {
      path: "/",
      maxAge: LOCALE_COOKIE_MAX_AGE,
      sameSite: "lax",
      secure: request.nextUrl.protocol === "https:",
      domain: request.nextUrl.hostname.endsWith("transport-fa.de") ? "transport-fa.de" : undefined,
    });
    return response;
  }

  const cookie = request.cookies.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(cookie) ? cookie : DEFAULT_LOCALE;
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Ohne Next-Interna, Dateien mit Endung (Bilder, Videos, robots.txt, sitemap.xml …) und das OG-Bild.
  matcher: ["/((?!_next/|__nextjs|opengraph-image|.*\\.[A-Za-z0-9]+$).*)"],
};
