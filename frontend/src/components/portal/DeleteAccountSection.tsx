"use client";

import { ACCOUNT_DELETE_CONFIRMATION, ACCOUNT_DELETE_CONFIRMATION_EN, isDeleteConfirmation, type InvoiceItem } from "@fa/shared";
import { AlertTriangle, Download, FileArchive, LoaderCircle, ReceiptText, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { routes } from "@/content/navigation";
import { useLocale } from "@/i18n/client";
import { defineMessages } from "@/i18n/config";
import { API_URL, apiRequest, googleSignInUrl, invoiceUrl } from "@/lib/api/client";
import { formatDate, formatEuro, portalLabels } from "@/lib/portal-format";
import { ApiError, errorMessage } from "@/lib/api/errors";
import { AuthAlert, PasswordField } from "./auth-fields";

const messages = defineMessages({
  de: {
    deletedData: [
      "Ihre Anmeldung (E-Mail/Passwort bzw. Google-Verknüpfung) und alle Sitzungen",
      "Ihr Kundenprofil, alle Aufträge, Nachrichten und E-Mail-Verläufe im Portal",
      "Alle hochgeladenen und bereitgestellten Dokumente – auch aus unserem Dateispeicher",
      "Ihr Zugriff auf Rechnungen und Angebote im Portal",
    ],
    title: "Konto löschen",
    intro: "Sie können Ihr Kundenkonto jederzeit endgültig löschen. Laden Sie vorher Ihre Rechnungen herunter – danach sind sie im Portal nicht mehr abrufbar.",
    open: "Konto löschen …",
    deleted: "Endgültig gelöscht werden:",
    irreversible:
      "Das lässt sich nicht rückgängig machen. Sie erhalten eine Bestätigung per E-Mail – Ihre Rechnungen hängen wir als PDF an. Rechnungen und Angebote müssen wir gesetzlich aufbewahren (bis zu 8 Jahre); sie sind danach nur noch in unserer Buchhaltung und werden nach Ablauf der Frist automatisch gelöscht.",
    downloadNow: "Bitte laden Sie Ihre Rechnungen jetzt herunter",
    afterDeletion: (count: number) =>
      `Nach der Löschung können Sie Ihre ${count === 1 ? "Rechnung" : `${count} Belege`} nicht mehr im Portal abrufen. Speichern Sie sie für Ihre Unterlagen, z. B. für die Steuererklärung.`,
    zip: "Alle Belege als ZIP herunterladen",
    moreInZip: (count: number) => `… und ${count} weitere im ZIP.`,
    savedCheckbox: "Ich habe meine Rechnungen gespeichert und weiß, dass ich sie nach der Löschung nicht mehr im Portal abrufen kann.",
    password: "Ihr Passwort zur Bestätigung",
    reauth:
      "Aus Sicherheitsgründen bestätigen Sie die Löschung bitte mit einer erneuten Google-Anmeldung. Danach kommen Sie automatisch hierher zurück.",
    confirmGoogle: "Mit Google bestätigen",
    googleLinked: "Ihr Konto ist mit Google verknüpft – die Bestätigung erfolgt über Ihre aktuelle Anmeldung.",
    typeBefore: "Geben Sie zur Bestätigung ",
    typeAfter: " ein",
    word: ACCOUNT_DELETE_CONFIRMATION,
    deleting: "Wird gelöscht …",
    submit: "Konto endgültig löschen",
    cancel: "Abbrechen",
  },
  en: {
    deletedData: [
      "Your sign-in (email/password or Google link) and all sessions",
      "Your customer profile, all jobs, messages and email history in the portal",
      "All uploaded and provided documents – including from our file storage",
      "Your access to invoices and quotes in the portal",
    ],
    title: "Delete account",
    intro: "You can permanently delete your customer account at any time. Download your invoices first – afterwards they are no longer available in the portal.",
    open: "Delete account …",
    deleted: "The following will be permanently deleted:",
    irreversible:
      "This cannot be undone. You will receive a confirmation by email with your invoices attached as PDF. We are legally required to keep invoices and quotes (up to 8 years); after deletion they are only held in our accounting and are deleted automatically when the period ends.",
    downloadNow: "Please download your invoices now",
    afterDeletion: (count: number) =>
      `After deletion you can no longer access your ${count === 1 ? "invoice" : `${count} documents`} in the portal. Keep them for your records, e.g. for your tax return.`,
    zip: "Download all documents as ZIP",
    moreInZip: (count: number) => `… and ${count} more in the ZIP.`,
    savedCheckbox: "I have saved my invoices and understand that I can no longer access them in the portal after deletion.",
    password: "Your password to confirm",
    reauth: "For security reasons, please confirm the deletion by signing in with Google again. You'll then return here automatically.",
    confirmGoogle: "Confirm with Google",
    googleLinked: "Your account is linked to Google – confirmation is via your current sign-in.",
    typeBefore: "Type ",
    typeAfter: " to confirm",
    word: ACCOUNT_DELETE_CONFIRMATION_EN,
    deleting: "Deleting …",
    submit: "Delete account permanently",
    cancel: "Cancel",
  },
});

const INVOICE_PREVIEW = 8;

const ANCHOR = "konto-loeschen";

/**
 * Konto endgültig löschen (DSGVO). Bestätigung per Passwort bzw. frischer
 * Google-Anmeldung plus Eingabe „LÖSCHEN" – ein versehentlicher Klick reicht nie.
 */
export function DeleteAccountSection({ hasPassword, initiallyOpen, invoices }: { hasPassword: boolean; initiallyOpen: boolean; invoices: InvoiceItem[] }) {
  const router = useRouter();
  const locale = useLocale();
  const t = messages[locale];
  const [open, setOpen] = useState(initiallyOpen);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [needsReauth, setNeedsReauth] = useState(false);
  const [invoicesSaved, setInvoicesSaved] = useState(false);

  const hasInvoices = invoices.length > 0;
  const confirmed = isDeleteConfirmation(confirmation) && (!hasInvoices || invoicesSaved);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!confirmed) return;
    setPending(true);
    setError(undefined);
    setFieldErrors({});
    try {
      await apiRequest("/account/delete", { body: { password: hasPassword ? password : undefined, confirmation } });
      router.replace(`${routes.portalLogin}?geloescht=1`);
      router.refresh();
    } catch (deleteError) {
      if (deleteError instanceof ApiError && deleteError.code === "REAUTH_REQUIRED") setNeedsReauth(true);
      else if (deleteError instanceof ApiError && deleteError.fields) setFieldErrors(deleteError.fields);
      else setError(errorMessage(deleteError));
      setPending(false);
    }
  };

  return (
    <section id={ANCHOR} aria-labelledby="delete-title" className="scroll-mt-24 rounded-3xl bg-white p-6 shadow-card ring-1 ring-red-200 sm:p-8">
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
          <Trash2 aria-hidden="true" className="size-5" />
        </span>
        <h2 id="delete-title" className="font-display text-lg font-bold text-primary">
          {t.title}
        </h2>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-slate-600">
        {t.intro}
      </p>

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-6 inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50"
        >
          {t.open}
        </button>
      ) : (
        <form onSubmit={onSubmit} className="mt-6 space-y-5">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-900">
            <p className="flex items-center gap-2 font-semibold">
              <AlertTriangle aria-hidden="true" className="size-4" />
              {t.deleted}
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              {t.deletedData.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="mt-3">{t.irreversible}</p>
          </div>

          {hasInvoices && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950">
              <p className="flex items-center gap-2 font-semibold">
                <ReceiptText aria-hidden="true" className="size-4" />
                {t.downloadNow}
              </p>
              <p className="mt-2">{t.afterDeletion(invoices.length)}</p>
              <a
                href={`${API_URL}/api/v1/portal/invoices/archive.zip`}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-secondary"
              >
                <FileArchive aria-hidden="true" className="size-4" /> {t.zip}
              </a>
              <ul className="mt-4 divide-y divide-amber-200/70">
                {invoices.slice(0, INVOICE_PREVIEW).map((invoice) => (
                  <li key={invoice.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                    <span>
                      <strong>
                        {portalLabels(locale).invoiceTypeLabel[invoice.type]} {invoice.number}
                      </strong>
                      <span className="text-amber-900/80">
                        {" "}
                        · {formatDate(invoice.issueDate, locale)} · {formatEuro(invoice.grossCents, locale)}
                      </span>
                    </span>
                    <a href={invoiceUrl(invoice.id, "download")} className="inline-flex items-center gap-1 font-semibold underline-offset-4 hover:underline">
                      <Download aria-hidden="true" className="size-4" /> PDF
                    </a>
                  </li>
                ))}
              </ul>
              {invoices.length > INVOICE_PREVIEW && <p className="mt-1 text-amber-900/80">{t.moreInZip(invoices.length - INVOICE_PREVIEW)}</p>}
              <label className="mt-4 flex items-start gap-3 font-medium">
                <input type="checkbox" checked={invoicesSaved} onChange={(event) => setInvoicesSaved(event.target.checked)} className="mt-0.5 size-4 accent-[#b45309]" />
                {t.savedCheckbox}
              </label>
            </div>
          )}

          {error && <AuthAlert tone="error">{error}</AuthAlert>}

          {hasPassword ? (
            <PasswordField
              name="password"
              label={t.password}
              autoComplete="current-password"
              value={password}
              onValueChange={setPassword}
              error={fieldErrors.password}
            />
          ) : needsReauth ? (
            <AuthAlert tone="info">
              {t.reauth}{" "}
              <a href={googleSignInUrl(`${routes.portalSettings}?loeschen=1#${ANCHOR}`)} className="font-semibold underline underline-offset-4">
                {t.confirmGoogle}
              </a>
            </AuthAlert>
          ) : (
            <p className="text-sm text-slate-600">{t.googleLinked}</p>
          )}

          <div>
            <label htmlFor="delete-confirmation" className="block text-sm font-semibold text-primary">
              {t.typeBefore}
              <strong className="text-red-700">{t.word}</strong>
              {t.typeAfter}
            </label>
            <input
              id="delete-confirmation"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              autoComplete="off"
              spellCheck={false}
              className="mt-2 h-12 w-full rounded-xl border border-slate-300 px-4 text-primary outline-none focus:border-red-400 focus:ring-4 focus:ring-red-100"
              aria-invalid={Boolean(fieldErrors.confirmation) || undefined}
            />
            {fieldErrors.confirmation && <p className="mt-1.5 text-sm font-medium text-red-600">{fieldErrors.confirmation}</p>}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={!confirmed || pending || (hasPassword && password.length === 0)}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pending ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : <Trash2 aria-hidden="true" className="size-4" />}
              {pending ? t.deleting : t.submit}
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setPassword("");
                setConfirmation("");
                setInvoicesSaved(false);
                setError(undefined);
                setFieldErrors({});
              }}
              disabled={pending}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-primary hover:bg-slate-50"
            >
              {t.cancel}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
