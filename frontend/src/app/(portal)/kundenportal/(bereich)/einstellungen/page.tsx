import type { AccountSettings } from "@fa/shared";
import type { Metadata } from "next";
import { routes } from "@/content/navigation";
import { apiServer } from "@/lib/api/server";
import { formatLongDate } from "@/lib/portal-format";
import { requireCustomer } from "@/lib/session";
import { ResendVerificationButton, SignOutButton } from "@/components/portal/AccountActions";
import { DeleteAccountSection } from "@/components/portal/DeleteAccountSection";
import { Panel, PortalHero, StatusBadge } from "@/components/portal/dashboard/ui";
import { EmailForm } from "@/components/portal/settings/EmailForm";
import { NotificationSettings } from "@/components/portal/settings/NotificationSettings";
import { PasswordForm } from "@/components/portal/settings/PasswordForm";
import { ProfileForm } from "@/components/portal/settings/ProfileForm";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = { title: "Kundenportal – Einstellungen" };

/** Einstellungen: Profil, E-Mail, Passwort, Benachrichtigungen und Konto löschen. */
export default async function SettingsPage({ searchParams }: PageProps<"/kundenportal/einstellungen">) {
  const { user } = await requireCustomer(routes.portalSettings);
  const { loeschen } = await searchParams;
  const settings = await apiServer<AccountSettings>("/account/settings");

  return (
    <>
      <PortalHero eyebrow="Einstellungen" title="Ihr Konto" text={`Kundennummer ${settings.profile.customerNumber} · Kunde seit ${formatLongDate(user.createdAt)}`} />

      <Container className="relative z-10 -mt-24 pb-24">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Panel title="Profil" icon="users" className="lg:col-span-2">
            <ProfileForm profile={settings.profile} />
          </Panel>

          <Panel title="E-Mail-Adresse" icon="mail">
            <div className="mb-5">
              <StatusBadge tone={settings.emailVerified ? "success" : "warning"}>
                {settings.emailVerified ? "Bestätigt" : "Bestätigung ausstehend"}
              </StatusBadge>
            </div>
            <EmailForm email={settings.profile.email} hasPassword={settings.hasPassword} />
            {!settings.emailVerified && (
              <div className="mt-5">
                <ResendVerificationButton />
              </div>
            )}
          </Panel>

          <Panel title="Passwort" icon="key" className="lg:col-span-2">
            <PasswordForm hasPassword={settings.hasPassword} />
          </Panel>

          <Panel title="Anmeldung" icon="shield-check">
            <ul className="space-y-3 text-sm text-slate-600">
              <li>{settings.hasPassword ? "✓ E-Mail und Passwort" : "– Kein Passwort hinterlegt"}</li>
              <li>{settings.googleLinked ? "✓ Mit Google verknüpft" : "– Nicht mit Google verknüpft"}</li>
              {settings.passwordChangedAt && <li>Passwort zuletzt geändert am {formatLongDate(settings.passwordChangedAt)}</li>}
            </ul>
            <div className="mt-8 border-t border-slate-100 pt-6">
              <SignOutButton tone="dark" />
            </div>
          </Panel>

          <Panel title="Benachrichtigungen" icon="bell" className="lg:col-span-3">
            <NotificationSettings initial={settings.notifications} />
          </Panel>

          <div className="lg:col-span-3">
            <DeleteAccountSection hasPassword={settings.hasPassword} initiallyOpen={loeschen === "1"} />
          </div>
        </div>
      </Container>
    </>
  );
}
