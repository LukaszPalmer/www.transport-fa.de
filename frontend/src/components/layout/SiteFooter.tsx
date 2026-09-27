import { formattedVatId, hasRegisterEntry, ownerTitle } from "@fa/shared";
import { company } from "@/content/company";
import { getHome } from "@/content/home";
import { getNavigation } from "@/content/navigation";
import { defineMessages } from "@/i18n/config";
import { LanguageSwitcher } from "@/i18n/LanguageSwitcher";
import { getLocale } from "@/i18n/server";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import { SmartLink } from "@/components/ui/SmartLink";
import { SocialIcon } from "@/components/ui/SocialIcon";

const linkClass = "text-slate-400 transition-colors duration-300 hover:text-white";
const socialClass =
  "flex size-10 items-center justify-center rounded-xl border border-white/10 text-slate-400 transition-[color,border-color,background-color] duration-300 hover:border-accent/50 hover:bg-white/5 hover:text-accent";

const messages = defineMessages({
  de: {
    footer: "Fußbereich",
    social: "Social Media",
    profileSoon: "Profil folgt demnächst",
    on: (network: string) => `${company.name} auf ${network}`,
    contact: "Kontakt",
    rights: "Alle Rechte vorbehalten.",
    legal: "Rechtliches",
    vat: "USt-IdNr.",
    language: "Sprache",
  },
  en: {
    footer: "Footer",
    social: "Social media",
    profileSoon: "Profile coming soon",
    on: (network: string) => `${company.name} on ${network}`,
    contact: "Contact",
    rights: "All rights reserved.",
    legal: "Legal",
    vat: "VAT ID",
    language: "Language",
  },
});

export async function SiteFooter() {
  const locale = await getLocale();
  const t = messages[locale];
  const { footerNav, legalNav } = getNavigation(locale);
  const { footerClaim } = getHome(locale);
  const year = new Date().getFullYear();
  const { address, contact } = company;

  return (
    <footer className="bg-primary text-sm" aria-labelledby="footer-title">
      <h2 id="footer-title" className="sr-only">
        {t.footer}
      </h2>

      <Container className="grid grid-cols-1 gap-12 py-16 lg:grid-cols-12 lg:gap-8 lg:py-20">
        {/* Marke */}
        <div className="lg:col-span-4">
          <Logo />
          <p className="mt-6 max-w-sm leading-relaxed text-slate-400">{company.descriptions[locale]}</p>
          <p className="mt-6 text-xs font-medium uppercase tracking-[0.14em] text-slate-400">{footerClaim}</p>
          <ul className="mt-6 flex gap-3" aria-label={t.social}>
            {company.social.map((social) => (
              <li key={social.platform}>
                {social.href ? (
                  <SmartLink href={social.href} aria-label={t.on(social.label)} className={socialClass}>
                    <SocialIcon platform={social.platform} className="size-4.5" />
                  </SmartLink>
                ) : (
                  <ComingSoon id={`social-${social.platform}`} label={social.label} tooltip={t.profileSoon} className={socialClass}>
                    <SocialIcon platform={social.platform} className="size-4.5" />
                  </ComingSoon>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Sitemap */}
        {footerNav.map((group) => (
          <nav key={group.title} aria-label={group.title} className="lg:col-span-2">
            <h3 className="font-display text-sm font-semibold text-white">{group.title}</h3>
            <ul className="mt-5 space-y-3">
              {group.items.map((item) => (
                <li key={item.label}>
                  <SmartLink href={item.href} className={linkClass}>
                    {item.label}
                  </SmartLink>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        {/* Kontakt */}
        <div className="lg:col-span-4">
          <h3 className="font-display text-sm font-semibold text-white">{t.contact}</h3>
          <address className="mt-5 space-y-4 not-italic">
            <p className="flex gap-3 text-slate-400">
              <Icon name="map-pin" className="mt-0.5 size-4 shrink-0 text-accent" />
              <span>
                {company.legalName}
                <br />
                {address.street}
                <br />
                {address.postalCode} {address.city}
              </span>
            </p>
            <p className="flex gap-3">
              <Icon name="phone" className="mt-0.5 size-4 shrink-0 text-accent" />
              <a href={contact.phoneHref} className={linkClass}>
                {contact.phone}
              </a>
            </p>
            <p className="flex gap-3">
              <Icon name="mail" className="mt-0.5 size-4 shrink-0 text-accent" />
              <a href={`mailto:${contact.email}`} className={linkClass}>
                {contact.email}
              </a>
            </p>
            <p className="flex gap-3 text-slate-400">
              <Icon name="clock" className="mt-0.5 size-4 shrink-0 text-accent" />
              {locale === "en" ? company.hoursEn : contact.hours}
            </p>
          </address>
          <div className="mt-6">
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-slate-500">{t.language}</p>
            <LanguageSwitcher />
          </div>
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container className="flex flex-col gap-4 py-6 text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p>
              © {year} {company.legalName}. {t.rights}
            </p>
            <p className="text-xs text-slate-500">
              {ownerTitle(locale)}: {company.owner}
              {hasRegisterEntry() && ` · ${company.register.court}, ${company.register.number}`} · {t.vat} {formattedVatId()}
            </p>
          </div>
          <nav aria-label={t.legal}>
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {legalNav.map((item) => (
                <li key={item.href}>
                  <SmartLink href={item.href} className={linkClass}>
                    {item.label}
                  </SmartLink>
                </li>
              ))}
            </ul>
          </nav>
        </Container>
      </div>
    </footer>
  );
}
