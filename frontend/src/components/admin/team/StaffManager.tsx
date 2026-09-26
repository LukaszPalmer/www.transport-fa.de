"use client";

import { PERMISSION_INFO, PERMISSIONS, type AdminUserRow, type Permission, type StaffRole } from "@fa/shared";
import { ChevronDown, LoaderCircle, ShieldCheck, ShieldOff, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { cn } from "@/lib/cn";
import { formatRelative, generatePassword } from "@/lib/admin-format";
import { apiRequest } from "@/lib/api/client";
import { ApiError, errorMessage } from "@/lib/api/errors";
import { inputClasses, selectClasses } from "@/components/forms/fields";
import { AuthAlert } from "@/components/portal/auth-fields";
import { StatusBadge } from "@/components/portal/dashboard/ui";
import { buttonClasses } from "@/components/ui/button-styles";
import { CredentialsForm } from "../CredentialsForm";
import { Dialog } from "../Dialog";
import { OnlineDot } from "../ui";

/** Mitarbeiter verwalten (nur ADMIN): anlegen, Rolle & Rechte, Sperre, 2FA zurücksetzen, Zugangsdaten. */
export function StaffManager({ staff, selfId }: { staff: AdminUserRow[]; selfId: string }) {
  const [creating, setCreating] = useState(false);
  const [expanded, setExpanded] = useState<string>();

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button type="button" onClick={() => setCreating(true)} className={buttonClasses({ variant: "dark", size: "sm" })}>
          <UserPlus aria-hidden="true" className="size-4" /> Mitarbeiter anlegen
        </button>
      </div>
      <ul className="divide-y divide-slate-100 rounded-2xl ring-1 ring-slate-100">
        {staff.map((member) => (
          <li key={member.id}>
            <button
              type="button"
              onClick={() => setExpanded((current) => (current === member.id ? undefined : member.id))}
              aria-expanded={expanded === member.id}
              className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3.5 text-left hover:bg-surface sm:px-5"
            >
              <OnlineDot online={member.online} />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold text-primary">
                  {member.staff?.displayName ?? member.name}
                  {member.id === selfId && <span className="ml-2 text-xs font-normal text-slate-500">(Sie)</span>}
                </span>
                <span className="block truncate text-xs text-slate-500">
                  {member.email}
                  {member.staff?.jobTitle && ` · ${member.staff.jobTitle}`}
                </span>
              </span>
              <span className="flex flex-wrap items-center gap-1.5">
                <StatusBadge tone={member.role === "ADMIN" ? "progress" : "neutral"}>{member.role === "ADMIN" ? "Administrator" : "Mitarbeiter"}</StatusBadge>
                {member.state !== "ACTIVE" && <StatusBadge tone="danger">gesperrt</StatusBadge>}
                <StatusBadge tone={member.staff?.mfaEnabled ? "success" : "warning"}>{member.staff?.mfaEnabled ? "2FA aktiv" : "2FA offen"}</StatusBadge>
              </span>
              <span className="w-28 text-right text-xs text-slate-500">{member.online ? "online" : formatRelative(member.lastSeenAt)}</span>
              <ChevronDown aria-hidden="true" className={cn("size-4 text-slate-400 transition-transform", expanded === member.id && "rotate-180")} />
            </button>
            {expanded === member.id && <StaffEditor member={member} self={member.id === selfId} />}
          </li>
        ))}
      </ul>
      {creating && <CreateStaffDialog onClose={() => setCreating(false)} />}
    </div>
  );
}

function PermissionPicker({ value, onChange, disabled }: { value: Permission[]; onChange: (value: Permission[]) => void; disabled?: boolean }) {
  return (
    <fieldset disabled={disabled} className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      <legend className="mb-2 text-sm font-semibold text-primary">Rechte {disabled && <span className="font-normal text-slate-500">(Administratoren haben alle Rechte)</span>}</legend>
      {PERMISSIONS.map((permission) => (
        <label key={permission} className={cn("flex items-start gap-3 rounded-xl p-3 ring-1 ring-slate-200", disabled ? "opacity-60" : "cursor-pointer hover:bg-surface")}>
          <input
            type="checkbox"
            checked={disabled || value.includes(permission)}
            onChange={(event) => onChange(event.target.checked ? [...value, permission] : value.filter((item) => item !== permission))}
            className="mt-0.5 size-4 accent-[#0369a1]"
          />
          <span>
            <span className="block text-sm font-semibold text-primary">{PERMISSION_INFO[permission].label}</span>
            <span className="block text-xs text-slate-500">{PERMISSION_INFO[permission].description}</span>
          </span>
        </label>
      ))}
    </fieldset>
  );
}

function StaffEditor({ member, self }: { member: AdminUserRow; self: boolean }) {
  const router = useRouter();
  const [role, setRole] = useState<StaffRole>(member.role === "ADMIN" ? "ADMIN" : "EMPLOYEE");
  const [permissions, setPermissions] = useState<Permission[]>(member.staff?.permissions ?? []);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string }>();

  const save = async (body: Record<string, unknown>, success: string) => {
    setPending(true);
    setMessage(undefined);
    try {
      await apiRequest(`/admin/users/staff/${member.id}`, { method: "PATCH", body });
      setMessage({ tone: "success", text: success });
      router.refresh();
    } catch (error) {
      setMessage({ tone: "error", text: errorMessage(error) });
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 border-t border-slate-100 bg-surface/50 p-4 sm:p-5 lg:grid-cols-2">
      <div className="space-y-4">
        {message && <AuthAlert tone={message.tone}>{message.text}</AuthAlert>}
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-primary">Rolle</span>
          <select value={role} disabled={self} onChange={(event) => setRole(event.target.value as StaffRole)} className={selectClasses}>
            <option value="EMPLOYEE">Mitarbeiter (Rechte einzeln)</option>
            <option value="ADMIN">Administrator (alle Rechte)</option>
          </select>
        </label>
        <PermissionPicker value={permissions} onChange={setPermissions} disabled={role === "ADMIN"} />
        <div className="flex flex-wrap gap-3">
          <button type="button" disabled={pending} onClick={() => void save({ role, permissions }, "Rolle und Rechte gespeichert.")} className={buttonClasses({ variant: "dark", size: "sm" })}>
            {pending && <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />}
            Rechte speichern
          </button>
          {!self && (
            <>
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  if (window.confirm("2FA zurücksetzen? Der Mitarbeiter wird abgemeldet und richtet die App bei der nächsten Anmeldung neu ein.")) {
                    void save({ resetMfa: true }, "2FA zurückgesetzt – wird bei der nächsten Anmeldung neu eingerichtet.");
                  }
                }}
                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-white"
              >
                <ShieldOff aria-hidden="true" className="size-4" /> 2FA zurücksetzen
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  void save(
                    { state: member.state === "ACTIVE" ? "DISABLED" : "ACTIVE" },
                    member.state === "ACTIVE" ? "Zugang gesperrt – alle Sitzungen beendet." : "Zugang wieder freigegeben.",
                  )
                }
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold ring-1",
                  member.state === "ACTIVE" ? "text-red-700 ring-red-200 hover:bg-red-50" : "text-emerald-700 ring-emerald-200 hover:bg-emerald-50",
                )}
              >
                <ShieldCheck aria-hidden="true" className="size-4" /> {member.state === "ACTIVE" ? "Zugang sperren" : "Zugang freigeben"}
              </button>
            </>
          )}
        </div>
      </div>
      <div>
        <p className="mb-3 text-sm font-semibold text-primary">Zugangsdaten</p>
        <CredentialsForm userId={member.id} currentEmail={member.email} self={self} />
      </div>
    </div>
  );
}

function CreateStaffDialog({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [role, setRole] = useState<StaffRole>("EMPLOYEE");
  const [permissions, setPermissions] = useState<Permission[]>(["can_view_customers", "can_chat"]);
  const [password, setPassword] = useState(() => generatePassword());
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [created, setCreated] = useState<{ email: string; password: string }>();

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "");
    setPending(true);
    setError(undefined);
    setFieldErrors({});
    try {
      await apiRequest("/admin/users/staff", {
        body: { displayName: String(data.get("displayName") ?? ""), jobTitle: String(data.get("jobTitle") ?? ""), email, password, role, permissions },
      });
      setCreated({ email, password });
      router.refresh();
    } catch (createError) {
      if (createError instanceof ApiError && createError.fields) setFieldErrors(createError.fields);
      else setError(errorMessage(createError));
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog open onClose={onClose} title="Mitarbeiter anlegen" description="Die Zwei-Faktor-Authentifizierung richtet der Mitarbeiter bei der ersten Anmeldung selbst ein.">
      {created ? (
        <div className="space-y-4">
          <AuthAlert tone="success">
            Zugang angelegt. Bitte geben Sie die Daten auf sicherem Weg weiter – das Passwort wird nicht erneut angezeigt.
          </AuthAlert>
          <dl className="space-y-2 rounded-2xl bg-surface p-4 text-sm">
            <div>
              <dt className="text-slate-500">Anmeldung</dt>
              <dd className="font-semibold text-primary">{window.location.origin}/admin/login</dd>
            </div>
            <div>
              <dt className="text-slate-500">E-Mail</dt>
              <dd className="font-semibold text-primary">{created.email}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Passwort</dt>
              <dd className="font-mono font-semibold text-primary select-all">{created.password}</dd>
            </div>
          </dl>
          <button type="button" onClick={onClose} className={buttonClasses({ variant: "dark", size: "sm" })}>
            Fertig
          </button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          {error && <AuthAlert tone="error">{error}</AuthAlert>}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input name="displayName" label="Name (sichtbar im Chat)" required error={fieldErrors.displayName} />
            <Input name="jobTitle" label="Funktion" placeholder="z. B. Disposition" error={fieldErrors.jobTitle} />
          </div>
          <Input name="email" type="email" label="E-Mail-Adresse" required error={fieldErrors.email} />
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-primary">Start-Passwort</span>
            <div className="flex gap-2">
              <input value={password} onChange={(event) => setPassword(event.target.value)} required className={`${inputClasses} h-11 font-mono`} />
              <button type="button" onClick={() => setPassword(generatePassword())} className="shrink-0 rounded-xl px-3 text-sm font-semibold ring-1 ring-slate-200 hover:bg-slate-50">
                Neu
              </button>
            </div>
            {fieldErrors.password && <span className="mt-1 block text-sm font-medium text-red-600">{fieldErrors.password}</span>}
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-primary">Rolle</span>
            <select value={role} onChange={(event) => setRole(event.target.value as StaffRole)} className={selectClasses}>
              <option value="EMPLOYEE">Mitarbeiter (Rechte einzeln)</option>
              <option value="ADMIN">Administrator (alle Rechte)</option>
            </select>
          </label>
          <PermissionPicker value={permissions} onChange={setPermissions} disabled={role === "ADMIN"} />
          <button type="submit" disabled={pending} className={buttonClasses({ variant: "dark", size: "md" })}>
            {pending && <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />}
            Zugang anlegen
          </button>
        </form>
      )}
    </Dialog>
  );
}

function Input({ name, label, type = "text", required, placeholder, error }: { name: string; label: string; type?: string; required?: boolean; placeholder?: string; error?: string }) {
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
