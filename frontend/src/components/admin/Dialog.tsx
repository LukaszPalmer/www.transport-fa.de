"use client";

import { X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";

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
