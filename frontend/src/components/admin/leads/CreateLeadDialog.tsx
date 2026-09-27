"use client";

import { LEAD_SOURCE_LABEL, LEAD_SOURCES, LEAD_TOPICS, type AdminLeadDetail, type LeadSource, type LeadTopic } from "@fa/shared";
import { Inbox, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { routes } from "@/content/navigation";
import { leadTopicLabel } from "@/lib/admin-format";
import { apiRequest } from "@/lib/api/client";
import { ApiError, errorMessage } from "@/lib/api/errors";
import { inputClasses, selectClasses } from "@/components/forms/fields";
import { AuthAlert } from "@/components/portal/auth-fields";
import { buttonClasses } from "@/components/ui/button-styles";
import { Dialog } from "../Dialog";

/** Anfrage manuell erfassen – nach einem Anruf, aus MyHammer oder einer E-Mail. */
export function CreateLeadButton({ initiallyOpen = false }: { initiallyOpen?: boolean }) {
  const [open, setOpen] = useState(initiallyOpen);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={buttonClasses({ variant: "dark", size: "sm" })}>
        <Inbox aria-hidden="true" className="size-4" /> Anfrage erfassen
      </button>
      {open && <CreateLeadDialog onClose={() => setOpen(false)} />}
    </>
  );
}

function CreateLeadDialog({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const text = (name: string) => String(data.get(name) ?? "");
    setPending(true);
    setError(undefined);
    setFieldErrors({});
    try {
      const lead = await apiRequest<AdminLeadDetail>("/admin/leads", {
        body: {
          source: text("source") as LeadSource,
          topic: text("topic") as LeadTopic,
          name: text("name"),
          company: text("company"),
          email: text("email"),
          phone: text("phone"),
          from: text("from"),
          to: text("to"),
          preferredDate: text("preferredDate"),
          message: text("message"),
          callback: data.get("callback") === "on",
          note: text("note"),
        },
      });
      router.push(`${routes.adminLeads}/${lead.id}`);
    } catch (createError) {
      if (createError instanceof ApiError && createError.fields) setFieldErrors(createError.fields);
      else setError(errorMessage(createError));
      setPending(false);
    }
  };

  return (
    <Dialog open onClose={onClose} title="Anfrage erfassen" description="Die Anfrage erscheint in der Pipeline unter „Neu“ und ist Ihnen zugewiesen.">
      <form onSubmit={onSubmit} className="space-y-4">
        {error && <AuthAlert tone="error">{error}</AuthAlert>}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select name="source" label="Quelle" options={LEAD_SOURCES.map((value) => ({ value, label: LEAD_SOURCE_LABEL[value] }))} defaultValue="PHONE" />
          <Select name="topic" label="Thema" options={LEAD_TOPICS.map((value) => ({ value, label: leadTopicLabel(value) }))} defaultValue="umzuege" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field name="name" label="Name" required error={fieldErrors.name} />
          <Field name="company" label="Firma" error={fieldErrors.company} />
          <Field name="email" type="email" label="E-Mail" error={fieldErrors.email} />
          <Field name="phone" type="tel" label="Telefon" error={fieldErrors.phone} />
          <Field name="from" label="Von / Objektadresse" error={fieldErrors.from} />
          <Field name="to" label="Nach" error={fieldErrors.to} />
          <Field name="preferredDate" label="Wunschtermin" placeholder="z. B. 15.10. oder KW 42" error={fieldErrors.preferredDate} />
        </div>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-primary">Anliegen</span>
          <textarea name="message" rows={4} className={`${inputClasses} py-3`} />
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" name="callback" className="size-4 accent-[#0369a1]" /> Rückruf gewünscht
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-primary">
            Erste Notiz <span className="font-normal text-slate-500">(optional, intern)</span>
          </span>
          <textarea name="note" rows={2} className={`${inputClasses} py-3`} />
        </label>
        <button type="submit" disabled={pending} className={buttonClasses({ variant: "dark", size: "md" })}>
          {pending && <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />}
          Anfrage anlegen
        </button>
      </form>
    </Dialog>
  );
}

function Field({ name, label, type = "text", required, placeholder, error }: { name: string; label: string; type?: string; required?: boolean; placeholder?: string; error?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-primary">
        {label}
        {!required && <span className="ml-1.5 font-normal text-slate-500">(optional)</span>}
      </span>
      <input name={name} type={type} required={required} placeholder={placeholder} autoComplete="off" className={`${inputClasses} h-11`} />
      {error && <span className="mt-1 block text-sm font-medium text-red-600">{error}</span>}
    </label>
  );
}

function Select({ name, label, options, defaultValue }: { name: string; label: string; options: Array<{ value: string; label: string }>; defaultValue: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-primary">{label}</span>
      <select name={name} defaultValue={defaultValue} className={selectClasses}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
