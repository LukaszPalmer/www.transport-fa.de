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
import { useLocale } from "@/i18n/client";
import { defineMessages } from "@/i18n/config";
import { API_URL } from "@/lib/api/client";
import { ApiError, NETWORK_ERROR, localizeMessage } from "@/lib/api/errors";
import { cn } from "@/lib/cn";
import { formatFileSize, portalLabels } from "@/lib/portal-format";
import { CheckboxField, FieldShell, inputClasses, selectClasses } from "@/components/forms/fields";
import { AuthAlert } from "@/components/portal/auth-fields";
import { buttonClasses } from "@/components/ui/button-styles";

const ALLOWED_EXTENSIONS = /\.(pdf|jpe?g|png|webp|heic)$/i;
const MAX_MB = MAX_UPLOAD_BYTES / 1024 / 1024;

type Shipments = DocumentListResponse["shipments"];

const messages = defineMessages({
  de: {
    wrongType: "Bitte wählen Sie eine PDF- oder Bilddatei (JPG, PNG, WEBP, HEIC).",
    tooLarge: `Die Datei ist größer als ${MAX_MB} MB.`,
    noFile: "Bitte wählen Sie eine Datei aus.",
    uploaded: (title: string) => `„${title}“ wurde hochgeladen.`,
    title: "Dokument hochladen",
    intro: `Zoll- und Frachtpapiere, Lieferscheine oder Fotos – als PDF oder Bild, bis ${MAX_MB} MB.`,
    clickToChange: "zum Ändern klicken",
    dropHere: "Datei hierher ziehen oder auswählen",
    formats: `PDF, JPG, PNG, WEBP, HEIC · max. ${MAX_MB} MB`,
    name: "Bezeichnung",
    namePlaceholder: "z. B. Ausfuhrbegleitdokument",
    category: "Kategorie",
    shipment: "Zu welchem Auftrag?",
    shipmentHint: "Optional – hilft uns, das Dokument dem richtigen LKW mitzugeben.",
    noShipment: "Kein bestimmter Auftrag",
    handToDriver: "Dem Fahrer mitgeben",
    handToDriverText: " – wir drucken das Dokument aus und geben es dem Fahrer mit in den LKW.",
    uploading: "Wird hochgeladen …",
    upload: "Hochladen",
    resetLabel: "Auswahl zurücksetzen",
  },
  en: {
    wrongType: "Please choose a PDF or image file (JPG, PNG, WEBP, HEIC).",
    tooLarge: `The file is larger than ${MAX_MB} MB.`,
    noFile: "Please choose a file.",
    uploaded: (title: string) => `“${title}” has been uploaded.`,
    title: "Upload a document",
    intro: `Customs and freight papers, delivery notes or photos – as PDF or image, up to ${MAX_MB} MB.`,
    clickToChange: "click to change",
    dropHere: "Drag a file here or choose one",
    formats: `PDF, JPG, PNG, WEBP, HEIC · max. ${MAX_MB} MB`,
    name: "Title",
    namePlaceholder: "e.g. export accompanying document",
    category: "Category",
    shipment: "Which job is it for?",
    shipmentHint: "Optional – helps us give the document to the right truck.",
    noShipment: "No specific job",
    handToDriver: "Hand to the driver",
    handToDriverText: " – we print the document and give it to the driver in the truck.",
    uploading: "Uploading …",
    upload: "Upload",
    resetLabel: "Reset selection",
  },
});

/** Dokument hochladen – per Drag & Drop oder Dateiauswahl (am Handy auch direkt per Kamera). */
export function UploadCard({ shipments }: { shipments: Shipments }) {
  const router = useRouter();
  const locale = useLocale();
  const t = messages[locale];
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
    if (!typeOk) return setFieldErrors({ file: t.wrongType });
    if (candidate.size > MAX_UPLOAD_BYTES) return setFieldErrors({ file: t.tooLarge });
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
    if (!file) return setFieldErrors({ file: t.noFile });
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
      setError(localizeMessage(NETWORK_ERROR));
    };
    request.onload = () => {
      setProgress(undefined);
      if (request.status === 201) {
        setSuccess(t.uploaded(title));
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
      if (!response) return setError(localizeMessage("Das Hochladen hat leider nicht geklappt. Bitte versuchen Sie es erneut."));
      // ApiError übersetzt Meldung und Feldfehler in die Sprache der Seite
      const apiError = new ApiError(request.status, response.error.code, response.error.message, response.error.fields);
      if (apiError.fields) setFieldErrors(apiError.fields);
      else setError(apiError.message);
    };
    request.send(body);
  };

  const uploading = progress !== undefined;

  return (
    <section aria-labelledby="upload-title" className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-primary/5 sm:p-8">
      <h2 id="upload-title" className="font-display text-lg font-bold text-primary">
        {t.title}
      </h2>
      <p className="mt-1 text-sm text-slate-600">{t.intro}</p>

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
                <span className="text-xs text-slate-500">
                  {formatFileSize(file.size, locale)} · {t.clickToChange}
                </span>
              </>
            ) : (
              <>
                <CloudUpload aria-hidden="true" className="size-8 text-accent-ink" />
                <span className="font-semibold text-primary">{t.dropHere}</span>
                <span className="text-xs text-slate-500">{t.formats}</span>
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

        <FieldShell id={`${inputId}-title`} label={t.name} required error={fieldErrors.title}>
          <input
            id={`${inputId}-title`}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            maxLength={200}
            placeholder={t.namePlaceholder}
            className={cn(inputClasses, "h-12")}
          />
        </FieldShell>

        <FieldShell id={`${inputId}-category`} label={t.category} required error={fieldErrors.category}>
          <select id={`${inputId}-category`} name="category" defaultValue="CUSTOMS" className={selectClasses}>
            {CUSTOMER_UPLOAD_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {portalLabels(locale).documentCategoryLabel[category]}
              </option>
            ))}
          </select>
        </FieldShell>

        {shipments.length > 0 && (
          <FieldShell id={`${inputId}-shipment`} label={t.shipment} hint={t.shipmentHint} error={fieldErrors.shipmentId}>
            <select id={`${inputId}-shipment`} name="shipmentId" defaultValue="" className={selectClasses}>
              <option value="">{t.noShipment}</option>
              {shipments.map((shipment) => (
                <option key={shipment.id} value={shipment.id}>
                  {shipment.label}
                </option>
              ))}
            </select>
          </FieldShell>
        )}

        <CheckboxField name="handToDriver">
          <strong className="text-primary">{t.handToDriver}</strong>
          {t.handToDriverText}
        </CheckboxField>

        {uploading && (
          <div className="space-y-1.5" aria-live="polite">
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-accent transition-[width]" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-slate-500">
              {t.uploading} {progress} %
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <button type="submit" disabled={uploading} className={buttonClasses({ className: "flex-1 disabled:cursor-wait disabled:opacity-80" })}>
            {uploading ? <LoaderCircle aria-hidden="true" className="size-5 animate-spin" /> : <CloudUpload aria-hidden="true" className="size-5" />}
            {uploading ? t.uploading : t.upload}
          </button>
          {file && !uploading && (
            <button type="button" onClick={reset} className={buttonClasses({ variant: "outline" })} aria-label={t.resetLabel}>
              <X aria-hidden="true" className="size-5" />
            </button>
          )}
        </div>
      </form>
    </section>
  );
}

