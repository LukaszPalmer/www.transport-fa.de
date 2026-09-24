"use client";

import { useActionState, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { submitContact } from "@/app/actions/contact";
import { initialFormState } from "@/lib/form-state";
import { ChoiceCards } from "./ChoiceCards";
import { CheckboxField, TextAreaField, TextField } from "./fields";
import { FormError, FormSuccess, SpamGuardFields, SubmitButton, useFocusFirstError, useSubmitWithoutReset } from "./FormParts";

interface ContactFormProps {
  topics: Array<{ value: string; label: string; description?: string }>;
  /** Themen, bei denen zusätzlich eine Zieladresse abgefragt wird. */
  destinationTopics: string[];
}

// Vorauswahl aus ?leistung=… – liest die URL erst nach der Hydration,
// damit die Seite statisch vorgerendert bleiben kann.
const noopSubscribe = () => () => {};
const readTopicFromUrl = () => new URLSearchParams(window.location.search).get("leistung");

/** Kontakt-/Angebotsformular mit Remount-Key für „Neue Anfrage“. */
export function ContactForm(props: ContactFormProps) {
  const [formKey, setFormKey] = useState(0);
  return <ContactFormInner key={formKey} {...props} onRestart={() => setFormKey((key) => key + 1)} />;
}

function ContactFormInner({ topics, destinationTopics, onRestart }: ContactFormProps & { onRestart: () => void }) {
  const [state, formAction, pending] = useActionState(submitContact, initialFormState);
  const formRef = useRef<HTMLFormElement>(null);
  const onSubmit = useSubmitWithoutReset(formAction);
  useFocusFirstError(formRef, state.status === "error" ? state : null);

  const urlTopic = useSyncExternalStore(noopSubscribe, readTopicFromUrl, () => null);
  const [chosenTopic, setChosenTopic] = useState<string>();
  const submittedTopic = typeof state.values?.topic === "string" ? state.values.topic : undefined;
  const topic = chosenTopic ?? submittedTopic ?? (topics.some((entry) => entry.value === urlTopic) ? urlTopic! : "");
  const needsDestination = destinationTopics.includes(topic);

  if (state.status === "success") {
    return (
      <FormSuccess title="Anfrage gesendet" message={state.message ?? "Vielen Dank! Wir melden uns in Kürze bei Ihnen."}>
        <button type="button" onClick={onRestart} className="font-semibold text-accent-ink underline underline-offset-4">
          Weitere Anfrage senden
        </button>
      </FormSuccess>
    );
  }

  const errors = state.fieldErrors ?? {};
  const value = (name: string) => (typeof state.values?.[name] === "string" ? (state.values[name] as string) : undefined);

  return (
    <form ref={formRef} action={formAction} onSubmit={onSubmit} noValidate className="relative space-y-8">
      <SpamGuardFields />

      <ChoiceCards
        name="topic"
        legend="Worum geht es?"
        options={topics}
        value={topic}
        onChange={setChosenTopic}
        error={errors.topic}
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <TextField name="name" label="Vor- und Nachname" required autoComplete="name" defaultValue={value("name")} error={errors.name} />
        <TextField name="company" label="Firma" autoComplete="organization" defaultValue={value("company")} error={errors.company} />
        <TextField
          name="email"
          type="email"
          label="E-Mail"
          required
          autoComplete="email"
          inputMode="email"
          defaultValue={value("email")}
          error={errors.email}
        />
        <TextField
          name="phone"
          type="tel"
          label="Telefon"
          autoComplete="tel"
          inputMode="tel"
          hint="Für Rückfragen – schneller als E-Mail."
          defaultValue={value("phone")}
          error={errors.phone}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <TextField
          name="from"
          label={needsDestination ? "Von (PLZ / Ort)" : "Objektadresse (PLZ / Ort)"}
          autoComplete="postal-code"
          placeholder="z. B. 12345 Musterstadt"
          defaultValue={value("from")}
          error={errors.from}
        />
        {needsDestination && (
          <TextField
            name="to"
            label="Nach (PLZ / Ort)"
            placeholder="z. B. 80331 München"
            defaultValue={value("to")}
            error={errors.to}
          />
        )}
        <TextField name="date" type="date" label="Wunschtermin" defaultValue={value("date")} error={errors.date} />
      </div>

      <TextAreaField
        name="message"
        label="Ihre Nachricht"
        required
        rows={5}
        maxLength={4000}
        placeholder="Zum Beispiel: 3-Zimmer-Wohnung, 2. OG ohne Aufzug, ca. 25 Kartons, Küche muss abgebaut werden …"
        defaultValue={value("message")}
        error={errors.message}
      />

      <div className="space-y-4 rounded-xl bg-surface p-5">
        <CheckboxField name="callback" defaultChecked={value("callback") === "on"}>
          Bitte rufen Sie mich für eine kostenlose Beratung zurück.
        </CheckboxField>
        <CheckboxField name="privacy" required defaultChecked={value("privacy") === "on"} error={errors.privacy}>
          Ich habe die{" "}
          <Link href="/datenschutz" target="_blank" className="font-semibold text-accent-ink underline underline-offset-4">
            Datenschutzerklärung
          </Link>{" "}
          gelesen und bin mit der Verarbeitung meiner Angaben zur Bearbeitung der Anfrage einverstanden.
          <span className="text-red-600" aria-hidden="true">
            {" "}
            *
          </span>
        </CheckboxField>
      </div>

      <FormError message={state.status === "error" ? state.message : undefined} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500">
          <span className="text-red-600">*</span> Pflichtfelder · Antwort meist innerhalb von 2 Stunden
        </p>
        <SubmitButton pending={pending}>Anfrage senden</SubmitButton>
      </div>
    </form>
  );
}
