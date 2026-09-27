import type { Metadata } from "next";
import Link from "next/link";
import { routes } from "@/content/navigation";
import { defineMessages } from "@/i18n/config";
import { getLocale } from "@/i18n/server";
import { AuthShell } from "@/components/portal/AuthShell";
import { ForgotPasswordForm } from "@/components/portal/PasswordResetForms";

const messages = defineMessages({
  de: {
    metaTitle: "Kundenportal – Passwort vergessen",
    title: "Passwort vergessen?",
    description: "Kein Problem. Geben Sie Ihre E-Mail-Adresse ein – wir senden Ihnen einen Link zum Zurücksetzen.",
    back: "Zurück zur Anmeldung",
  },
  en: {
    metaTitle: "Customer portal – Forgot password",
    title: "Forgot your password?",
    description: "No problem. Enter your email address – we'll send you a link to reset it.",
    back: "Back to sign-in",
  },
});

export async function generateMetadata(): Promise<Metadata> {
  return { title: messages[await getLocale()].metaTitle };
}

export default async function ForgotPasswordPage() {
  const t = messages[await getLocale()];
  return (
    <AuthShell
      title={t.title}
      description={t.description}
      footer={
        <Link href={routes.portalLogin} className="font-semibold text-accent-ink underline underline-offset-4">
          {t.back}
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
