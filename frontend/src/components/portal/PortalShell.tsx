import type { MeResponse } from "@fa/shared";
import Link from "next/link";
import type { ReactNode } from "react";
import { company } from "@/content/company";
import { legalNav } from "@/content/navigation";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { SignOutButton } from "./AccountActions";
import { PortalNav } from "./PortalNav";

/**
 * Rahmen der angemeldeten Portal-Seiten: Kopfzeile mit Navigation und Konto,
 * schlanker Fuß. Die Auth-Prüfung selbst passiert in den Seiten (DAL).
 */
export function PortalShell({ me, children }: { me: MeResponse | null; children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <header className="bg-primary">
        <Container className="flex h-18 items-center justify-between gap-4">
          <Logo />
          {me && (
            <div className="flex items-center gap-4">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-white">{me.user.name}</p>
                <p className="text-xs text-slate-400">
                  {me.customer ? `Kundennr. ${me.customer.customerNumber}` : me.user.email}
                </p>
              </div>
              <SignOutButton />
            </div>
          )}
        </Container>
        {me && (
          <Container>
            <PortalNav />
          </Container>
        )}
      </header>

      <div className="flex-1">{children}</div>

      <footer className="border-t border-slate-200 bg-white">
        <Container className="flex flex-col items-center justify-between gap-3 py-6 text-sm text-slate-500 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {company.legalName}
          </p>
          <nav aria-label="Rechtliches" className="flex gap-5">
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
