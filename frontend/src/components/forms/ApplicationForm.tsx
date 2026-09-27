"use client";

import Link from "next/link";
import { useActionState, useId, useRef } from "react";
import type { CareerArea, Job } from "@/types/content";
import { submitApplication } from "@/app/actions/application";
import { useLocale, useMessages } from "@/i18n/client";
import { defineMessages } from "@/i18n/config";
import { initialFormState } from "@/lib/form-state";
import { cn } from "@/lib/cn";
import { FileField } from "./FileField";
import { CheckboxField, describedBy, FieldShell, SelectField, selectClasses, TextAreaField, TextField } from "./fields";
import { FormError, FormSuccess, SpamGuardFields, SubmitButton, useFocusFirstError, useSubmitWithoutReset } from "./FormParts";

export interface ApplicationFormProps {
  jobs: Pick<Job, "id" | "title" | "area">[];
  areas: CareerArea[];
  initiative: { id: string; title: string };
  licenses: readonly string[];
  maxCvMb: number;
  /** Gesteuert von der Stellenliste („Jetzt bewerben“). */
  position: string;
  onPositionChange: (id: string) => void;
  onRestart: () => void;
}

const messages = defineMessages({
  de: {
    sentTitle: "Bewerbung gesendet",
    sentFallback: "Vielen Dank! Wir melden uns in Kürze.",
    another: "Weitere Bewerbung senden",
    position: "Stelle",
    choose: "Bitte wählen Sie eine Stelle",
    allAreas: "für alle Bereiche",
    name: "Vor- und Nachname",
    phone: "Telefon",
    phoneHint: "Wir rufen Sie gern zurück.",
    email: "E-Mail",
    start: "Frühester Start",
    startOptions: ["Sofort", "In 1 Monat", "In 2–3 Monaten", "Später / nach Absprache"],
    experience: "Berufserfahrung",
    experienceOptions: { keine: "Keine – Quereinstieg", "unter-2": "Unter 2 Jahre", "2-5": "2 – 5 Jahre", "ueber-5": "Mehr als 5 Jahre" },
    licenses: "Führerscheinklassen",
    about: "Kurz zu Ihnen",
    aboutPlaceholder: "Was machen Sie aktuell? Was ist Ihnen bei uns wichtig? Ein Anschreiben ist nicht nötig.",
    cv: "Lebenslauf",
    cvHint: (mb: number) => `PDF, Word oder Foto · max. ${mb} MB`,
    privacyBefore: "Ich habe die",
    privacyLink: "Datenschutzerklärung",
    privacyAfter:
      "gelesen und bin mit der Verarbeitung meiner Bewerbungsdaten einverstanden. Die Daten werden nach Abschluss des Verfahrens spätestens nach 6 Monaten gelöscht.",
    required: "Pflichtfelder · Rückmeldung innerhalb von 48 Stunden",
    submit: "Bewerbung absenden",
  },
  en: {
    sentTitle: "Application sent",
    sentFallback: "Thank you! We will be in touch shortly.",
    another: "Send another application",
    position: "Position",
    choose: "Please choose a position",
    allAreas: "for all areas",
    name: "First and last name",
    phone: "Phone",
    phoneHint: "We are happy to call you back.",
    email: "Email",
    start: "Earliest start",
    startOptions: ["Immediately", "In 1 month", "In 2–3 months", "Later / by arrangement"],
    experience: "Work experience",
    experienceOptions: { keine: "None – career changer", "unter-2": "Less than 2 years", "2-5": "2 – 5 years", "ueber-5": "More than 5 years" },
    licenses: "Driving licence classes",
    about: "About you",
    aboutPlaceholder: "What are you doing at the moment? What matters to you? No cover letter needed.",
    cv: "CV",
    cvHint: (mb: number) => `PDF, Word or photo · max. ${mb} MB`,
    privacyBefore: "I have read the",
    privacyLink: "privacy policy",
    privacyAfter: "and agree to my application data being processed. The data will be deleted no later than 6 months after the process ends.",
    required: "Required fields · response within 48 hours",
    submit: "Submit application",
  },
});

/** Werte für die Büro-Mail bleiben deutsch – nur die Beschriftung wechselt. */
const START_VALUES = ["Sofort", "In 1 Monat", "In 2–3 Monaten", "Später / nach Absprache"];
const EXPERIENCE_VALUES = ["keine", "unter-2", "2-5", "ueber-5"] as const;

export function ApplicationForm({
  jobs,
  areas,
  initiative,
  licenses,
  maxCvMb,
  position,
  onPositionChange,
  onRestart,
}: ApplicationFormProps) {
  const locale = useLocale();
  const t = useMessages(messages);
  const [state, formAction, pending] = useActionState(submitApplication, initialFormState);
  const formRef = useRef<HTMLFormElement>(null);
  const onSubmit = useSubmitWithoutReset(formAction);
  const positionId = useId();
  useFocusFirstError(formRef, state.status === "error" ? state : null);

  if (state.status === "success") {
    return (
      <FormSuccess title={t.sentTitle} message={state.message ?? t.sentFallback}>
        <button type="button" onClick={onRestart} className="font-semibold text-accent-ink underline underline-offset-4">
          {t.another}
        </button>
      </FormSuccess>
    );
  }

  const errors = state.fieldErrors ?? {};
  const value = (name: string) => (typeof state.values?.[name] === "string" ? (state.values[name] as string) : undefined);
  const submittedLicenses = Array.isArray(state.values?.licenses)
    ? state.values.licenses
    : typeof state.values?.licenses === "string"
      ? [state.values.licenses]
      : [];

  return (
    <form ref={formRef} action={formAction} onSubmit={onSubmit} noValidate className="relative space-y-8">
      <SpamGuardFields />
      <input type="hidden" name="locale" value={locale} />

      <FieldShell id={positionId} label={t.position} required error={errors.position}>
        <select
          id={positionId}
          name="position"
          value={position}
          onChange={(event) => onPositionChange(event.target.value)}
          className={selectClasses}
          {...describedBy(positionId, undefined, errors.position)}
        >
          <option value="" disabled>
            {t.choose}
          </option>
          <option value={initiative.id}>
            {initiative.title} – {t.allAreas}
          </option>
          {areas.map((area) => (
            <optgroup key={area.id} label={area.label}>
              {jobs
                .filter((job) => job.area === area.id)
                .map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>
      </FieldShell>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <TextField name="name" label={t.name} required autoComplete="name" defaultValue={value("name")} error={errors.name} />
        <TextField
          name="phone"
          type="tel"
          label={t.phone}
          required
          autoComplete="tel"
          inputMode="tel"
          hint={t.phoneHint}
          defaultValue={value("phone")}
          error={errors.phone}
        />
        <TextField
          name="email"
          type="email"
          label={t.email}
          required
          autoComplete="email"
          inputMode="email"
          defaultValue={value("email")}
          error={errors.email}
          className="sm:col-span-2"
        />
        <SelectField
          name="start"
          label={t.start}
          defaultValue={value("start")}
          options={START_VALUES.map((entry, index) => ({ value: entry, label: t.startOptions[index] ?? entry }))}
          error={errors.start}
        />
        <SelectField
          name="experience"
          label={t.experience}
          defaultValue={value("experience")}
          options={EXPERIENCE_VALUES.map((entry) => ({ value: entry, label: t.experienceOptions[entry] }))}
          error={errors.experience}
        />
      </div>

      <fieldset>
        <legend className="mb-3 text-sm font-semibold text-primary">
          {t.licenses} <span className="font-normal text-slate-500">(optional)</span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {licenses.map((license) => (
            <label
              key={license}
              className={cn(
                "cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors",
                "hover:border-slate-400 has-[:checked]:border-accent-ink has-[:checked]:bg-sky-50 has-[:checked]:text-accent-ink",
                "has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-accent/30",
              )}
            >
              <input type="checkbox" name="licenses" value={license} defaultChecked={submittedLicenses.includes(license)} className="sr-only" />
              {license}
            </label>
          ))}
        </div>
      </fieldset>

      <TextAreaField
        name="message"
        label={t.about}
        rows={4}
        maxLength={3000}
        placeholder={t.aboutPlaceholder}
        defaultValue={value("message")}
        error={errors.message}
      />

      <FileField name="cv" label={t.cv} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" maxSizeMb={maxCvMb} hint={t.cvHint(maxCvMb)} error={errors.cv} />

      <div className="rounded-xl bg-surface p-5">
        <CheckboxField name="privacy" required defaultChecked={value("privacy") === "on"} error={errors.privacy}>
          {t.privacyBefore}{" "}
          <Link href="/datenschutz" target="_blank" className="font-semibold text-accent-ink underline underline-offset-4">
            {t.privacyLink}
          </Link>{" "}
          {t.privacyAfter}
          <span className="text-red-600" aria-hidden="true">
            {" "}
            *
          </span>
        </CheckboxField>
      </div>

      <FormError message={state.status === "error" ? state.message : undefined} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500">
          <span className="text-red-600">*</span> {t.required}
        </p>
        <SubmitButton pending={pending}>{t.submit}</SubmitButton>
      </div>
    </form>
  );
}
