"use client";

import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { useId, useState, type ReactNode } from "react";
import { useMessages } from "@/i18n/client";
import { defineMessages } from "@/i18n/config";
import { cn } from "@/lib/cn";
import { buttonClasses } from "@/components/ui/button-styles";
import { describedBy, FieldShell, inputClasses } from "@/components/forms/fields";

interface PasswordFieldProps {
  name: string;
  label: string;
  autoComplete: "current-password" | "new-password";
  error?: string;
  hint?: string;
  /** Zeigt eine Stärke-Anzeige (Registrierung, neues Passwort). */
  showStrength?: boolean;
  value?: string;
  onValueChange?: (value: string) => void;
}

/** Bewertet ein Passwort grob (0–4) – Hilfe für Nutzer, keine Sicherheitsgarantie. */
function passwordScore(password: string): number {
  let score = 0;
  if (password.length >= 10) score++;
  if (password.length >= 14) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

const messages = defineMessages({
  de: {
    strength: ["Zu kurz", "Schwach", "Okay", "Gut", "Stark"],
    hide: "Passwort verbergen",
    show: "Passwort anzeigen",
    wait: "Bitte warten …",
  },
  en: {
    strength: ["Too short", "Weak", "Okay", "Good", "Strong"],
    hide: "Hide password",
    show: "Show password",
    wait: "Please wait …",
  },
});
const strengthColors = ["bg-red-500", "bg-orange-500", "bg-amber-400", "bg-emerald-500", "bg-emerald-600"];

/** Passwortfeld mit Sichtbarkeits-Umschalter und optionaler Stärke-Anzeige. */
export function PasswordField({
  name,
  label,
  autoComplete,
  error,
  hint,
  showStrength,
  value,
  onValueChange,
}: PasswordFieldProps) {
  const t = useMessages(messages);
  const id = useId();
  const [visible, setVisible] = useState(false);
  const [internalValue, setInternalValue] = useState("");
  const current = value ?? internalValue;
  const score = passwordScore(current);

  return (
    <FieldShell id={id} label={label} required hint={hint} error={error}>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          required
          value={current}
          onChange={(event) => (onValueChange ?? setInternalValue)(event.target.value)}
          className={cn(inputClasses, "h-12 pr-12")}
          {...describedBy(id, hint, error)}
        />
        <button
          type="button"
          onClick={() => setVisible((state) => !state)}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-slate-500 hover:text-primary"
        >
          {visible ? <EyeOff aria-hidden="true" className="size-5" /> : <Eye aria-hidden="true" className="size-5" />}
          <span className="sr-only">{visible ? t.hide : t.show}</span>
        </button>
      </div>
      {showStrength && current.length > 0 && (
        <div className="mt-2 flex items-center gap-3" aria-live="polite">
          <div className="flex flex-1 gap-1" aria-hidden="true">
            {[0, 1, 2, 3].map((index) => (
              <span
                key={index}
                className={cn("h-1.5 flex-1 rounded-full transition-colors", index < score ? strengthColors[score] : "bg-slate-200")}
              />
            ))}
          </div>
          <span className="text-xs font-medium text-slate-600">{t.strength[score]}</span>
        </div>
      )}
    </FieldShell>
  );
}

/** Absende-Button mit explizitem Ladezustand (Portal-Formulare arbeiten mit onSubmit). */
export function PendingButton({ pending, children }: { pending: boolean; children: ReactNode }) {
  const t = useMessages(messages);
  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className={buttonClasses({ size: "lg", className: "w-full disabled:cursor-wait disabled:opacity-80" })}
    >
      {pending && <LoaderCircle aria-hidden="true" className="size-5 animate-spin" />}
      <span>{pending ? t.wait : children}</span>
    </button>
  );
}

/** Einfaches Status-Banner für Portal-Formulare. */
export function AuthAlert({ tone, children }: { tone: "error" | "success" | "info"; children: ReactNode }) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-xl border p-4 text-sm leading-relaxed",
        tone === "error" && "border-red-200 bg-red-50 text-red-800",
        tone === "success" && "border-emerald-200 bg-emerald-50 text-emerald-800",
        tone === "info" && "border-sky-200 bg-sky-50 text-sky-900",
      )}
    >
      {children}
    </div>
  );
}
