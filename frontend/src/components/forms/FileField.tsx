"use client";

import { FileText, Upload, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useLocale } from "@/i18n/client";
import { cn } from "@/lib/cn";

interface FileFieldProps {
  name: string;
  label: string;
  accept: string;
  maxSizeMb: number;
  hint: string;
  error?: string;
}

/**
 * Datei-Upload als Dropzone. Basis ist ein echtes <input type="file">
 * (per Label über die ganze Fläche klickbar, Drag & Drop nativ).
 * Größenprüfung erfolgt sofort im Browser und erneut auf dem Server.
 */
export function FileField({ name, label, accept, maxSizeMb, hint, error }: FileFieldProps) {
  const id = useId();
  const en = useLocale() === "en";
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [localError, setLocalError] = useState<string>();
  // Server-Fehler ausblenden, sobald der Nutzer eine andere Datei wählt.
  const [dismissedError, setDismissedError] = useState<string>();
  const shownError = localError ?? (error !== dismissedError ? error : undefined);

  const onChange = () => {
    setDismissedError(error);
    const selected = inputRef.current?.files?.[0] ?? null;
    if (selected && selected.size > maxSizeMb * 1024 * 1024) {
      setLocalError(en ? `The file is larger than ${maxSizeMb} MB.` : `Die Datei ist größer als ${maxSizeMb} MB.`);
      if (inputRef.current) inputRef.current.value = "";
      setFile(null);
      return;
    }
    setLocalError(undefined);
    setFile(selected);
  };

  const clear = () => {
    if (inputRef.current) inputRef.current.value = "";
    setFile(null);
    setLocalError(undefined);
  };

  // Anzeige synchron halten, falls das Formular zurückgesetzt wird (z. B. Absenden ohne JavaScript).
  useEffect(() => {
    const form = inputRef.current?.form;
    if (!form) return;
    const onReset = () => {
      setFile(null);
      setLocalError(undefined);
    };
    form.addEventListener("reset", onReset);
    return () => form.removeEventListener("reset", onReset);
  }, []);

  return (
    <div>
      <p id={`${id}-label`} className="mb-2 block text-sm font-semibold text-primary">
        {label} <span className="font-normal text-slate-500">(optional)</span>
      </p>
      <div
        className={cn(
          "relative rounded-xl border-2 border-dashed bg-white transition-colors",
          "has-[:focus-visible]:border-accent-ink has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-accent/20",
          shownError ? "border-red-400" : file ? "border-accent-ink/60" : "border-slate-300 hover:border-slate-400",
        )}
      >
        <input
          ref={inputRef}
          id={id}
          type="file"
          name={name}
          accept={accept}
          onChange={onChange}
          aria-labelledby={`${id}-label`}
          aria-describedby={shownError ? `${id}-error` : `${id}-hint`}
          aria-invalid={shownError ? true : undefined}
          className="absolute inset-0 z-10 cursor-pointer opacity-0"
        />
        {file ? (
          <div className="flex items-center gap-4 p-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-accent-ink">
              <FileText aria-hidden="true" className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-primary">{file.name}</span>
              <span className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
            </span>
            <button
              type="button"
              onClick={clear}
              className="relative z-20 flex size-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-primary"
            >
              <X aria-hidden="true" className="size-4" />
              <span className="sr-only">{en ? "Remove file" : "Datei entfernen"}</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center px-6 py-8 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-surface text-accent-ink ring-1 ring-slate-200">
              <Upload aria-hidden="true" className="size-5" />
            </span>
            <p className="mt-3 text-sm font-semibold text-primary">
              {en ? "Drag the file here or " : "Datei hierher ziehen oder "}
              <span className="text-accent-ink underline underline-offset-4">{en ? "browse" : "auswählen"}</span>
            </p>
            <p id={`${id}-hint`} className="mt-1 text-xs text-slate-500">
              {hint}
            </p>
          </div>
        )}
      </div>
      {shownError && (
        <p id={`${id}-error`} className="mt-1.5 text-sm font-medium text-red-600">
          {shownError}
        </p>
      )}
    </div>
  );
}
