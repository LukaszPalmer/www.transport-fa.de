import { sessionCookieName } from "@fa/shared";
import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE, type Locale } from "@/i18n/config";
import { detectCrawler } from "@/lib/crawlers";

const SESSION_COOKIE = sessionCookieName(process.env.NODE_ENV === "production");

/** Das Kundenportal hat keine eigenen Sprach-URLs – dort gilt das Sprach-Cookie. */
const isPortal = (path: string) => path === "/kundenportal" || path.startsWith("/kundenportal/");

function redirectWithLocale(request: NextRequest, pathname: string, locale: Locale) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  const response = NextResponse.redirect(url);
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: LOCALE_COOKIE_MAX_AGE,
    sameSite: "lax",
    secure: request.nextUrl.protocol === "https:",
    domain: request.nextUrl.hostname.endsWith("transport-fa.de") ? "transport-fa.de" : undefined,
  });
  return response;
}

/**
 * 0. Crawler-Zugriffe protokollieren (Googlebot vs. KI-Bots, auch robots.txt und llms.txt) – Vercel-Logs,
 *    Filter `"event":"crawler"`. Grundlage für die Crawl-Budget-Auswertung.
 * 1. Admin-Bereich: optimistische Vorprüfung – ohne Sitzungs-Cookie direkt zur Anmeldung. Die eigentliche
 *    Prüfung (Rolle, 2FA, Rechte) machen API und Admin-Layout; ein vorhandenes Cookie allein gewährt nichts.
 * 2. Großbuchstaben im Pfad → kleingeschriebene URL (308) statt 404 bzw. doppelter Inhalte.
 * 3. /de/… → URL ohne Präfix (Deutsch ist die Standardfassung) und Sprache merken.
 * 4. /en/… → englische Website direkt aus app/[lang]; /en/kundenportal/… → Portal-URL mit Sprach-Cookie.
 * 5. Ohne Präfix: Kundenportal in der Cookie-Sprache, Website auf Deutsch (intern /de/…). Wer Englisch
 *    gewählt hat (Cookie), kommt auf die englische URL – Crawler senden kein Cookie und sehen immer Deutsch.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const crawler = detectCrawler(request.headers.get("user-agent"));
  if (crawler) console.info(JSON.stringify({ event: "crawler", bot: crawler.name, category: crawler.category, path: pathname }));
  if (/\.[a-z]+$/.test(pathname)) return NextResponse.next();

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (pathname === "/admin/login" || request.cookies.has(SESSION_COOKIE)) return NextResponse.next();
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  // Prozent-Kodierungen (%C3%BC) zählen nicht als Großbuchstaben.
  if (/[A-Z]/.test(pathname.replace(/%[0-9A-F]{2}/gi, ""))) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.toLowerCase();
    return NextResponse.redirect(url, 308);
  }

  const explicit = /^\/(de|en)(\/.*)?$/.exec(pathname);
  if (explicit) {
    const locale = explicit[1] as Locale;
    const rest = explicit[2] || "/";
    if (locale === "en" && !isPortal(rest)) return NextResponse.next();
    return redirectWithLocale(request, rest, locale);
  }

  const cookie = request.cookies.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(cookie) ? cookie : DEFAULT_LOCALE;
  const url = request.nextUrl.clone();
  if (locale === "en" && !isPortal(pathname)) {
    url.pathname = pathname === "/" ? "/en" : `/en${pathname}`;
    return NextResponse.redirect(url);
  }
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    // Seiten – ohne Next-Interna, API, generierte Bilder und Dateien mit Endung (Bilder, Videos …).
    "/((?!_next/|__nextjs|api/|opengraph-image|apple-icon|.*\\.[A-Za-z0-9]+$).*)",
    // Nur fürs Crawl-Protokoll: Dateien, die Suchmaschinen und KI-Crawler gezielt abrufen.
    "/robots.txt",
    "/sitemap.xml",
    "/llms.txt",
    "/llms-full.txt",
  ],
};
