import type { Metadata } from "next";
import { company } from "@/content/company";
import { contactPage, contactTopics, topicsWithDestination } from "@/content/contact";
import { routes } from "@/content/navigation";
import { ContactForm } from "@/components/forms/ContactForm";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Icon, type IconName } from "@/components/ui/Icon";
import { SmartLink } from "@/components/ui/SmartLink";

export const metadata: Metadata = {
  title: contactPage.seo.title,
  description: contactPage.seo.description,
  alternates: { canonical: routes.contact },
};

const channels: Array<{ icon: IconName; label: string; value: string; href: string }> = [
  { icon: "phone", label: "Telefon", value: company.contact.phone, href: company.contact.phoneHref },
  { icon: "mail", label: "E-Mail", value: company.contact.email, href: `mailto:${company.contact.email}` },
];

/**
 * Kontaktseite (statisch). Die Vorauswahl der Leistung über ?leistung=…
 * übernimmt das Formular clientseitig – die Seite bleibt vorgerendert.
 */
export default function ContactPage() {
  const { address } = company;

  return (
    <>
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

      <section aria-label="Anfrageformular und Kontaktdaten" className="relative z-10 -mt-28 pb-24 lg:-mt-32 lg:pb-32">
        <Container className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div id="anfrage" className="rounded-3xl bg-white p-6 shadow-elevated ring-1 ring-primary/5 sm:p-10 lg:col-span-8">
            <h2 className="text-2xl font-bold text-primary sm:text-3xl">Anfrage & Angebot</h2>
            <p className="mt-2 mb-8 text-slate-600">
              Kostenlos und unverbindlich – je genauer Ihre Angaben, desto präziser unser Angebot.
            </p>
            <ContactForm topics={contactTopics} destinationTopics={topicsWithDestination} />
          </div>

          <aside className="space-y-6 lg:col-span-4">
            <div className="rounded-3xl bg-primary p-8 text-white shadow-elevated">
              <h2 className="font-display text-lg font-bold">Direkter Draht</h2>
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
                Erreichbarkeit
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
                Standort
              </h2>
              <address className="mt-4 text-sm leading-relaxed text-slate-600 not-italic">
                {company.legalName}
                <br />
                {address.street}
                <br />
                {address.postalCode} {address.city}
              </address>
              <SmartLink
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${company.legalName}, ${address.street}, ${address.postalCode} ${address.city}`,
                )}`}
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-ink underline-offset-4 hover:underline"
              >
                Route planen
                <Icon name="arrow-up-right" className="size-4" />
              </SmartLink>
            </div>

            <div className="rounded-3xl border border-dashed border-slate-300 p-8">
              <h2 className="font-display text-lg font-bold text-primary">Bestandskunde?</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Aufträge, Termine und Dokumente finden Sie jederzeit in Ihrem Kundenportal.
              </p>
              <SmartLink
                href={routes.portal}
                prefetch={false}
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-ink underline-offset-4 hover:underline"
              >
                Zum Kundenportal
                <Icon name="arrow-right" className="size-4" />
              </SmartLink>
            </div>
          </aside>
        </Container>
      </section>
    </>
  );
}
