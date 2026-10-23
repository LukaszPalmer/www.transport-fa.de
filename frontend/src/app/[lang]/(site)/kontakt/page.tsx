import { formattedVatId, ownerTitle } from "@fa/shared";
import type { Metadata } from "next";
import { company } from "@/content/company";
import { getContact } from "@/content/contact";
import { defineMessages } from "@/i18n/config";
import { getLocale } from "@/i18n/server";
import { routes } from "@/content/navigation";
import { pageMetadata } from "@/lib/seo";
import { webPageJsonLd } from "@/lib/structured-data";
import { ContactForm } from "@/components/forms/ContactForm";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Icon, type IconName } from "@/components/ui/Icon";
import { JsonLd } from "@/components/ui/JsonLd";
import { SmartLink } from "@/components/ui/SmartLink";

const messages = defineMessages({
  de: {
    phone: "Telefon",
    email: "E-Mail",
    section: "Anfrageformular und Kontaktdaten",
    formTitle: "Anfrage & Angebot",
    formText: "Kostenlos und unverbindlich – je genauer Ihre Angaben, desto präziser unser Angebot.",
    direct: "Direkter Draht",
    hours: "Erreichbarkeit",
    location: "Standort",
    vat: "USt-IdNr.",
    route: "Route planen",
    existing: "Bestandskunde?",
    existingText: "Aufträge, Termine und Dokumente finden Sie jederzeit in Ihrem Kundenportal.",
    toPortal: "Zum Kundenportal",
    home: "Startseite",
    breadcrumbs: "Brotkrumen",
    contact: "Kontakt",
  },
  en: {
    phone: "Phone",
    email: "Email",
    section: "Enquiry form and contact details",
    formTitle: "Enquiry & quote",
    formText: "Free and without obligation – the more precise your details, the more accurate our quote.",
    direct: "Direct line",
    hours: "Opening hours",
    location: "Location",
    vat: "VAT ID",
    route: "Plan your route",
    existing: "Existing customer?",
    existingText: "You can find your jobs, appointments and documents in your customer portal at any time.",
    toPortal: "To the customer portal",
    home: "Home",
    breadcrumbs: "Breadcrumbs",
    contact: "Contact",
  },
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const { contactPage } = getContact(locale);
  return pageMetadata({ path: routes.contact, locale, title: contactPage.seo.title, description: contactPage.seo.description });
}

/**
 * Kontaktseite (statisch). Die Vorauswahl der Leistung über ?leistung=…
 * übernimmt das Formular clientseitig – die Seite bleibt vorgerendert.
 */
export default async function ContactPage() {
  const locale = await getLocale();
  const t = messages[locale];
  const { contactPage, contactTopics, topicsWithDestination } = getContact(locale);
  const { address } = company;
  const channels: Array<{ icon: IconName; label: string; value: string; href: string }> = [
    { icon: "phone", label: t.phone, value: company.contact.phone, href: company.contact.phoneHref },
    { icon: "mail", label: t.email, value: company.contact.email, href: `mailto:${company.contact.email}` },
  ];

  return (
    <>
      <JsonLd
        data={webPageJsonLd({
          path: routes.contact,
          locale,
          type: "ContactPage",
          name: contactPage.seo.title,
          description: contactPage.seo.description,
          breadcrumbs: [{ name: t.contact, path: routes.contact }],
        })}
      />
      <section className="relative isolate overflow-hidden bg-primary pt-36 pb-40 lg:pt-44 lg:pb-48">
        <div
          aria-hidden="true"
          className="bg-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_30%_20%,black,transparent_75%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(50rem_30rem_at_100%_0%,rgb(56_189_248/0.18),transparent_65%)]"
        />
        <Container>
          <Breadcrumbs
            label={t.breadcrumbs}
            items={[
              { label: t.home, href: "/" },
              { label: t.contact, href: routes.contact },
            ]}
            className="mb-5"
          />
          <Eyebrow tone="dark">{contactPage.eyebrow}</Eyebrow>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] text-white sm:text-5xl lg:text-6xl">
            {contactPage.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300 sm:text-xl">{contactPage.description}</p>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-300">
            {contactPage.promises.map((promise) => (
              <li key={promise} className="inline-flex items-center gap-2">
                <Icon name="check" className="size-4 text-accent" strokeWidth={2.5} />
                {promise}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section aria-label={t.section} className="relative z-10 -mt-28 pb-24 lg:-mt-32 lg:pb-32">
        <Container className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div id="anfrage" className="rounded-3xl bg-white p-6 shadow-elevated ring-1 ring-primary/5 sm:p-10 lg:col-span-8">
            <h2 className="text-2xl font-bold text-primary sm:text-3xl">{t.formTitle}</h2>
            <p className="mt-2 mb-8 text-slate-600">{t.formText}</p>
            <ContactForm topics={contactTopics} destinationTopics={topicsWithDestination} />
          </div>

          <aside className="space-y-6 lg:col-span-4">
            <div className="rounded-3xl bg-primary p-8 text-white shadow-elevated">
              <h2 className="font-display text-lg font-bold">{t.direct}</h2>
              <ul className="mt-6 space-y-4">
                {channels.map((channel) => (
                  <li key={channel.label}>
                    <SmartLink
                      href={channel.href}
                      className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 transition-colors hover:border-accent/40 hover:bg-white/10"
                    >
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent ring-1 ring-accent/20">
                        <Icon name={channel.icon} className="size-5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                          {channel.label}
                        </span>
                        <span className="mt-0.5 block truncate font-semibold">{channel.value}</span>
                      </span>
                    </SmartLink>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-card">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold text-primary">
                <Icon name="clock" className="size-5 text-accent-ink" />
                {t.hours}
              </h2>
              <dl className="mt-5 space-y-3 text-sm">
                {contactPage.hours.map((entry) => (
                  <div key={entry.days} className="flex justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                    <dt className="text-slate-600">{entry.days}</dt>
                    <dd className="font-semibold text-primary">{entry.time}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-card">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold text-primary">
                <Icon name="map-pin" className="size-5 text-accent-ink" />
                {t.location}
              </h2>
              <address className="mt-4 text-sm leading-relaxed text-slate-600 not-italic">
                {company.legalName}
                <br />
                {address.street}
                <br />
                {address.postalCode} {address.city}
              </address>
              <p className="mt-3 text-xs leading-relaxed text-slate-500">
                {ownerTitle(locale)}: {company.owner}
                <br />
                {t.vat} {formattedVatId()}
              </p>
              <SmartLink
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${company.legalName}, ${address.street}, ${address.postalCode} ${address.city}`,
                )}`}
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-ink underline-offset-4 hover:underline"
              >
                {t.route}
                <Icon name="arrow-up-right" className="size-4" />
              </SmartLink>
            </div>

            <div className="rounded-3xl border border-dashed border-slate-300 p-8">
              <h2 className="font-display text-lg font-bold text-primary">{t.existing}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{t.existingText}</p>
              <SmartLink
                href={routes.portal}
                prefetch={false}
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-ink underline-offset-4 hover:underline"
              >
                {t.toPortal}
                <Icon name="arrow-right" className="size-4" />
              </SmartLink>
            </div>
          </aside>
        </Container>
      </section>
    </>
  );
}
