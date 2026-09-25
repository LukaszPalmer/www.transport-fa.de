import type { Metadata } from "next";
import Link from "next/link";
import { routes } from "@/content/navigation";
import { AuthShell } from "@/components/portal/AuthShell";
import { ForgotPasswordForm } from "@/components/portal/PasswordResetForms";

export const metadata: Metadata = { title: "Kundenportal – Passwort vergessen" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Passwort vergessen?"
      description="Kein Problem. Geben Sie Ihre E-Mail-Adresse ein – wir senden Ihnen einen Link zum Zurücksetzen."
      footer={
        <Link href={routes.portalLogin} className="font-semibold text-accent-ink underline underline-offset-4">
          Zurück zur Anmeldung
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
