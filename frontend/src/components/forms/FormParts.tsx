"use client";

import { CircleAlert, CircleCheck, LoaderCircle, Send } from "lucide-react";
import { startTransition, useEffect, useRef, type FormEvent, type ReactNode, type RefObject } from "react";
import { useFormStatus } from "react-dom";
import { useLocale } from "@/i18n/client";
import { cn } from "@/lib/cn";
import { buttonClasses } from "@/components/ui/button-styles";

/**
 * Sendet ein Formular per Server Action, ohne dass React es danach zurücksetzt
 * (React 19 ruft sonst form.reset() auf – kontrollierte Radios und gewählte
 * Dateien gingen bei Validierungsfehlern verloren). Ohne JavaScript greift
 * weiterhin das native `action`-Attribut (Progressive Enhancement).
 */
export function useSubmitWithoutReset(formAction: (formData: FormData) => void) {
  return (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget, (event.nativeEvent as SubmitEvent).submitter);
    startTransition(() => formAction(formData));
  };
}

/** Absende-Button mit Ladezustand – `pending` explizit oder aus dem umgebenden <form>. */
export function SubmitButton({ children, className, pending: pendingProp }: { children: ReactNode; className?: string; pending?: boolean }) {
  const status = useFormStatus();
  const en = useLocale() === "en";
  const pending = pendingProp ?? status.pending;
  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className={buttonClasses({ size: "lg", className: cn("w-full sm:w-auto disabled:cursor-wait disabled:opacity-80", className) })}
    >
      {pending ? (
        <LoaderCircle aria-hidden="true" className="size-5 animate-spin" />
      ) : (
        <Send aria-hidden="true" className="size-5" />
      )}
      <span>{pending ? (en ? "Sending …" : "Wird gesendet …") : children}</span>
    </button>
  );
}

/** Fehlermeldung für das gesamte Formular (role="alert" → sofort vorgelesen). */
export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div role="alert" className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
      <CircleAlert aria-hidden="true" className="size-5 shrink-0" />
      <p>{message}</p>
    </div>
  );
}

/** Erfolgsansicht, die das Formular ersetzt; übernimmt den Fokus. */
export function FormSuccess({ title, message, children }: { title: string; message?: string; children?: ReactNode }) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => headingRef.current?.focus(), []);

  return (
    <div className="flex flex-col items-center py-10 text-center" role="status">
      <span className="flex size-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/60">
        <CircleCheck aria-hidden="true" className="size-8" />
      </span>
      <h3 ref={headingRef} tabIndex={-1} className="mt-6 text-2xl font-bold text-primary outline-none">
        {title}
      </h3>
      {message && <p className="mt-3 max-w-md leading-relaxed text-slate-600">{message}</p>}
      {children && <div className="mt-8">{children}</div>}
    </div>
  );
}

/**
 * Unsichtbare Schutzfelder: Honeypot (für Bots verlockend, für Menschen
 * unsichtbar) und Startzeitpunkt (per Ref gesetzt – kein Hydration-Konflikt).
 */
export function SpamGuardFields() {
  const startedAtRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (startedAtRef.current) startedAtRef.current.value = String(Date.now());
  }, []);

  return (
    <>
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website (bitte leer lassen)
          <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>
      {/* Bewusst ohne value/defaultValue: React würde den per Ref gesetzten Wert bei jedem Re-Render überschreiben */}
      <input ref={startedAtRef} type="hidden" name="startedAt" />
    </>
  );
}

/** Fokussiert nach einem fehlgeschlagenen Absenden das erste ungültige Feld. */
export function useFocusFirstError(formRef: RefObject<HTMLFormElement | null>, trigger: unknown) {
  useEffect(() => {
    if (!trigger) return;
    formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"], fieldset[aria-describedby] input')?.focus();
  }, [formRef, trigger]);
}
