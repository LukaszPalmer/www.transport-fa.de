"use client";

import { useActionState, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { submitContact } from "@/app/actions/contact";
import { useLocale, useMessages } from "@/i18n/client";
import { defineMessages } from "@/i18n/config";
import { initialFormState } from "@/lib/form-state";
import { ChoiceCards } from "./ChoiceCards";
import { CheckboxField, TextAreaField, TextField } from "./fields";
import { FormError, FormSuccess, SpamGuardFields, SubmitButton, useFocusFirstError, useSubmitWithoutReset } from "./FormParts";

interface ContactFormProps {
  topics: Array<{ value: string; label: string; description?: string }>;
  /** Themen, bei denen zusätzlich eine Zieladresse abgefragt wird. */
  destinationTopics: string[];
}

const messages = defineMessages({
  de: {
    sentTitle: "Anfrage gesendet",
    sentFallback: "Vielen Dank! Wir melden uns in Kürze bei Ihnen.",
    another: "Weitere Anfrage senden",
    topic: "Worum geht es?",
    name: "Vor- und Nachname",
    company: "Firma",
    email: "E-Mail",
    phone: "Telefon",
    phoneHint: "Für Rückfragen – schneller als E-Mail.",
    from: "Von (PLZ / Ort)",
    object: "Objektadresse (PLZ / Ort)",
    fromPlaceholder: "z. B. 40210 Düsseldorf",
    to: "Nach (PLZ / Ort)",
    toPlaceholder: "z. B. 80331 München",
    date: "Wunschtermin",
    message: "Ihre Nachricht",
    referralPlaceholder:
      "Zum Beispiel: Ich möchte Ihnen regelmäßig Kunden empfehlen – ich bin Hausverwalter in Düsseldorf. Oder: Mein Nachbar plant einen Umzug im Mai …",
    messagePlaceholder: "Zum Beispiel: 3-Zimmer-Wohnung, 2. OG ohne Aufzug, ca. 25 Kartons, Küche muss abgebaut werden …",
    callback: "Bitte rufen Sie mich für eine kostenlose Beratung zurück.",
    privacyBefore: "Ich habe die",
    privacyLink: "Datenschutzerklärung",
    privacyAfter: "gelesen und bin mit der Verarbeitung meiner Angaben zur Bearbeitung der Anfrage einverstanden.",
    required: "Pflichtfelder · Antwort innerhalb von 24 Stunden",
    submit: "Anfrage senden",
  },
  en: {
    sentTitle: "Enquiry sent",
    sentFallback: "Thank you! We will be in touch shortly.",
    another: "Send another enquiry",
    topic: "What is it about?",
    name: "First and last name",
    company: "Company",
    email: "Email",
    phone: "Phone",
    phoneHint: "For questions – quicker than email.",
    from: "From (postcode / town)",
    object: "Property address (postcode / town)",
    fromPlaceholder: "e.g. 40210 Düsseldorf",
    to: "To (postcode / town)",
    toPlaceholder: "e.g. 80331 Munich",
    date: "Preferred date",
    message: "Your message",
    referralPlaceholder:
      "For example: I would like to recommend customers to you regularly – I'm a property manager in Düsseldorf. Or: my neighbour is planning a move in May …",
    messagePlaceholder: "For example: 3-room flat, 2nd floor without lift, about 25 boxes, kitchen needs dismantling …",
    callback: "Please call me back for a free consultation.",
    privacyBefore: "I have read the",
    privacyLink: "privacy policy",
    privacyAfter: "and agree to my details being processed to handle the enquiry.",
    required: "Required fields · reply within 24 hours",
    submit: "Send enquiry",
  },
});

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
  const locale = useLocale();
  const t = useMessages(messages);
  const [state, formAction, pending] = useActionState(submitContact, initialFormState);
  const formRef = useRef<HTMLFormElement>(null);
  const onSubmit = useSubmitWithoutReset(formAction);
  useFocusFirstError(formRef, state.status === "error" ? state : null);

  const urlTopic = useSyncExternalStore(noopSubscribe, readTopicFromUrl, () => null);
  const [chosenTopic, setChosenTopic] = useState<string>();
  const submittedTopic = typeof state.values?.topic === "string" ? state.values.topic : undefined;
  const topic = chosenTopic ?? submittedTopic ?? (topics.some((entry) => entry.value === urlTopic) ? urlTopic! : "");
  const needsDestination = destinationTopics.includes(topic);
  // Empfehlungsprogramm: keine Objektadresse/kein Termin – stattdessen Angaben zur Empfehlung.
  const isReferral = topic === "empfehlung";

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

  return (
    <form ref={formRef} action={formAction} onSubmit={onSubmit} noValidate className="relative space-y-8">
      <SpamGuardFields />
      <input type="hidden" name="locale" value={locale} />

      <ChoiceCards name="topic" legend={t.topic} options={topics} value={topic} onChange={setChosenTopic} error={errors.topic} />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <TextField name="name" label={t.name} required autoComplete="name" defaultValue={value("name")} error={errors.name} />
        <TextField name="company" label={t.company} autoComplete="organization" defaultValue={value("company")} error={errors.company} />
        <TextField name="email" type="email" label={t.email} required autoComplete="email" inputMode="email" defaultValue={value("email")} error={errors.email} />
        <TextField
          name="phone"
          type="tel"
          label={t.phone}
          autoComplete="tel"
          inputMode="tel"
          hint={t.phoneHint}
          defaultValue={value("phone")}
          error={errors.phone}
        />
      </div>

      {!isReferral && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <TextField
            name="from"
            label={needsDestination ? t.from : t.object}
            autoComplete="postal-code"
            placeholder={t.fromPlaceholder}
            defaultValue={value("from")}
            error={errors.from}
          />
          {needsDestination && <TextField name="to" label={t.to} placeholder={t.toPlaceholder} defaultValue={value("to")} error={errors.to} />}
          <TextField name="date" type="date" label={t.date} defaultValue={value("date")} error={errors.date} />
        </div>
      )}

      <TextAreaField
        name="message"
        label={t.message}
        required
        rows={5}
        maxLength={4000}
        placeholder={isReferral ? t.referralPlaceholder : t.messagePlaceholder}
        defaultValue={value("message")}
        error={errors.message}
      />

      <div className="space-y-4 rounded-xl bg-surface p-5">
        <CheckboxField name="callback" defaultChecked={value("callback") === "on"}>
          {t.callback}
        </CheckboxField>
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
