import { PASSWORD_MIN_LENGTH } from "@fa/shared";
import type { Metadata } from "next";
import Link from "next/link";
import { routes } from "@/content/navigation";
import { defineMessages } from "@/i18n/config";
import { getLocale } from "@/i18n/server";
import { AuthShell } from "@/components/portal/AuthShell";
import { AuthAlert } from "@/components/portal/auth-fields";
import { ResetPasswordForm } from "@/components/portal/PasswordResetForms";

const messages = defineMessages({
  de: {
    metaTitle: "Kundenportal – Neues Passwort",
    title: "Neues Passwort festlegen",
    description: `Wählen Sie ein sicheres Passwort mit mindestens ${PASSWORD_MIN_LENGTH} Zeichen.`,
    welcomeTitle: "Passwort für Ihr Kundenkonto festlegen",
    welcomeDescription: `Ihr Kundenkonto ist eingerichtet. Wählen Sie ein Passwort mit mindestens ${PASSWORD_MIN_LENGTH} Zeichen – danach können Sie sich anmelden.`,
    back: "Zurück zur Anmeldung",
    invalid: "Dieser Link ist ungültig oder abgelaufen. Bitte fordern Sie einen neuen an.",
    newLink: "Neuen Link anfordern",
  },
  en: {
    metaTitle: "Customer portal – New password",
    title: "Set a new password",
    description: `Choose a secure password with at least ${PASSWORD_MIN_LENGTH} characters.`,
    welcomeTitle: "Set the password for your customer account",
    welcomeDescription: `Your customer account is set up. Choose a password with at least ${PASSWORD_MIN_LENGTH} characters – then you can sign in.`,
    back: "Back to sign-in",
    invalid: "This link is invalid or has expired. Please request a new one.",
    newLink: "Request a new link",
  },
});

export async function generateMetadata(): Promise<Metadata> {
  return { title: messages[await getLocale()].metaTitle };
}

/**
 * Ziel des Links aus der Reset-E-Mail – und mit `willkommen=1` aus der Einladung für vom Büro
 * angelegte Kunden. Die API prüft den Token beim Speichern (einmalig; Reset 60 Min., Einladung 7 Tage).
 */
export default async function ResetPasswordPage({ searchParams }: PageProps<"/[lang]/kundenportal/passwort-zuruecksetzen">) {
  const [{ token, willkommen }, locale] = await Promise.all([searchParams, getLocale()]);
  const t = messages[locale];
  const validToken = typeof token === "string" && token.length >= 20 ? token : undefined;
  const welcome = willkommen === "1";

  return (
    <AuthShell
      title={welcome ? t.welcomeTitle : t.title}
      description={welcome ? t.welcomeDescription : t.description}
      footer={
        <Link href={routes.portalLogin} className="font-semibold text-accent-ink underline underline-offset-4">
          {t.back}
        </Link>
      }
    >
      {validToken ? (
        <ResetPasswordForm token={validToken} welcome={welcome} />
      ) : (
        <div className="space-y-5">
          <AuthAlert tone="error">{t.invalid}</AuthAlert>
          <Link href={routes.portalForgot} className="block text-center font-semibold text-accent-ink underline underline-offset-4">
            {t.newLink}
          </Link>
        </div>
      )}
    </AuthShell>
  );
}
