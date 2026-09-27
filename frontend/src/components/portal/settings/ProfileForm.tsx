"use client";

import type { AccountSettings } from "@fa/shared";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useMessages } from "@/i18n/client";
import { defineMessages } from "@/i18n/config";
import { apiRequest } from "@/lib/api/client";
import { ApiError, errorMessage } from "@/lib/api/errors";
import { TextField } from "@/components/forms/fields";
import { AuthAlert } from "../auth-fields";
import { mapFieldErrors, SavedNote, SaveButton } from "./form-parts";

const messages = defineMessages({
  de: {
    firstName: "Vorname",
    lastName: "Nachname",
    company: "Firma",
    phone: "Telefon",
    phoneHint: "Mit internationaler Vorwahl – so erreicht Sie auch unser Fahrer.",
  },
  en: {
    firstName: "First name",
    lastName: "Last name",
    company: "Company",
    phone: "Phone",
    phoneHint: "With international code – so our driver can reach you too.",
  },
});

/** Stammdaten: Name, Firma, Telefon (international). */
export function ProfileForm({ profile }: { profile: AccountSettings["profile"] }) {
  const t = useMessages(messages);
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string>();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setPending(true);
    setSaved(false);
    setError(undefined);
    setFieldErrors({});
    try {
      await apiRequest<AccountSettings>("/account/profile", {
        method: "PATCH",
        body: {
          firstName: String(data.get("firstName") ?? ""),
          lastName: String(data.get("lastName") ?? ""),
          companyName: String(data.get("companyName") ?? ""),
          phone: String(data.get("phone") ?? ""),
        },
      });
      setSaved(true);
      router.refresh(); // Name in der Kopfzeile aktualisieren
    } catch (saveError) {
      if (saveError instanceof ApiError && saveError.fields) setFieldErrors(mapFieldErrors(saveError.fields));
      else setError(errorMessage(saveError));
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={onSubmit} onChange={() => setSaved(false)} className="space-y-5">
      {error && <AuthAlert tone="error">{error}</AuthAlert>}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <TextField name="firstName" label={t.firstName} required autoComplete="given-name" defaultValue={profile.firstName} error={fieldErrors.firstName} />
        <TextField name="lastName" label={t.lastName} required autoComplete="family-name" defaultValue={profile.lastName} error={fieldErrors.lastName} />
      </div>
      <TextField name="companyName" label={t.company} autoComplete="organization" defaultValue={profile.companyName} error={fieldErrors.companyName} />
      <TextField
        name="phone"
        type="tel"
        label={t.phone}
        autoComplete="tel"
        inputMode="tel"
        placeholder="+49 170 1234567"
        hint={t.phoneHint}
        defaultValue={profile.phone}
        error={fieldErrors.phone}
      />
      <div className="flex flex-wrap items-center gap-4">
        <SaveButton pending={pending} />
        {saved && <SavedNote />}
      </div>
    </form>
  );
}
