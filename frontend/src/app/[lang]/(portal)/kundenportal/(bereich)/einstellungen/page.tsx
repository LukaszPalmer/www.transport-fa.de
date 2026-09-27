import type { AccountSettings, InvoiceListResponse } from "@fa/shared";
import type { Metadata } from "next";
import { routes } from "@/content/navigation";
import { defineMessages } from "@/i18n/config";
import { getLocale } from "@/i18n/server";
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

const messages = defineMessages({
  de: {
    metaTitle: "Kundenportal – Einstellungen",
    eyebrow: "Einstellungen",
    title: "Ihr Konto",
    hero: (number: string, since: string) => `Kundennummer ${number} · Kunde seit ${since}`,
    profile: "Profil",
    email: "E-Mail-Adresse",
    verified: "Bestätigt",
    pending: "Bestätigung ausstehend",
    password: "Passwort",
    signIn: "Anmeldung",
    withPassword: "✓ E-Mail und Passwort",
    noPassword: "– Kein Passwort hinterlegt",
    google: "✓ Mit Google verknüpft",
    noGoogle: "– Nicht mit Google verknüpft",
    passwordChanged: (date: string) => `Passwort zuletzt geändert am ${date}`,
    notifications: "Benachrichtigungen",
    emailLanguage: "E-Mails senden wir Ihnen auf Deutsch. Die Sprache ändern Sie oben über den Sprachumschalter.",
  },
  en: {
    metaTitle: "Customer portal – Settings",
    eyebrow: "Settings",
    title: "Your account",
    hero: (number: string, since: string) => `Customer number ${number} · Customer since ${since}`,
    profile: "Profile",
    email: "Email address",
    verified: "Confirmed",
    pending: "Confirmation pending",
    password: "Password",
    signIn: "Sign-in",
    withPassword: "✓ Email and password",
    noPassword: "– No password set",
    google: "✓ Linked to Google",
    noGoogle: "– Not linked to Google",
    passwordChanged: (date: string) => `Password last changed on ${date}`,
    notifications: "Notifications",
    emailLanguage: "We send you emails in English. You can change the language with the language switcher at the top.",
  },
});

export async function generateMetadata(): Promise<Metadata> {
  return { title: messages[await getLocale()].metaTitle };
}

/** Einstellungen: Profil, E-Mail, Passwort, Benachrichtigungen und Konto löschen. */
export default async function SettingsPage({ searchParams }: PageProps<"/[lang]/kundenportal/einstellungen">) {
  const { user } = await requireCustomer(routes.portalSettings);
  const locale = await getLocale();
  const t = messages[locale];
  const { loeschen } = await searchParams;
  const [settings, invoiceList] = await Promise.all([
    apiServer<AccountSettings>("/account/settings"),
    // Belege nur mit bestätigter E-Mail – vorher gibt es im Portal keine.
    user.emailVerified ? apiServer<InvoiceListResponse>("/portal/invoices") : Promise.resolve<InvoiceListResponse | null>(null),
  ]);

  return (
    <>
      <PortalHero eyebrow={t.eyebrow} title={t.title} text={t.hero(settings.profile.customerNumber, formatLongDate(user.createdAt, locale))} />

      <Container className="relative z-10 -mt-24 pb-24">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Panel title={t.profile} icon="users" className="lg:col-span-2">
            <ProfileForm profile={settings.profile} />
          </Panel>

          <Panel title={t.email} icon="mail">
            <div className="mb-5">
              <StatusBadge tone={settings.emailVerified ? "success" : "warning"}>
                {settings.emailVerified ? t.verified : t.pending}
              </StatusBadge>
            </div>
            <EmailForm email={settings.profile.email} hasPassword={settings.hasPassword} />
            {!settings.emailVerified && (
              <div className="mt-5">
                <ResendVerificationButton />
              </div>
            )}
          </Panel>

          <Panel title={t.password} icon="key" className="lg:col-span-2">
            <PasswordForm hasPassword={settings.hasPassword} />
          </Panel>

          <Panel title={t.signIn} icon="shield-check">
            <ul className="space-y-3 text-sm text-slate-600">
              <li>{settings.hasPassword ? t.withPassword : t.noPassword}</li>
              <li>{settings.googleLinked ? t.google : t.noGoogle}</li>
              {settings.passwordChangedAt && <li>{t.passwordChanged(formatLongDate(settings.passwordChangedAt, locale))}</li>}
            </ul>
            <div className="mt-8 border-t border-slate-100 pt-6">
              <SignOutButton tone="dark" />
            </div>
          </Panel>

          <Panel title={t.notifications} icon="bell" className="lg:col-span-3">
            <NotificationSettings initial={settings.notifications} />
            <p className="mt-4 border-t border-slate-100 pt-4 text-xs text-slate-500">{t.emailLanguage}</p>
          </Panel>

          <div className="lg:col-span-3">
            <DeleteAccountSection hasPassword={settings.hasPassword} initiallyOpen={loeschen === "1"} invoices={invoiceList?.invoices ?? []} />
          </div>
        </div>
      </Container>
    </>
  );
}
