import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { company } from "@/content/company";
import { routes } from "@/content/navigation";
import { getSession } from "@/lib/session";
import { ResendVerificationButton, SignOutButton } from "@/components/portal/AccountActions";
import { AuthAlert } from "@/components/portal/auth-fields";
import { buttonClasses } from "@/components/ui/button-styles";
import { Container } from "@/components/ui/Container";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";

export const metadata: Metadata = { title: "Kundenportal – Mein Konto" };

const dateFormat = new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "long", year: "numeric" });

/** Geschützter Kontobereich. Ohne Sitzung → Anmeldung mit Rücksprung. */
export default async function AccountPage({ searchParams }: PageProps<"/kundenportal/konto">) {
  const session = await getSession();
  if (!session) redirect(`${routes.portal}?weiter=${encodeURIComponent(routes.portalAccount)}`);

  const { user } = session;
  const params = await searchParams;
  const firstName = user.name.split(" ")[0] || user.name;

  return (
    <div className="min-h-dvh bg-surface">
      <header className="bg-primary">
        <Container className="flex h-18 items-center justify-between gap-4">
          <Logo />
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-slate-300 sm:inline">{user.email}</span>
            <SignOutButton />
          </div>
        </Container>
      </header>

      <div className="relative isolate overflow-hidden bg-primary pb-32">
        <div aria-hidden="true" className="bg-grid absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <Container className="pt-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Kundenportal</p>
          <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Guten Tag, {firstName}.</h1>
          <p className="mt-2 text-slate-300">Hier finden Sie alle Aufträge, Termine und Dokumente an einem Ort.</p>
        </Container>
      </div>

      <Container className="relative z-10 -mt-24 space-y-6 pb-24">
        {params.willkommen && (
          <AuthAlert tone="success">
            Willkommen bei {company.name}! Ihr Konto ist eingerichtet.
            {!user.emailVerified && " Wir haben Ihnen eine E-Mail zur Bestätigung Ihrer Adresse gesendet."}
          </AuthAlert>
        )}
        {params.verifiziert && user.emailVerified && (
          <AuthAlert tone="success">Vielen Dank – Ihre E-Mail-Adresse ist bestätigt.</AuthAlert>
        )}
        {!user.emailVerified && !params.willkommen && (
          <AuthAlert tone="info">
            Bitte bestätigen Sie Ihre E-Mail-Adresse, damit wir Ihnen Angebote und Dokumente zuordnen können.{" "}
            <ResendVerificationButton email={user.email} />
          </AuthAlert>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <EmptyCard
            className="lg:col-span-2"
            icon="package"
            title="Meine Aufträge"
            text="Sobald wir einen Auftrag für Sie anlegen – ob Umzug, Entrümpelung oder Transport –, sehen Sie hier Status, Termine und Ihren Ansprechpartner."
            action={{ label: "Neue Anfrage stellen", href: routes.contactForm }}
          />
          <section aria-labelledby="profile-title" className="rounded-3xl bg-white p-8 shadow-card ring-1 ring-primary/5">
            <h2 id="profile-title" className="font-display text-lg font-bold text-primary">
              Mein Profil
            </h2>
            <dl className="mt-5 space-y-4 text-sm">
              <ProfileRow label="Name" value={user.name} />
              <ProfileRow label="E-Mail" value={user.email} />
              <ProfileRow
                label="Status"
                value={user.emailVerified ? "E-Mail bestätigt" : "Bestätigung ausstehend"}
                highlight={user.emailVerified ? "ok" : "pending"}
              />
              <ProfileRow label="Kunde seit" value={dateFormat.format(new Date(user.createdAt))} />
            </dl>
            <Link
              href={routes.portalForgot}
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-ink underline-offset-4 hover:underline"
            >
              Passwort ändern
              <Icon name="arrow-right" className="size-4" />
            </Link>
          </section>

          <EmptyCard
            icon="file-text"
            title="Dokumente & Rechnungen"
            text="Angebote, Auftragsbestätigungen, Rechnungen und Übergabeprotokolle stehen hier zum Download bereit."
          />
          <EmptyCard
            icon="map-pin"
            title="Sendungsverfolgung"
            text="Für Transport- und Logistikaufträge sehen Sie hier Position, ETA und den digitalen Abliefernachweis."
          />
          <section aria-labelledby="support-title" className="rounded-3xl bg-primary p-8 text-white shadow-card">
            <h2 id="support-title" className="font-display text-lg font-bold">
              Ihr direkter Draht
            </h2>
            <p className="mt-2 text-sm text-slate-300">{company.contact.hours}</p>
            <ul className="mt-5 space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <Icon name="phone" className="size-4 text-accent" />
                <a href={company.contact.phoneHref} className="font-semibold hover:text-accent">
                  {company.contact.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Icon name="mail" className="size-4 text-accent" />
                <a href={`mailto:${company.contact.email}`} className="font-semibold hover:text-accent">
                  {company.contact.email}
                </a>
              </li>
            </ul>
          </section>
        </div>
      </Container>
    </div>
  );
}

function EmptyCard({
  icon,
  title,
  text,
  action,
  className,
}: {
  icon: IconName;
  title: string;
  text: string;
  action?: { label: string; href: string };
  className?: string;
}) {
  return (
    <section className={`rounded-3xl bg-white p-8 shadow-card ring-1 ring-primary/5 ${className ?? ""}`}>
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-accent">
          <Icon name={icon} className="size-5" />
        </span>
        <h2 className="font-display text-lg font-bold text-primary">{title}</h2>
      </div>
      <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-surface p-6 text-center">
        <p className="text-sm font-semibold text-primary">Noch keine Einträge</p>
        <p className="mx-auto mt-1 max-w-md text-sm leading-relaxed text-slate-600">{text}</p>
        {action && (
          <Link href={action.href} className={buttonClasses({ variant: "dark", size: "sm", className: "mt-5" })}>
            {action.label}
          </Link>
        )}
      </div>
    </section>
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
