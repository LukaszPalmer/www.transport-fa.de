"use client";

import Link from "next/link";
import { useActionState, useId, useRef } from "react";
import type { CareerArea, Job } from "@/types/content";
import { submitApplication } from "@/app/actions/application";
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
  const [state, formAction, pending] = useActionState(submitApplication, initialFormState);
  const formRef = useRef<HTMLFormElement>(null);
  const onSubmit = useSubmitWithoutReset(formAction);
  const positionId = useId();
  useFocusFirstError(formRef, state.status === "error" ? state : null);

  if (state.status === "success") {
    return (
      <FormSuccess title="Bewerbung gesendet" message={state.message ?? "Vielen Dank! Wir melden uns in Kürze."}>
        <button type="button" onClick={onRestart} className="font-semibold text-accent-ink underline underline-offset-4">
          Weitere Bewerbung senden
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

      <FieldShell id={positionId} label="Stelle" required error={errors.position}>
        <select
          id={positionId}
          name="position"
          value={position}
          onChange={(event) => onPositionChange(event.target.value)}
          className={selectClasses}
          {...describedBy(positionId, undefined, errors.position)}
        >
          <option value="" disabled>
            Bitte wählen Sie eine Stelle
          </option>
          <option value={initiative.id}>{initiative.title} – für alle Bereiche</option>
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
        <TextField name="name" label="Vor- und Nachname" required autoComplete="name" defaultValue={value("name")} error={errors.name} />
        <TextField
          name="phone"
          type="tel"
          label="Telefon"
          required
          autoComplete="tel"
          inputMode="tel"
          hint="Wir rufen Sie gern zurück."
          defaultValue={value("phone")}
          error={errors.phone}
        />
        <TextField
          name="email"
          type="email"
          label="E-Mail"
          required
          autoComplete="email"
          inputMode="email"
          defaultValue={value("email")}
          error={errors.email}
          className="sm:col-span-2"
        />
        <SelectField
          name="start"
          label="Frühester Start"
          defaultValue={value("start")}
          options={[
            { value: "Sofort", label: "Sofort" },
            { value: "In 1 Monat", label: "In 1 Monat" },
            { value: "In 2–3 Monaten", label: "In 2–3 Monaten" },
            { value: "Später / nach Absprache", label: "Später / nach Absprache" },
          ]}
          error={errors.start}
        />
        <SelectField
          name="experience"
          label="Berufserfahrung"
          defaultValue={value("experience")}
          options={[
            { value: "keine", label: "Keine – Quereinstieg" },
            { value: "unter-2", label: "Unter 2 Jahre" },
            { value: "2-5", label: "2 – 5 Jahre" },
            { value: "ueber-5", label: "Mehr als 5 Jahre" },
          ]}
          error={errors.experience}
        />
      </div>

      <fieldset>
        <legend className="mb-3 text-sm font-semibold text-primary">
          Führerscheinklassen <span className="font-normal text-slate-500">(optional)</span>
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
              <input
                type="checkbox"
                name="licenses"
                value={license}
                defaultChecked={submittedLicenses.includes(license)}
                className="sr-only"
              />
              {license}
            </label>
          ))}
        </div>
      </fieldset>

      <TextAreaField
        name="message"
        label="Kurz zu Ihnen"
        rows={4}
        maxLength={3000}
        placeholder="Was machen Sie aktuell? Was ist Ihnen bei uns wichtig? Ein Anschreiben ist nicht nötig."
        defaultValue={value("message")}
        error={errors.message}
      />

      <FileField
        name="cv"
        label="Lebenslauf"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        maxSizeMb={maxCvMb}
        hint={`PDF, Word oder Foto · max. ${maxCvMb} MB`}
        error={errors.cv}
      />

      <div className="rounded-xl bg-surface p-5">
        <CheckboxField name="privacy" required defaultChecked={value("privacy") === "on"} error={errors.privacy}>
          Ich habe die{" "}
          <Link href="/datenschutz" target="_blank" className="font-semibold text-accent-ink underline underline-offset-4">
            Datenschutzerklärung
          </Link>{" "}
          gelesen und bin mit der Verarbeitung meiner Bewerbungsdaten einverstanden. Die Daten werden nach Abschluss
          des Verfahrens spätestens nach 6 Monaten gelöscht.
          <span className="text-red-600" aria-hidden="true">
            {" "}
            *
          </span>
        </CheckboxField>
      </div>

      <FormError message={state.status === "error" ? state.message : undefined} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500">
          <span className="text-red-600">*</span> Pflichtfelder · Rückmeldung innerhalb von 48 Stunden
        </p>
        <SubmitButton pending={pending}>Bewerbung absenden</SubmitButton>
      </div>
    </form>
  );
}
