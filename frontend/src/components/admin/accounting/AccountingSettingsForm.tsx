"use client";

import { DEFAULT_ACCOUNTS, TAX_CASE_INFO, TAX_CASES, type AccountingSettings, type ChartOfAccounts } from "@fa/shared";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { apiRequest } from "@/lib/api/client";
import { ApiError, errorMessage } from "@/lib/api/errors";
import { inputClasses, selectClasses } from "@/components/forms/fields";
import { AuthAlert } from "@/components/portal/auth-fields";
import { buttonClasses } from "@/components/ui/button-styles";

const MONTHS = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

/** DATEV-Stammdaten und Kontenzuordnung – einmal mit der Steuerberatung abstimmen. */
export function AccountingSettingsForm({ settings }: { settings: AccountingSettings }) {
  const router = useRouter();
  const [values, setValues] = useState(settings);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string }>();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof AccountingSettings>(key: K, value: AccountingSettings[K]) => setValues((current) => ({ ...current, [key]: value }));
  const setAccount = (key: keyof AccountingSettings["accounts"], value: string) =>
    setValues((current) => ({ ...current, accounts: { ...current.accounts, [key]: Number(value.replace(/\D/g, "")) || 0 } }));

  const changeChart = (chart: ChartOfAccounts) => {
    if (chart === values.chart) return;
    const replace = window.confirm(`Kontenrahmen ${chart}: Erlös- und Kassenkonten auf die ${chart}-Standardkonten setzen?`);
    setValues((current) => ({ ...current, chart, accounts: replace ? { ...DEFAULT_ACCOUNTS[chart] } : current.accounts }));
  };

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setMessage(undefined);
    setFieldErrors({});
    try {
      await apiRequest("/admin/accounting/settings", { method: "PUT", body: values });
      setMessage({ tone: "success", text: "Einstellungen gespeichert." });
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError && error.fields) setFieldErrors(error.fields);
      setMessage({ tone: "error", text: errorMessage(error) });
    } finally {
      setPending(false);
    }
  };

  const numberField = (label: string, key: "consultantNumber" | "clientNumber", hint: string) => (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-primary">{label}</span>
      <input
        inputMode="numeric"
        value={values[key] ?? ""}
        onChange={(event) => set(key, event.target.value ? Number(event.target.value.replace(/\D/g, "")) : undefined)}
        className={`${inputClasses} h-11`}
      />
      <span className="mt-1 block text-xs text-slate-500">{fieldErrors[key] ?? hint}</span>
    </label>
  );

  return (
    <form onSubmit={save} className="space-y-6">
      {message && <AuthAlert tone={message.tone}>{message.text}</AuthAlert>}

      <fieldset className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <legend className="mb-3 text-sm font-bold text-primary">DATEV</legend>
        {numberField("Beraternummer", "consultantNumber", "Von der Steuerkanzlei, 4–7 Ziffern")}
        {numberField("Mandantennummer", "clientNumber", "Ihre Nummer bei der Kanzlei, 1–5 Ziffern")}
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-primary">Kontenrahmen</span>
          <select value={values.chart} onChange={(event) => changeChart(event.target.value as ChartOfAccounts)} className={selectClasses}>
            <option value="SKR03">SKR 03</option>
            <option value="SKR04">SKR 04</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-primary">Wirtschaftsjahr beginnt</span>
          <select value={values.fiscalYearStartMonth} onChange={(event) => set("fiscalYearStartMonth", Number(event.target.value))} className={selectClasses}>
            {MONTHS.map((name, index) => (
              <option key={name} value={index + 1}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-primary">Sachkontenlänge</span>
          <select value={values.accountLength} onChange={(event) => set("accountLength", Number(event.target.value))} className={selectClasses}>
            {[4, 5, 6, 7, 8].map((length) => (
              <option key={length} value={length}>
                {length} Stellen{length === 4 ? " (Standard)" : ""}
              </option>
            ))}
          </select>
        </label>
      </fieldset>

      <fieldset className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <legend className="mb-3 text-sm font-bold text-primary">Debitoren</legend>
        <label className="block md:col-span-2">
          <span className="mb-1.5 block text-sm font-semibold text-primary">Personenkonten</span>
          <select value={values.debtorMode} onChange={(event) => set("debtorMode", event.target.value as AccountingSettings["debtorMode"])} className={selectClasses}>
            <option value="PER_CUSTOMER">Je Kunde – Kundennummer K-10042 wird Debitor 10042</option>
            <option value="COLLECTIVE">Ein Sammeldebitor für alle Kunden</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-primary">Sammeldebitor</span>
          <input
            inputMode="numeric"
            value={values.collectiveDebtorAccount}
            onChange={(event) => set("collectiveDebtorAccount", Number(event.target.value.replace(/\D/g, "")) || 0)}
            className={`${inputClasses} h-11`}
          />
          <span className="mt-1 block text-xs text-slate-500">Auch Auffangkonto, wenn eine Kundennummer nicht passt</span>
        </label>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-sm font-bold text-primary">Kontenzuordnung</legend>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          {TAX_CASES.map((taxCase) => (
            <label key={taxCase} className="block">
              <span className="mb-1.5 block text-xs font-semibold text-primary">{TAX_CASE_INFO[taxCase].label}</span>
              <input inputMode="numeric" value={values.accounts[taxCase]} onChange={(event) => setAccount(taxCase, event.target.value)} className={`${inputClasses} h-11`} />
            </label>
          ))}
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-primary">Kasse (Barzahlungen)</span>
            <input inputMode="numeric" value={values.accounts.cash} onChange={(event) => setAccount("cash", event.target.value)} className={`${inputClasses} h-11`} />
          </label>
        </div>
        <label className="mt-4 flex items-start gap-3 text-sm text-slate-700">
          <input type="checkbox" checked={values.includeCashPayments} onChange={(event) => set("includeCashPayments", event.target.checked)} className="mt-0.5 size-4 accent-[#0369a1]" />
          <span>
            Barzahlungen als Buchung „Kasse an Debitor“ mitexportieren
            <span className="block text-xs text-slate-500">Überweisungen nicht – die bucht die Kanzlei über den Kontoauszug.</span>
          </span>
        </label>
      </fieldset>

      <fieldset className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <legend className="mb-3 text-sm font-bold text-primary">Steuerberatung</legend>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-primary">Kanzlei / Ansprechpartner</span>
          <input value={values.accountantName ?? ""} onChange={(event) => set("accountantName", event.target.value || undefined)} className={`${inputClasses} h-11`} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-primary">E-Mail für das Belegpaket</span>
          <input type="email" value={values.accountantEmail ?? ""} onChange={(event) => set("accountantEmail", event.target.value || undefined)} className={`${inputClasses} h-11`} />
          {fieldErrors.accountantEmail && <span className="mt-1 block text-sm font-medium text-red-600">{fieldErrors.accountantEmail}</span>}
        </label>
      </fieldset>

      <p className="text-xs text-slate-500">
        Standardkonten laut DATEV-Kontenrahmen (Automatikkonten, die Umsatzsteuer errechnet DATEV). Bitte die Zuordnung einmal mit
        Ihrer Steuerberatung abstimmen.
      </p>
      <button type="submit" disabled={pending} className={buttonClasses({ variant: "dark", size: "sm" })}>
        {pending && <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />}
        Einstellungen speichern
      </button>
    </form>
  );
}
