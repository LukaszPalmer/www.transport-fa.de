import type { Metadata } from "next";
import Link from "next/link";
import { routes } from "@/content/navigation";
import { AuthShell } from "@/components/portal/AuthShell";
import { AuthAlert } from "@/components/portal/auth-fields";
import { ResetPasswordForm } from "@/components/portal/PasswordResetForms";

export const metadata: Metadata = { title: "Kundenportal – Neues Passwort" };

/** Ziel des Links aus der Reset-E-Mail. Die API prüft den Token beim Speichern (einmalig, 60 Min.). */
export default async function ResetPasswordPage({ searchParams }: PageProps<"/kundenportal/passwort-zuruecksetzen">) {
  const { token } = await searchParams;
  const validToken = typeof token === "string" && token.length >= 20 ? token : undefined;

  return (
    <AuthShell
      title="Neues Passwort festlegen"
      description="Wählen Sie ein sicheres Passwort mit mindestens 10 Zeichen."
      footer={
        <Link href={routes.portalLogin} className="font-semibold text-accent-ink underline underline-offset-4">
          Zurück zur Anmeldung
        </Link>
      }
    >
      {validToken ? (
        <ResetPasswordForm token={validToken} />
      ) : (
        <div className="space-y-5">
          <AuthAlert tone="error">Dieser Link ist ungültig oder abgelaufen. Bitte fordern Sie einen neuen an.</AuthAlert>
          <Link href={routes.portalForgot} className="block text-center font-semibold text-accent-ink underline underline-offset-4">
            Neuen Link anfordern
          </Link>
        </div>
      )}
    </AuthShell>
  );
}
