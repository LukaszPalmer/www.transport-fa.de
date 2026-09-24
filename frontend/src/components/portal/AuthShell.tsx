import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";

const benefits = [
  "Aufträge, Termine und Status jederzeit einsehen",
  "Angebote, Rechnungen und Dokumente abrufen",
  "Sendungen live verfolgen (Transport & Logistik)",
  "Direkter Draht zu Ihrem Ansprechpartner",
];

interface AuthShellProps {
  title: string;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * Split-Layout aller Anmelde-Seiten: Markenbild mit Nutzenversprechen links
 * (ab lg), fokussiertes Formular rechts – ohne ablenkende Website-Navigation.
 */
export function AuthShell({ title, description, children, footer }: AuthShellProps) {
  return (
    <div className="grid min-h-dvh grid-cols-1 lg:grid-cols-2">
      <aside className="relative isolate hidden overflow-hidden bg-primary lg:block">
        <Image src="/media/hero/poster.jpg" alt="" fill preload sizes="50vw" quality={60} className="-z-20 object-cover" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-primary/80" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-t from-primary via-primary/40 to-transparent" />
        <div
          aria-hidden="true"
          className="bg-grid absolute inset-0 -z-10 opacity-50 [mask-image:radial-gradient(ellipse_at_30%_40%,black,transparent_70%)]"
        />

        <div className="flex h-full flex-col justify-between p-12 xl:p-16">
          <Logo />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Kundenportal</p>
            <p className="mt-4 max-w-md font-display text-4xl font-extrabold leading-[1.1] tracking-[-0.02em] text-white">
              Alle Aufträge. <span className="text-gradient-accent">Ein Login.</span>
            </p>
            <ul className="mt-8 space-y-4">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3 text-slate-200">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent ring-1 ring-accent/30">
                    <Icon name="check" className="size-3" strokeWidth={3} />
                  </span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
          <p className="flex items-center gap-2 text-sm text-slate-400">
            <Icon name="shield-check" className="size-4 text-accent" />
            Verschlüsselte Übertragung · Daten werden nicht an Dritte weitergegeben
          </p>
        </div>
      </aside>

      <div className="flex flex-col bg-surface">
        <div className="flex items-center justify-between px-4 py-5 sm:px-10">
          <span className="lg:hidden">
            <Logo tone="dark" />
          </span>
          <Link
            href="/"
            className="ml-auto inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-primary"
          >
            <Icon name="arrow-right" className="size-4 rotate-180" />
            Zur Website
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 pt-4 pb-16 sm:px-10">
          <div className="w-full max-w-md">
            <h1 className="text-3xl font-bold text-primary sm:text-4xl">{title}</h1>
            {description && <p className="mt-3 leading-relaxed text-slate-600">{description}</p>}
            <div className="mt-8 rounded-3xl bg-white p-6 shadow-elevated ring-1 ring-primary/5 sm:p-8">{children}</div>
            {footer && <div className="mt-8 text-center text-sm text-slate-600">{footer}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
