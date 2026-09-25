import type { Metadata } from "next";
import Link from "next/link";
import { routes } from "@/content/navigation";
import { ConfirmEmailButton } from "@/components/portal/AccountActions";
import { AuthShell } from "@/components/portal/AuthShell";
import { AuthAlert } from "@/components/portal/auth-fields";

export const metadata: Metadata = { title: "Kundenportal – E-Mail bestätigen" };

/**
 * Ziel des Links aus der Bestätigungs-E-Mail. Bestätigt wird erst per Klick:
 * Viele Mailsysteme öffnen Links automatisch zur Virenprüfung – ein automatisches
 * Einlösen würde den Einmal-Link sonst verbrauchen, bevor der Kunde ihn nutzt.
 */
export default async function VerifyEmailPage({ searchParams }: PageProps<"/kundenportal/email-bestaetigen">) {
  const { token } = await searchParams;
  const validToken = typeof token === "string" && token.length >= 20 ? token : undefined;

  return (
    <AuthShell
      title="E-Mail-Adresse bestätigen"
      description="Ein Klick – danach steht Ihnen das Kundenportal vollständig zur Verfügung."
      footer={
        <Link href={routes.portalLogin} className="font-semibold text-accent-ink underline underline-offset-4">
          Zur Anmeldung
        </Link>
      }
    >
      {validToken ? (
        <ConfirmEmailButton token={validToken} />
      ) : (
        <AuthAlert tone="error">
          Dieser Link ist unvollständig. Bitte öffnen Sie den Link aus der E-Mail erneut oder melden Sie sich an und fordern Sie einen
          neuen an.
        </AuthAlert>
      )}
    </AuthShell>
  );
}
