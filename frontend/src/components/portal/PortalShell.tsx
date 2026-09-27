import type { MeResponse } from "@fa/shared";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { company } from "@/content/company";
import { getNavigation, routes } from "@/content/navigation";
import { defineMessages } from "@/i18n/config";
import { LanguageSwitcher } from "@/i18n/LanguageSwitcher";
import { getLocale } from "@/i18n/server";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { SignOutButton } from "./AccountActions";
import { PortalNav } from "./PortalNav";

/**
 * Rahmen der angemeldeten Portal-Seiten: Kopfzeile mit Navigation und Konto,
 * schlanker Fuß. Die Auth-Prüfung selbst passiert in den Seiten (DAL).
 */
const messages = defineMessages({
  de: {
    customerNo: "Kundennr.",
    legal: "Rechtliches",
    addressMissing: "Bitte ergänzen Sie Ihre Rechnungsadresse – ohne Anschrift können wir keine Rechnung ausstellen.",
    addAddress: "Adresse ergänzen",
  },
  en: {
    customerNo: "Customer no.",
    legal: "Legal",
    addressMissing: "Please add your billing address – we cannot issue an invoice without it.",
    addAddress: "Add address",
  },
});

export async function PortalShell({ me, children }: { me: MeResponse | null; children: ReactNode }) {
  const locale = await getLocale();
  const t = messages[locale];
  const { legalNav } = getNavigation(locale);
  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <header className="bg-primary">
        <Container className="flex h-18 items-center justify-between gap-4">
          <Logo />
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
          {me && (
            <div className="flex items-center gap-4">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-white">{me.user.name}</p>
                <p className="text-xs text-slate-400">
                  {me.customer ? `${t.customerNo} ${me.customer.customerNumber}` : me.user.email}
                </p>
              </div>
              <SignOutButton />
            </div>
          )}
          </div>
        </Container>
        {me && (
          <Container>
            <PortalNav />
          </Container>
        )}
      </header>

      {/* Google-Konten bringen keine Anschrift mit – ohne sie kann das Büro keine Rechnung stellen. */}
      {me?.customer && !me.customer.hasBillingAddress && (
        <div role="status" className="border-b border-amber-200 bg-amber-50">
          <Container className="flex flex-col gap-2 py-3 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
            <p>{t.addressMissing}</p>
            <Link href={`${routes.portalSettings}#adresse`} className="shrink-0 font-semibold underline underline-offset-4 hover:text-amber-950">
              {t.addAddress}
            </Link>
          </Container>
        </div>
      )}

      <div className="flex-1">{children}</div>

      {/* Live-Chat erst mit bestätigter E-Mail – wie alle Portal-Daten. */}
      {me?.customer && me.user.emailVerified && (
        <Suspense fallback={null}>
          <ChatWidget />
        </Suspense>
      )}

      <footer className="border-t border-slate-200 bg-white">
        <Container className="flex flex-col items-center justify-between gap-3 py-6 text-sm text-slate-500 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {company.legalName}
          </p>
          <nav aria-label={t.legal} className="flex gap-5">
            {legalNav
              .filter((link) => link.href !== "/sitemap.xml")
              .map((link) => (
                <Link key={link.href} href={link.href} className="hover:text-primary">
                  {link.label}
                </Link>
              ))}
          </nav>
        </Container>
      </footer>
    </div>
  );
}
