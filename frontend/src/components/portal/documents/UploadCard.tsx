"use client";

import {
  CUSTOMER_UPLOAD_CATEGORIES,
  MAX_UPLOAD_BYTES,
  UPLOAD_ACCEPT,
  UPLOAD_FILE_TYPES,
  type ApiErrorBody,
  type DocumentListResponse,
} from "@fa/shared";
import { CloudUpload, FileCheck2, LoaderCircle, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useRef, useState, type DragEvent, type FormEvent } from "react";
import { API_URL } from "@/lib/api/client";
import { NETWORK_ERROR } from "@/lib/api/errors";
import { cn } from "@/lib/cn";
import { documentCategoryLabel, formatFileSize } from "@/lib/portal-format";
import { CheckboxField, FieldShell, inputClasses, selectClasses } from "@/components/forms/fields";
import { AuthAlert } from "@/components/portal/auth-fields";
import { buttonClasses } from "@/components/ui/button-styles";

const ALLOWED_EXTENSIONS = /\.(pdf|jpe?g|png|webp|heic)$/i;
const MAX_MB = MAX_UPLOAD_BYTES / 1024 / 1024;

type Shipments = DocumentListResponse["shipments"];

/** Dokument hochladen – per Drag & Drop oder Dateiauswahl (am Handy auch direkt per Kamera). */
export function UploadCard({ shipments }: { shipments: Shipments }) {
  const router = useRouter();
  const inputId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [file, setFile] = useState<File>();
  const [title, setTitle] = useState("");
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<number>();
  const [error, setError] = useState<string>();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<string>();

  const chooseFile = (candidate: File | undefined) => {
    setError(undefined);
    setSuccess(undefined);
    setFieldErrors({});
    if (!candidate) return;
    const typeOk = candidate.type in UPLOAD_FILE_TYPES || ALLOWED_EXTENSIONS.test(candidate.name);
    if (!typeOk) return setFieldErrors({ file: "Bitte wählen Sie eine PDF- oder Bilddatei (JPG, PNG, WEBP, HEIC)." });
    if (candidate.size > MAX_UPLOAD_BYTES) return setFieldErrors({ file: `Die Datei ist größer als ${MAX_MB} MB.` });
    setFile(candidate);
    if (!title) setTitle(candidate.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim());
  };

  const onDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragging(false);
    chooseFile(event.dataTransfer.files[0]);
  };

  const reset = () => {
    formRef.current?.reset();
    setFile(undefined);
    setTitle("");
    setProgress(undefined);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) return setFieldErrors({ file: "Bitte wählen Sie eine Datei aus." });
    const data = new FormData(event.currentTarget);
    const body = new FormData();
    // Felder vor der Datei – die API prüft sie, bevor sie die Datei annimmt.
    body.append("title", title);
    body.append("category", String(data.get("category") ?? ""));
    body.append("shipmentId", String(data.get("shipmentId") ?? ""));
    body.append("handToDriver", data.get("handToDriver") === "on" ? "true" : "false");
    body.append("file", file, file.name);

    setError(undefined);
    setFieldErrors({});
    setSuccess(undefined);
    setProgress(0);

    const request = new XMLHttpRequest();
    request.open("POST", `${API_URL}/api/v1/portal/documents`);
    request.withCredentials = true;
    request.upload.onprogress = (progressEvent) => {
      if (progressEvent.lengthComputable) setProgress(Math.round((progressEvent.loaded / progressEvent.total) * 100));
    };
    request.onerror = () => {
      setProgress(undefined);
      setError(NETWORK_ERROR);
    };
    request.onload = () => {
      setProgress(undefined);
      if (request.status === 201) {
        setSuccess(`„${title}“ wurde hochgeladen.`);
        reset();
        router.refresh();
        return;
      }
      const response = (() => {
        try {
          return JSON.parse(request.responseText) as ApiErrorBody;
        } catch {
          return undefined;
        }
      })();
      if (response?.error.fields) setFieldErrors(response.error.fields);
      else setError(response?.error.message ?? "Das Hochladen hat leider nicht geklappt. Bitte versuchen Sie es erneut.");
    };
    request.send(body);
  };

  const uploading = progress !== undefined;

  return (
    <section aria-labelledby="upload-title" className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-primary/5 sm:p-8">
      <h2 id="upload-title" className="font-display text-lg font-bold text-primary">
        Dokument hochladen
      </h2>
      <p className="mt-1 text-sm text-slate-600">Zoll- und Frachtpapiere, Lieferscheine oder Fotos – als PDF oder Bild, bis {MAX_MB} MB.</p>

      <form ref={formRef} onSubmit={onSubmit} className="mt-6 space-y-5">
        {error && <AuthAlert tone="error">{error}</AuthAlert>}
        {success && <AuthAlert tone="success">{success}</AuthAlert>}

        <div>
          <label
            htmlFor={inputId}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-6 text-center transition-colors",
              dragging ? "border-accent bg-accent/5" : "border-slate-300 bg-surface hover:border-accent/60",
              fieldErrors.file && "border-red-300",
            )}
          >
            {file ? (
              <>
                <FileCheck2 aria-hidden="true" className="size-8 text-emerald-600" />
                <span className="max-w-full truncate font-semibold text-primary">{file.name}</span>
                <span className="text-xs text-slate-500">{formatFileSize(file.size)} · zum Ändern klicken</span>
              </>
            ) : (
              <>
                <CloudUpload aria-hidden="true" className="size-8 text-accent-ink" />
                <span className="font-semibold text-primary">Datei hierher ziehen oder auswählen</span>
                <span className="text-xs text-slate-500">PDF, JPG, PNG, WEBP, HEIC · max. {MAX_MB} MB</span>
              </>
            )}
          </label>
          <input
            id={inputId}
            type="file"
            accept={UPLOAD_ACCEPT}
            className="sr-only"
            onChange={(event) => chooseFile(event.target.files?.[0])}
            aria-describedby={fieldErrors.file ? `${inputId}-error` : undefined}
          />
          {fieldErrors.file && (
            <p id={`${inputId}-error`} className="mt-1.5 text-sm font-medium text-red-600">
              {fieldErrors.file}
            </p>
          )}
        </div>

        <FieldShell id={`${inputId}-title`} label="Bezeichnung" required error={fieldErrors.title}>
          <input
            id={`${inputId}-title`}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            maxLength={200}
            placeholder="z. B. Ausfuhrbegleitdokument"
            className={cn(inputClasses, "h-12")}
          />
        </FieldShell>

        <FieldShell id={`${inputId}-category`} label="Kategorie" required error={fieldErrors.category}>
          <select id={`${inputId}-category`} name="category" defaultValue="CUSTOMS" className={selectClasses}>
            {CUSTOMER_UPLOAD_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {documentCategoryLabel[category]}
              </option>
            ))}
          </select>
        </FieldShell>

        {shipments.length > 0 && (
          <FieldShell id={`${inputId}-shipment`} label="Zu welchem Auftrag?" hint="Optional – hilft uns, das Dokument dem richtigen LKW mitzugeben." error={fieldErrors.shipmentId}>
            <select id={`${inputId}-shipment`} name="shipmentId" defaultValue="" className={selectClasses}>
              <option value="">Kein bestimmter Auftrag</option>
              {shipments.map((shipment) => (
                <option key={shipment.id} value={shipment.id}>
                  {shipment.label}
                </option>
              ))}
            </select>
          </FieldShell>
        )}

        <CheckboxField name="handToDriver">
          <strong className="text-primary">Dem Fahrer mitgeben</strong> – wir drucken das Dokument aus und geben es dem Fahrer mit in den LKW.
        </CheckboxField>

        {uploading && (
          <div className="space-y-1.5" aria-live="polite">
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-accent transition-[width]" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-slate-500">Wird hochgeladen … {progress} %</p>
          </div>
        )}

        <div className="flex gap-3">
          <button type="submit" disabled={uploading} className={buttonClasses({ className: "flex-1 disabled:cursor-wait disabled:opacity-80" })}>
            {uploading ? <LoaderCircle aria-hidden="true" className="size-5 animate-spin" /> : <CloudUpload aria-hidden="true" className="size-5" />}
            {uploading ? "Wird hochgeladen …" : "Hochladen"}
          </button>
          {file && !uploading && (
            <button type="button" onClick={reset} className={buttonClasses({ variant: "outline" })} aria-label="Auswahl zurücksetzen">
              <X aria-hidden="true" className="size-5" />
            </button>
          )}
        </div>
      </form>
    </section>
  );
}

