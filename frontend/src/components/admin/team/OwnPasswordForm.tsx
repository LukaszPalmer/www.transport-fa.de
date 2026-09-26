"use client";

import { PASSWORD_MIN_LENGTH } from "@fa/shared";
import { useState, type FormEvent } from "react";
import { apiRequest } from "@/lib/api/client";
import { ApiError, errorMessage } from "@/lib/api/errors";
import { AuthAlert, PasswordField } from "@/components/portal/auth-fields";
import { SaveButton } from "@/components/portal/settings/form-parts";

/** Eigenes Passwort ändern (alle Mitarbeiter) – andere Sitzungen enden, diese bleibt. */
export function OwnPasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const errors: Record<string, string> = {};
    if (next.length < PASSWORD_MIN_LENGTH) errors.newPassword = `Mindestens ${PASSWORD_MIN_LENGTH} Zeichen.`;
    if (next !== confirm) errors.confirmPassword = "Die Passwörter stimmen nicht überein.";
    setFieldErrors(errors);
    setError(undefined);
    setDone(false);
    if (Object.keys(errors).length) return;
    setPending(true);
    try {
      await apiRequest("/admin/me/password", { body: { currentPassword: current, newPassword: next, confirmPassword: confirm } });
      setDone(true);
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (changeError) {
      if (changeError instanceof ApiError && changeError.fields) setFieldErrors(changeError.fields);
      else setError(errorMessage(changeError));
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && <AuthAlert tone="error">{error}</AuthAlert>}
      {done && <AuthAlert tone="success">Passwort geändert – gilt ab sofort. Andere Sitzungen wurden beendet.</AuthAlert>}
      <PasswordField name="currentPassword" label="Aktuelles Passwort" autoComplete="current-password" value={current} onValueChange={setCurrent} error={fieldErrors.currentPassword} />
      <PasswordField name="newPassword" label="Neues Passwort" autoComplete="new-password" showStrength value={next} onValueChange={setNext} error={fieldErrors.newPassword} />
      <PasswordField name="confirmPassword" label="Neues Passwort wiederholen" autoComplete="new-password" value={confirm} onValueChange={setConfirm} error={fieldErrors.confirmPassword} />
      <SaveButton pending={pending}>Passwort ändern</SaveButton>
    </form>
  );
}
