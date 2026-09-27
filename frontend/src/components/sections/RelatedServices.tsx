import type { ServiceSlug } from "@/types/content";
import { getServices, serviceHref } from "@/content/services";
import { getLocale } from "@/i18n/server";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { SmartLink } from "@/components/ui/SmartLink";

/** Querverweise auf die übrigen Leistungsbereiche (interne Verlinkung, SEO). */
export async function RelatedServices({ current }: { current: ServiceSlug }) {
  const locale = await getLocale();
  const others = getServices(locale).filter((service) => service.slug !== current);

  return (
    <section aria-labelledby="related-title" className="defer-render bg-white py-24 lg:py-32">
      <Container>
        <h2 id="related-title" className="text-2xl font-bold text-primary sm:text-3xl">
          {locale === "en" ? "More services from one source" : "Weitere Leistungen aus einer Hand"}
        </h2>
        <ul className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {others.map((service) => (
            <li key={service.slug}>
              <SmartLink
                href={serviceHref(service.slug)}
                className="group flex h-full flex-col rounded-2xl border border-slate-200/80 bg-surface p-6 transition-[background-color,border-color,box-shadow] duration-300 hover:border-accent/40 hover:bg-white hover:shadow-card-hover"
              >
                <span className="flex items-center justify-between">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-accent">
                    <Icon name={service.icon} className="size-5" />
                  </span>
                  <Icon
                    name="arrow-up-right"
                    className="size-5 text-slate-400 transition-[color,translate] duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent-ink"
                  />
                </span>
                <span className="mt-5 font-display text-lg font-bold text-primary">{service.name}</span>
                <span className="mt-2 text-sm leading-relaxed text-slate-600">{service.teaser}</span>
              </SmartLink>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
