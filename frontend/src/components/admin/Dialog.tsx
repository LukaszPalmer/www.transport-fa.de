"use client";

import { CheckCircle2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Nach erfolgreichem Absenden: Bestätigung zeigen und den Dialog kurz danach selbst schließen.
 * `close` setzt die Meldung zurück – wichtig für Dialoge, die geschlossen gemountet bleiben.
 */
export function useCloseAfterSuccess(onClose: () => void, delayMs = 1800) {
  const [message, setMessage] = useState<string>();
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);
  const close = useCallback(() => {
    setMessage(undefined);
    onCloseRef.current();
  }, []);
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(close, delayMs);
    return () => clearTimeout(timer);
  }, [message, delayMs, close]);
  return [message, setMessage, close] as const;
}

/** Erfolgsmeldung im Dialog – ersetzt das Formular, bis sich der Dialog schließt. */
export function DialogSuccess({ message, detail, onClose }: { message: string; detail?: string; onClose: () => void }) {
  return (
    <div role="status" className="flex flex-col items-center gap-3 py-6 text-center">
      <span className="grid size-14 place-items-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200">
        <CheckCircle2 aria-hidden="true" className="size-7" />
      </span>
      <p className="font-display text-lg font-bold text-primary">{message}</p>
      {detail && <p className="max-w-sm text-sm leading-relaxed text-slate-600">{detail}</p>}
      <button type="button" onClick={onClose} className="mt-1 text-sm font-semibold text-accent-ink hover:underline">
        Schließen
      </button>
    </div>
  );
}

/**
 * Modaler Dialog auf Basis von <dialog>: Fokus bleibt im Dialog, Escape schließt,
 * Hintergrund ist gesperrt – ohne eigene Fokus-Logik.
 */
export function Dialog({ open, onClose, title, description, children }: { open: boolean; onClose: () => void; title: string; description?: string; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(event) => event.target === ref.current && onClose()}
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-3xl bg-white p-0 shadow-2xl backdrop:bg-primary/60 backdrop:backdrop-blur-sm"
    >
      {open && (
        <div className="max-h-[85dvh] overflow-y-auto p-6 sm:p-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-lg font-bold text-primary">{title}</h2>
              {description && <p className="mt-1 text-sm leading-relaxed text-slate-600">{description}</p>}
            </div>
            <button type="button" onClick={onClose} className="-mt-1 -mr-2 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-primary">
              <X aria-hidden="true" className="size-5" />
              <span className="sr-only">Schließen</span>
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}
