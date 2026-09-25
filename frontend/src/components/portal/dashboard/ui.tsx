import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { BadgeTone } from "@/lib/portal-format";
import { buttonClasses } from "@/components/ui/button-styles";
import { Container } from "@/components/ui/Container";
import { Icon, type IconName } from "@/components/ui/Icon";

/** Bausteine der Portal-Seiten: Karten, Kennzahlen, Status und Leerzustände. */

const badgeTones: Record<BadgeTone, string> = {
  neutral: "bg-slate-100 text-slate-700 ring-slate-200",
  info: "bg-sky-50 text-sky-800 ring-sky-200",
  progress: "bg-accent/10 text-accent-ink ring-accent/30",
  success: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  warning: "bg-amber-50 text-amber-800 ring-amber-200",
  danger: "bg-red-50 text-red-700 ring-red-200",
};

export function StatusBadge({ tone, children }: { tone: BadgeTone; children: ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset", badgeTones[tone])}>
      {tone === "progress" && <span aria-hidden="true" className="size-1.5 animate-pulse rounded-full bg-current" />}
      {children}
    </span>
  );
}

export function Panel({
  title,
  icon,
  action,
  className,
  children,
}: {
  title: string;
  icon: IconName;
  action?: { label: string; href: string };
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn("rounded-3xl bg-white p-6 shadow-card ring-1 ring-primary/5 sm:p-8", className)}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-accent">
            <Icon name={icon} className="size-5" />
          </span>
          <h2 className="font-display text-lg font-bold text-primary">{title}</h2>
        </div>
        {action && (
          <Link href={action.href} className="inline-flex items-center gap-1 text-sm font-semibold text-accent-ink underline-offset-4 hover:underline">
            {action.label}
            <Icon name="arrow-right" className="size-4" />
          </Link>
        )}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export function StatTile({
  icon,
  label,
  value,
  detail,
  highlight,
}: {
  icon: IconName;
  label: string;
  value: string;
  detail?: string;
  highlight?: "warning";
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-primary/5">
      <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
        <Icon name={icon} className="size-4 text-accent-ink" />
        {label}
      </div>
      <p className="mt-3 font-display text-3xl font-bold text-primary">{value}</p>
      {detail && (
        <p className={cn("mt-1 text-sm", highlight === "warning" ? "font-semibold text-red-700" : "text-slate-500")}>{detail}</p>
      )}
    </div>
  );
}

export function EmptyState({ title, text, action }: { title: string; text: string; action?: { label: string; href: string } }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-surface p-6 text-center">
      <p className="text-sm font-semibold text-primary">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-sm leading-relaxed text-slate-600">{text}</p>
      {action && (
        <Link href={action.href} className={buttonClasses({ variant: "dark", size: "sm", className: "mt-5" })}>
          {action.label}
        </Link>
      )}
    </div>
  );
}

/** Dunkles Band oben auf jeder Portal-Seite – Inhalte überlappen es mit -mt-24. */
export function PortalHero({ eyebrow, title, text, children }: { eyebrow: string; title: string; text?: string; children?: ReactNode }) {
  return (
    <div className="relative isolate overflow-hidden bg-primary pb-32">
      <div aria-hidden="true" className="bg-grid absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <Container className="pt-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">{eyebrow}</p>
        <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">{title}</h1>
        {text && <p className="mt-2 max-w-2xl text-slate-300">{text}</p>}
        {children}
      </Container>
    </div>
  );
}
