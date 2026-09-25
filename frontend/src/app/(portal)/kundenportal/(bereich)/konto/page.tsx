import type { Metadata } from "next";
import Link from "next/link";
import { routes } from "@/content/navigation";
import { formatLongDate } from "@/lib/portal-format";
import { requireCustomer } from "@/lib/session";
import { ResendVerificationButton, SignOutButton } from "@/components/portal/AccountActions";
import { Panel, PortalHero } from "@/components/portal/dashboard/ui";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";

export const metadata: Metadata = { title: "Kundenportal – Mein Konto" };

/** Konto-Übersicht: Stammdaten, Anmeldemethode, Passwort. */
export default async function AccountPage() {
  const { user, customer } = await requireCustomer(routes.portalAccount);

  return (
    <>
      <PortalHero eyebrow="Mein Konto" title={`${customer.firstName} ${customer.lastName}`} text={`Kundennummer ${customer.customerNumber}`} />

      <Container className="relative z-10 -mt-24 pb-24">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Panel title="Meine Daten" icon="users" className="lg:col-span-2">
            <dl className="space-y-4 text-sm">
              <ProfileRow label="Name" value={`${customer.firstName} ${customer.lastName}`} />
              {customer.companyName && <ProfileRow label="Firma" value={customer.companyName} />}
              <ProfileRow label="E-Mail" value={user.email} />
              <ProfileRow label="Kundennummer" value={customer.customerNumber} />
              <ProfileRow label="Kunde seit" value={formatLongDate(user.createdAt)} />
              <ProfileRow
                label="E-Mail-Status"
                value={user.emailVerified ? "Bestätigt" : "Bestätigung ausstehend"}
                highlight={user.emailVerified ? "ok" : "pending"}
              />
            </dl>
            {!user.emailVerified && (
              <div className="mt-6">
                <ResendVerificationButton />
              </div>
            )}
          </Panel>

          <Panel title="Anmeldung & Sicherheit" icon="shield-check">
            <ul className="space-y-4 text-sm">
              <li className="flex items-center gap-3 text-slate-600">
                <Icon name="key" className="size-4 text-slate-400" />
                {user.hasPassword ? "Anmeldung mit E-Mail und Passwort" : "Anmeldung mit Google"}
              </li>
            </ul>
            <Link
              href={routes.portalForgot}
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-ink underline-offset-4 hover:underline"
            >
              {user.hasPassword ? "Passwort ändern" : "Zusätzlich ein Passwort festlegen"}
              <Icon name="arrow-right" className="size-4" />
            </Link>
            <div className="mt-8 border-t border-slate-100 pt-6">
              <SignOutButton tone="dark" />
            </div>
          </Panel>
        </div>
      </Container>
    </>
  );
}

function ProfileRow({ label, value, highlight }: { label: string; value: string; highlight?: "ok" | "pending" }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
      <dt className="text-slate-500">{label}</dt>
      <dd
        className={
          highlight === "ok"
            ? "font-semibold text-emerald-700"
            : highlight === "pending"
              ? "font-semibold text-amber-700"
              : "truncate font-semibold text-primary"
        }
      >
        {value}
      </dd>
    </div>
  );
}
