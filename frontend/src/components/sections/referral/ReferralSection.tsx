import { company } from "@/content/company";
import { sectionIds } from "@/content/navigation";
import { referralProgram } from "@/content/referral";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { InViewAnimations } from "@/components/ui/InViewAnimations";
import { SectionHeading } from "@/components/ui/SectionHeading";

/**
 * Startseite: Empfehlungsprogramm – Kunden vermitteln, Provision bei Auftrag.
 * Links Botschaft und Zielgruppen, rechts die Provisionskarte, darunter der Ablauf in drei Schritten.
 */
export function ReferralSection() {
  const program = referralProgram;

  return (
    <section id={sectionIds.referral} aria-labelledby="referral-title" className="defer-render relative isolate overflow-hidden bg-primary py-24 lg:py-32">
      <div aria-hidden="true" className="bg-grid absolute inset-0 -z-10 opacity-70 [mask-image:radial-gradient(ellipse_at_70%_40%,black,transparent_70%)]" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(40rem_30rem_at_85%_35%,rgb(56_189_248/0.2),transparent_70%)]" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(34rem_24rem_at_0%_100%,rgb(0_229_255/0.08),transparent_70%)]" />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-10 -z-10 font-display text-[26rem] leading-none font-extrabold text-white/[0.025] select-none lg:text-[34rem]"
      >
        %
      </span>

      <Container>
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7 xl:col-span-6">
            <SectionHeading
              id="referral-title"
              tone="dark"
              eyebrow={program.eyebrow}
              title={
                <>
                  {program.title} <span className="text-gradient-accent">{program.titleAccent}</span>
                </>
              }
              description={program.description}
            />

            <p className="mt-10 text-xs font-semibold tracking-[0.14em] text-slate-400 uppercase">Ideal für</p>
            <ul className="mt-4 flex flex-wrap gap-2.5">
              {program.audiences.map((audience) => (
                <li key={audience} className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium text-slate-200">
                  <Icon name="check" className="size-4 text-accent" strokeWidth={2.5} />
                  {audience}
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-5 xl:col-span-5 xl:col-start-8">
            <CommissionCard />
          </div>
        </div>

        <div className="relative mt-20 lg:mt-28">
          <div aria-hidden="true" className="absolute top-10 right-[16.66%] left-[16.66%] hidden h-px bg-linear-to-r from-accent/10 via-accent/60 to-accent/10 md:block" />
          <ol className="relative grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8" aria-label="So funktioniert es">
            {program.steps.map((step, index) => (
              <li key={step.title} className="relative flex flex-col items-center text-center">
                <span className="relative flex size-20 items-center justify-center rounded-full bg-primary ring-1 ring-white/15">
                  <span className="flex size-14 items-center justify-center rounded-full bg-linear-to-br from-accent to-accent-bright text-primary shadow-glow">
                    <Icon name={step.icon} className="size-6" strokeWidth={2} />
                  </span>
                  <span className="absolute -top-1 -right-1 flex size-7 items-center justify-center rounded-full bg-white text-xs font-bold text-primary ring-4 ring-primary">
                    {index + 1}
                  </span>
                </span>
                <h3 className="mt-6 text-lg font-bold text-white">{step.title}</h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-slate-400">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}

/** Provisionskarte: „Verhandelbar" als Kernaussage, Vorteile, Handlungsaufforderung. */
function CommissionCard() {
  const { card, cta } = referralProgram;
  const { contact } = company;

  return (
    <InViewAnimations className="relative">
      <div aria-hidden="true" className="absolute -inset-8 -z-10 rounded-full bg-[radial-gradient(closest-side,rgb(56_189_248/0.22),transparent)]" />

      {/* Schwebende Bestätigung – rein dekorativ */}
      <div aria-hidden="true" className="glass absolute -top-11 -left-6 z-10 hidden animate-float items-center gap-3 rounded-2xl py-3 pr-4 pl-3 sm:flex">
        <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-300">
          <Icon name="handshake" className="size-5" />
        </span>
        <span className="leading-tight">
          <span className="block text-xs font-bold text-white">Empfehlung erfolgreich</span>
          <span className="block text-[0.6875rem] text-slate-300">Auftrag erteilt · Provision folgt</span>
        </span>
      </div>

      <div className="relative overflow-hidden rounded-3xl bg-white/[0.06] p-6 shadow-elevated ring-1 ring-white/12 backdrop-blur-xl sm:p-10">
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-accent/70 to-transparent" />

        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-semibold tracking-[0.16em] text-accent uppercase">{card.label}</p>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-2.5 py-1 text-[0.6875rem] font-semibold text-emerald-300">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-emerald-400" />
            Bei erteiltem Auftrag
          </span>
        </div>

        <div className="mt-7 flex items-center gap-4 sm:gap-5">
          <span aria-hidden="true" className="relative flex size-16 shrink-0 items-center justify-center sm:size-20">
            <span className="absolute inset-0 animate-pulse-ring rounded-2xl bg-accent/40" />
            <span className="relative flex size-16 items-center justify-center rounded-2xl bg-linear-to-br from-accent to-accent-bright font-display text-3xl font-extrabold text-primary shadow-glow sm:size-20 sm:text-4xl">
              %
            </span>
          </span>
          <div className="min-w-0">
            <p className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl xl:text-[2.75rem]">{card.value}</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-300">{card.note}</p>
          </div>
        </div>

        <div aria-hidden="true" className="my-8 h-px bg-white/10" />

        <ul className="space-y-3.5">
          {card.benefits.map((benefit) => (
            <li key={benefit} className="flex gap-3 text-sm leading-relaxed text-slate-200">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                <Icon name="check" className="size-3.5" strokeWidth={3} />
              </span>
              {benefit}
            </li>
          ))}
        </ul>

        <ButtonLink href={cta.href} size="lg" withArrow className="mt-9 w-full">
          {cta.label}
        </ButtonLink>
        <p className="mt-4 text-center text-sm text-slate-400">
          Lieber persönlich?{" "}
          <a href={contact.phoneHref} className="font-semibold text-white underline-offset-4 hover:underline">
            {contact.phone}
          </a>
        </p>
      </div>
    </InViewAnimations>
  );
}
