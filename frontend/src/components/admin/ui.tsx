import { ShieldAlert } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Bausteine der Admin-Seiten (Server- und Client-tauglich). */

export function AdminPage({ title, description, actions, children }: { title: string; description?: string; actions?: ReactNode; children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary sm:text-3xl">{title}</h1>
          {description && <p className="mt-1.5 max-w-3xl text-sm text-slate-600">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
      </header>
      {children}
    </div>
  );
}

export function Card({ title, description, action, className, children }: { title?: string; description?: string; action?: ReactNode; className?: string; children: ReactNode }) {
  return (
    <section className={cn("rounded-2xl bg-white p-5 shadow-card ring-1 ring-primary/5 sm:p-6", className)}>
      {(title || action) && (
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && <h2 className="font-display text-base font-bold text-primary">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function OnlineDot({ online, className }: { online: boolean; className?: string }) {
  return (
    <span className={cn("relative inline-flex size-2.5 shrink-0", className)}>
      {online && <span aria-hidden="true" className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-60" />}
      <span className={cn("relative inline-flex size-2.5 rounded-full", online ? "bg-emerald-500" : "bg-slate-300")} />
      <span className="sr-only">{online ? "Online" : "Offline"}</span>
    </span>
  );
}

export function NoAccess({ text = "Für diesen Bereich fehlt Ihnen die Berechtigung. Ein Administrator kann sie unter „Team“ vergeben." }: { text?: string }) {
  return (
    <div className="mx-auto mt-16 max-w-md rounded-2xl bg-white p-8 text-center shadow-card ring-1 ring-primary/5">
      <ShieldAlert aria-hidden="true" className="mx-auto size-10 text-amber-500" />
      <p className="mt-4 font-display text-lg font-bold text-primary">Kein Zugriff</p>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
    </div>
  );
}

export const tableClasses = {
  wrapper: "-mx-5 overflow-x-auto sm:-mx-6",
  table: "w-full min-w-[48rem] text-left text-sm",
  head: "border-b border-slate-100 text-xs font-semibold tracking-wide text-slate-500 uppercase",
  th: "px-5 py-3 font-semibold sm:px-6",
  row: "border-b border-slate-100 last:border-0 hover:bg-surface/60",
  td: "px-5 py-3.5 align-top sm:px-6",
};

export function EmptyRow({ colSpan, children }: { colSpan: number; children: ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-10 text-center text-sm text-slate-500">
        {children}
      </td>
    </tr>
  );
}
