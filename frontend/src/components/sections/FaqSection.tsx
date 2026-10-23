import type { Faq } from "@/types/content";
import { routes } from "@/content/navigation";
import { getLocale } from "@/i18n/server";
import { faqAnchor } from "@/lib/anchors";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

interface FaqSectionProps {
  faqs: Faq[];
  title?: string;
  contactHref?: string;
}

/**
 * Häufige Fragen als natives Akkordeon (<details name> = exklusiv öffnend,
 * ohne JavaScript). Die strukturierten Daten (FAQPage) liefert die Seite.
 * Jede Frage hat einen festen Anker (#faq-…) – Deep-Links öffnen sie (AnchorScroll).
 */
export async function FaqSection({ faqs, title, contactHref = routes.contactForm }: FaqSectionProps) {
  const en = (await getLocale()) === "en";
  return (
    <section aria-labelledby="faq-title" className="defer-render bg-surface py-24 lg:py-32">
      <Container className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionHeading
            id="faq-title"
            eyebrow="FAQ"
            title={title ?? (en ? "Frequently asked questions" : "Häufige Fragen")}
            description={en ? "Can't find your question? We are happy to advise you personally and without obligation." : "Ihre Frage ist nicht dabei? Wir beraten Sie gern persönlich und unverbindlich."}
          />
          <ButtonLink href={contactHref} variant="dark" withArrow className="mt-8">
            {en ? "Ask a question" : "Frage stellen"}
          </ButtonLink>
        </div>

        <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200/80 bg-white px-6 shadow-card sm:px-8 lg:col-span-8">
          {faqs.map((faq, index) => (
            <details key={faq.question} id={faqAnchor(faq.question)} name="faq" open={index === 0} className="group scroll-mt-28 py-2">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 rounded-lg py-4 text-left font-display text-lg font-semibold text-primary [&::-webkit-details-marker]:hidden">
                {faq.question}
                <span
                  aria-hidden="true"
                  className="relative flex size-8 shrink-0 items-center justify-center rounded-full bg-surface ring-1 ring-slate-200 transition-colors group-open:bg-primary group-open:ring-primary"
                >
                  <span className="absolute h-0.5 w-3 rounded-full bg-primary transition-colors group-open:bg-accent" />
                  <span className="absolute h-3 w-0.5 rounded-full bg-primary transition-transform duration-300 group-open:scale-y-0" />
                </span>
              </summary>
              <p className="pb-5 pr-12 text-[0.9375rem] leading-relaxed text-slate-600">{faq.answer}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
