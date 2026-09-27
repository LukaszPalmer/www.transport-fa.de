"use client";

import { ArrowRight, Briefcase, ChevronDown, Clock, MapPin } from "lucide-react";
import { useState, type ReactNode } from "react";
import type { CareerArea, CareerAreaId, Job } from "@/types/content";
import { useMessages } from "@/i18n/client";
import { defineMessages } from "@/i18n/config";
import { cn } from "@/lib/cn";
import { buttonClasses } from "@/components/ui/button-styles";
import { ApplicationForm, type ApplicationFormProps } from "@/components/forms/ApplicationForm";

interface CareerApplicationProps extends Pick<ApplicationFormProps, "initiative" | "licenses" | "maxCvMb"> {
  jobs: Job[];
  areas: CareerArea[];
  /** Server-gerenderter Inhalt zwischen Stellenliste und Formular (z. B. Ablauf). */
  between?: ReactNode;
  jobsHeading: ReactNode;
  formHeading: ReactNode;
}

type Filter = "alle" | CareerAreaId;

const messages = defineMessages({
  de: {
    all: "Alle Bereiche",
    filter: "Stellen nach Bereich filtern",
    details: "Details",
    close: "Schließen",
    tasks: "Ihre Aufgaben",
    profile: "Das bringen Sie mit",
    apply: "Jetzt bewerben",
    nothing: "Nichts Passendes dabei?",
    nothingText: "Bewerben Sie sich initiativ – für jeden unserer Bereiche.",
    initiative: "Initiativ bewerben",
  },
  en: {
    all: "All areas",
    filter: "Filter positions by area",
    details: "Details",
    close: "Close",
    tasks: "Your tasks",
    profile: "What you bring",
    apply: "Apply now",
    nothing: "Nothing suitable?",
    nothingText: "Send a speculative application – for any of our areas.",
    initiative: "Apply speculatively",
  },
});

/**
 * Stellenmarkt + Bewerbung als Einheit: „Jetzt bewerben“ wählt die Stelle
 * im Formular vor und scrollt dorthin. Filter nach Unternehmensbereich.
 */
export function CareerApplication({
  jobs,
  areas,
  initiative,
  licenses,
  maxCvMb,
  between,
  jobsHeading,
  formHeading,
}: CareerApplicationProps) {
  const t = useMessages(messages);
  const [filter, setFilter] = useState<Filter>("alle");
  const [position, setPosition] = useState("");
  const [formKey, setFormKey] = useState(0);

  const visibleJobs = filter === "alle" ? jobs : jobs.filter((job) => job.area === filter);
  const areaLabel = (id: CareerAreaId) => areas.find((area) => area.id === id)?.label ?? "";

  const applyFor = (jobId: string) => {
    setPosition(jobId);
    // Alle Sektionen rendern (content-visibility), damit die Zielposition exakt ist.
    document.documentElement.classList.add("render-all");
    requestAnimationFrame(() => {
      const target = document.getElementById("bewerbung");
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
      target?.querySelector<HTMLElement>("input[name='name']")?.focus({ preventScroll: true });
    });
  };

  const filters: Array<{ id: Filter; label: string; count: number }> = [
    { id: "alle", label: t.all, count: jobs.length },
    ...areas.map((area) => ({ id: area.id, label: area.label, count: jobs.filter((job) => job.area === area.id).length })),
  ];

  return (
    <>
      <section id="stellen" aria-labelledby="jobs-title" className="bg-surface py-24 lg:py-32">
        <div className="container-page">
          {jobsHeading}

          <div role="group" aria-label={t.filter} className="mt-10 flex flex-wrap gap-2">
            {filters.map((entry) => (
              <button
                key={entry.id}
                type="button"
                aria-pressed={filter === entry.id}
                onClick={() => setFilter(entry.id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                  filter === entry.id
                    ? "border-primary bg-primary text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:border-slate-400",
                )}
              >
                {entry.label}
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs tabular-nums",
                    filter === entry.id ? "bg-white/15 text-white" : "bg-slate-100 text-slate-600",
                  )}
                >
                  {entry.count}
                </span>
              </button>
            ))}
          </div>

          <ul className="mt-8 space-y-4" aria-live="polite">
            {visibleJobs.map((job) => (
              <li key={job.id}>
                <details className="group rounded-2xl border border-slate-200/80 bg-white shadow-card transition-shadow open:shadow-card-hover">
                  <summary className="flex cursor-pointer list-none flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between [&::-webkit-details-marker]:hidden">
                    <span>
                      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-ink">
                        {areaLabel(job.area)}
                      </span>
                      <span className="mt-1.5 block font-display text-lg font-bold text-primary sm:text-xl">{job.title}</span>
                      <span className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock aria-hidden="true" className="size-4" />
                          {job.employment}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin aria-hidden="true" className="size-4" />
                          {job.location}
                        </span>
                      </span>
                    </span>
                    <span className="inline-flex items-center gap-2 self-start text-sm font-semibold text-accent-ink sm:self-center">
                      <span className="group-open:hidden">{t.details}</span>
                      <span className="hidden group-open:inline">{t.close}</span>
                      <ChevronDown aria-hidden="true" className="size-4 transition-transform duration-300 group-open:rotate-180" />
                    </span>
                  </summary>

                  <div className="border-t border-slate-100 px-6 pt-6 pb-6">
                    <p className="max-w-3xl leading-relaxed text-slate-600">{job.summary}</p>
                    <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2">
                      <JobList title={t.tasks} items={job.tasks} />
                      <JobList title={t.profile} items={job.profile} />
                    </div>
                    <button type="button" onClick={() => applyFor(job.id)} className={buttonClasses({ className: "mt-8" })}>
                      {t.apply}
                      <ArrowRight aria-hidden="true" className="size-4" />
                    </button>
                  </div>
                </details>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col items-start gap-5 rounded-2xl border border-dashed border-slate-300 bg-white/60 p-6 sm:flex-row sm:items-center sm:justify-between">
            <span className="flex items-center gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-accent">
                <Briefcase aria-hidden="true" className="size-5" />
              </span>
              <span>
                <span className="block font-display font-bold text-primary">{t.nothing}</span>
                <span className="text-sm text-slate-600">{t.nothingText}</span>
              </span>
            </span>
            <button type="button" onClick={() => applyFor(initiative.id)} className={buttonClasses({ variant: "outline" })}>
              {t.initiative}
            </button>
          </div>
        </div>
      </section>

      {between}

      <section id="bewerbung" aria-labelledby="application-title" className="bg-surface py-24 lg:py-32">
        <div className="container-page grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">{formHeading}</div>
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card sm:p-10 lg:col-span-8">
            <ApplicationForm
              key={formKey}
              jobs={jobs}
              areas={areas}
              initiative={initiative}
              licenses={licenses}
              maxCvMb={maxCvMb}
              position={position}
              onPositionChange={setPosition}
              onRestart={() => {
                setPosition("");
                setFormKey((key) => key + 1);
              }}
            />
          </div>
        </div>
      </section>
    </>
  );
}

function JobList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-primary">{title}</h3>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-slate-600">
            <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
