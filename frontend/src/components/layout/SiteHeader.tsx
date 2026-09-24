import type { NavChild } from "@/types/content";
import { company } from "@/content/company";
import { mainNav, routes } from "@/content/navigation";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import { SmartLink } from "@/components/ui/SmartLink";
import { MobileMenu } from "./MobileMenu";
import { NavDropdown } from "./NavDropdown";
import { navLinkClass } from "./nav-styles";

/**
 * Sticky Header (Server Component). Der Wechsel transparent → Glass-Navy
 * läuft rein über CSS Scroll-Driven Animations (.site-header in globals.css).
 * Client-JS: nur Dropdown-Steuerung und Mobilmenü.
 */
export function SiteHeader() {
  return (
    <header className="site-header fixed inset-x-0 top-0 z-50 border-b">
      <Container className="flex h-18 items-center justify-between gap-6">
        <Logo />

        <nav aria-label="Hauptnavigation" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {mainNav.map((item) =>
              item.children ? (
                <NavDropdown key={item.href} label={item.label}>
                  <DropdownPanel items={item.children} overviewHref={item.href} />
                </NavDropdown>
              ) : (
                <li key={item.href}>
                  <SmartLink href={item.href} className={navLinkClass}>
                    {item.label}
                  </SmartLink>
                </li>
              ),
            )}
          </ul>
        </nav>

        <div className="flex items-center gap-2 sm:gap-4">
          <a
            href={company.contact.phoneHref}
            className="hidden items-center gap-2 text-sm font-medium text-slate-300 transition-colors hover:text-white xl:inline-flex"
          >
            <Icon name="phone" className="size-4 text-accent" />
            {company.contact.phone}
          </a>
          {/* Sichtbarkeit am Wrapper steuern – Button-Basis setzt selbst display:inline-flex */}
          <div className="hidden sm:block">
            <ButtonLink href={routes.portal} prefetch={false} variant="glass" size="sm" icon="log-in">
              Kundenportal
            </ButtonLink>
          </div>
          <MobileMenu items={mainNav} />
        </div>
      </Container>
    </header>
  );
}

/** Mega-Menü-Inhalt der Leistungen (server-gerendert). */
function DropdownPanel({ items, overviewHref }: { items: NavChild[]; overviewHref: string }) {
  return (
    // Kein eigener backdrop-filter: Der Header ist bereits Backdrop-Root, ein Blur hier hätte keinen Effekt.
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-primary shadow-elevated">
      <ul className="grid grid-cols-2 gap-1 p-3">
        {items.map((child) => (
          <li key={child.href}>
            <SmartLink
              href={child.href}
              className="group flex h-full gap-4 rounded-xl p-4 transition-colors duration-200 hover:bg-white/5 focus-visible:bg-white/5"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent ring-1 ring-accent/20 transition-colors duration-300 group-hover:bg-accent group-hover:text-primary">
                <Icon name={child.icon} className="size-5" />
              </span>
              <span>
                <span className="flex items-center gap-1.5 font-display font-semibold text-white">
                  {child.label}
                  <Icon
                    name="arrow-right"
                    className="size-3.5 -translate-x-1 text-accent opacity-0 transition-[opacity,translate] duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                  />
                </span>
                <span className="mt-1 block text-sm leading-snug text-slate-400">{child.description}</span>
              </span>
            </SmartLink>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-white/[0.03] px-7 py-4 text-sm">
        <SmartLink href={overviewHref} className="font-medium text-slate-300 transition-colors hover:text-white">
          Alle Leistungen im Überblick
        </SmartLink>
        <SmartLink
          href={routes.contactForm}
          className="group inline-flex items-center gap-1.5 font-semibold text-accent transition-colors hover:text-accent-bright"
        >
          Kostenlos beraten lassen
          <Icon name="arrow-right" className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
        </SmartLink>
      </div>
    </div>
  );
}
