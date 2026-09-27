"use client";

import type { AccountingExportRow } from "@fa/shared";
import { FileArchive, FileSpreadsheet, LoaderCircle, Send, Table2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { API_URL, apiRequest } from "@/lib/api/client";
import { ApiError, errorMessage, toApiError } from "@/lib/api/errors";
import { inputClasses } from "@/components/forms/fields";
import { AuthAlert } from "@/components/portal/auth-fields";
import { buttonClasses } from "@/components/ui/button-styles";
import { Dialog } from "../Dialog";

type Kind = "datev" | "journal.csv" | "package";

const DOWNLOADS: Array<{ kind: Kind; label: string; hint: string; icon: typeof FileArchive; fileName: (from: string, to: string) => string }> = [
  {
    kind: "package",
    label: "Belegpaket (ZIP)",
    hint: "DATEV-Stapel, alle PDFs, XRechnung-XML, Rechnungsausgangsbuch",
    icon: FileArchive,
    fileName: (from, to) => `Belegpaket_FA-Transport_${from}_${to}.zip`,
  },
  {
    kind: "datev",
    label: "DATEV-Buchungsstapel",
    hint: "EXTF 700 – Import in DATEV Rechnungswesen",
    icon: FileSpreadsheet,
    fileName: (from, to) => `EXTF_Buchungsstapel_${from}_${to}.csv`,
  },
  {
    kind: "journal.csv",
    label: "Rechnungsausgangsbuch (CSV)",
    hint: "Für Excel – je Beleg und Steuersatz eine Zeile",
    icon: Table2,
    fileName: (from, to) => `Rechnungsausgangsbuch_${from}_${to}.csv`,
  },
];

/**
 * Exporte für die Steuerberatung. Downloads laufen per fetch, damit Fehler (z. B. fehlende
 * DATEV-Nummern) als Meldung erscheinen statt als leere Seite.
 */
export function ExportActions({
  from,
  to,
  source,
  accountantEmail,
  hasEntries,
}: {
  from: string;
  to: string;
  source: string;
  accountantEmail?: string;
  hasEntries: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<Kind>();
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string }>();
  const [sending, setSending] = useState(false);
  const query = new URLSearchParams({ from, to, source }).toString();

  const download = async (entry: (typeof DOWNLOADS)[number]) => {
    setBusy(entry.kind);
    setMessage(undefined);
    try {
      const response = await fetch(`${API_URL}/api/v1/admin/accounting/${entry.kind}?${query}`, { credentials: "include" });
      if (!response.ok) throw await toApiError(response);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = entry.fileName(from, to);
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
      router.refresh(); // Übergabe-Historie aktualisieren
    } catch (error) {
      setMessage({ tone: "error", text: error instanceof ApiError ? error.message : errorMessage(error) });
    } finally {
      setBusy(undefined);
    }
  };

  return (
    <div className="space-y-4">
      {message && <AuthAlert tone={message.tone}>{message.text}</AuthAlert>}
      <ul className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {DOWNLOADS.map((entry) => (
          <li key={entry.kind}>
            <button
              type="button"
              onClick={() => void download(entry)}
              disabled={!hasEntries || busy !== undefined}
              className="flex h-full w-full items-start gap-3 rounded-2xl p-4 text-left ring-1 ring-slate-200 transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent-ink">
                {busy === entry.kind ? <LoaderCircle aria-hidden="true" className="size-5 animate-spin" /> : <entry.icon aria-hidden="true" className="size-5" />}
              </span>
              <span>
                <span className="block text-sm font-semibold text-primary">{entry.label}</span>
                <span className="mt-0.5 block text-xs text-slate-500">{entry.hint}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      <button type="button" disabled={!hasEntries} onClick={() => setSending(true)} className={buttonClasses({ variant: "dark", size: "sm" })}>
        <Send aria-hidden="true" className="size-4" /> Belegpaket an Steuerberater senden
      </button>
      {sending && (
        <SendDialog
          from={from}
          to={to}
          source={source}
          accountantEmail={accountantEmail}
          onClose={() => setSending(false)}
          onSent={(sentTo) => {
            setSending(false);
            setMessage({ tone: "success", text: `Belegpaket an ${sentTo} gesendet.` });
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

function SendDialog({
  from,
  to,
  source,
  accountantEmail,
  onClose,
  onSent,
}: {
  from: string;
  to: string;
  source: string;
  accountantEmail?: string;
  onClose: () => void;
  onSent: (sentTo: string) => void;
}) {
  const [email, setEmail] = useState(accountantEmail ?? "");
  const [text, setText] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setError(undefined);
    try {
      const result = await apiRequest<{ sentTo: string; exports: AccountingExportRow[] }>("/admin/accounting/send", {
        body: { from, to, source, email: email === accountantEmail ? undefined : email, message: text },
      });
      onSent(result.sentTo);
    } catch (sendError) {
      setError(sendError instanceof ApiError && sendError.fields ? Object.values(sendError.fields).join(" ") : errorMessage(sendError));
      setPending(false);
    }
  };

  return (
    <Dialog open onClose={onClose} title="Belegpaket senden" description="Die ZIP-Datei mit DATEV-Stapel, allen PDFs und XRechnung-XML geht als Anhang an die Steuerberatung.">
      <form onSubmit={onSubmit} className="space-y-4">
        {error && <AuthAlert tone="error">{error}</AuthAlert>}
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-primary">E-Mail der Steuerberatung</span>
          <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className={`${inputClasses} h-11`} />
          {!accountantEmail && <span className="mt-1 block text-xs text-slate-500">Tipp: In den Einstellungen unten hinterlegen, dann ist sie vorausgefüllt.</span>}
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-primary">
            Nachricht <span className="font-normal text-slate-500">(optional)</span>
          </span>
          <textarea value={text} onChange={(event) => setText(event.target.value)} rows={4} maxLength={2000} className={`${inputClasses} py-3`} />
        </label>
        <button type="submit" disabled={pending || !email} className={buttonClasses({ variant: "dark", size: "md" })}>
          {pending ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : <Send aria-hidden="true" className="size-4" />}
          Jetzt senden
        </button>
      </form>
    </Dialog>
  );
}
