import type { CtaLink } from "@/types/content";
import { company } from "@/content/company";
import { getHome } from "@/content/home";
import { defineMessages } from "@/i18n/config";
import { getLocale } from "@/i18n/server";
import { routes, sectionIds } from "@/content/navigation";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Icon, type IconName } from "@/components/ui/Icon";
import { SmartLink } from "@/components/ui/SmartLink";

const messages = defineMessages({
  de: { phone: "Telefon", email: "E-Mail", portal: "Kundenportal", portalValue: "Aufträge verfolgen & Dokumente abrufen" },
  en: { phone: "Phone", email: "Email", portal: "Customer portal", portalValue: "Track jobs & access documents" },
});

interface ContactCtaProps {
  title?: string;
  description?: string;
  primaryCta?: CtaLink;
}

/** Abschluss-CTA aller Hauptseiten – Texte pro Seite überschreibbar. */
export async function ContactCta({ title, description, primaryCta }: ContactCtaProps) {
  const locale = await getLocale();
  const t = messages[locale];
  const { contactCta } = getHome(locale);
  const cta = primaryCta ?? contactCta.primaryCta;
  const channels: Array<{ icon: IconName; label: string; value: string; href: string }> = [
    { icon: "phone", label: t.phone, value: company.contact.phone, href: company.contact.phoneHref },
    { icon: "mail", label: t.email, value: company.contact.email, href: `mailto:${company.contact.email}` },
    { icon: "log-in", label: t.portal, value: t.portalValue, href: routes.portal },
  ];
  return (
    <section id={sectionIds.contact} aria-labelledby="contact-title" className="defer-render bg-white pb-24 lg:pb-32">
      <Container>
        <div className="relative isolate overflow-hidden rounded-3xl bg-primary px-6 py-16 sm:px-12 lg:px-16 lg:py-20">
          {/* Dekor: Raster, Glows (Radial-Gradients statt teurem filter: blur) */}
          <div
            aria-hidden="true"
            className="bg-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_top_left,black,transparent_70%)]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[radial-gradient(34rem_26rem_at_0%_100%,rgb(56_189_248/0.2),transparent_70%),radial-gradient(26rem_20rem_at_100%_0%,rgb(0_229_255/0.1),transparent_70%)]"
          />

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <Eyebrow tone="dark">{contactCta.eyebrow}</Eyebrow>
              <h2 id="contact-title" className="mt-4 text-4xl font-bold leading-[1.08] text-white sm:text-5xl">
                {title ?? contactCta.title}
              </h2>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">{description ?? contactCta.description}</p>
              <div className="mt-10 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
                <ButtonLink href={cta.href} size="lg" withArrow>
                  {cta.label}
                </ButtonLink>
                <p className="inline-flex items-center gap-2 text-sm text-slate-400">
                  <Icon name="clock" className="size-4 text-accent" />
                  {contactCta.responseTime}
                </p>
              </div>
            </div>

            <ul className="grid grid-cols-1 gap-4 lg:col-span-5">
              {channels.map((channel) => (
                <li key={channel.label}>
                  <SmartLink
                    href={channel.href}
                    className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 transition-[background-color,border-color] duration-300 hover:border-accent/40 hover:bg-white/10"
                  >
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent ring-1 ring-accent/20">
                      <Icon name={channel.icon} className="size-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                        {channel.label}
                      </span>
                      <span className="mt-1 block truncate font-semibold text-white">{channel.value}</span>
                    </span>
                    <Icon
                      name="arrow-up-right"
                      className="size-5 shrink-0 text-slate-500 transition-[color,translate] duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent"
                    />
                  </SmartLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
