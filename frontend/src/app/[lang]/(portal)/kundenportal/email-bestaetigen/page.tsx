import type { Metadata } from "next";
import Link from "next/link";
import { routes } from "@/content/navigation";
import { defineMessages } from "@/i18n/config";
import { getLocale } from "@/i18n/server";
import { ConfirmEmailButton } from "@/components/portal/AccountActions";
import { AuthShell } from "@/components/portal/AuthShell";
import { AuthAlert } from "@/components/portal/auth-fields";

const messages = defineMessages({
  de: {
    metaTitle: "Kundenportal – E-Mail bestätigen",
    title: "E-Mail-Adresse bestätigen",
    description: "Ein Klick – danach steht Ihnen das Kundenportal vollständig zur Verfügung.",
    toLogin: "Zur Anmeldung",
    incomplete:
      "Dieser Link ist unvollständig. Bitte öffnen Sie den Link aus der E-Mail erneut oder melden Sie sich an und fordern Sie einen neuen an.",
  },
  en: {
    metaTitle: "Customer portal – Confirm email",
    title: "Confirm your email address",
    description: "One click – then the customer portal is fully available to you.",
    toLogin: "Go to sign-in",
    incomplete: "This link is incomplete. Please open the link from the email again, or sign in and request a new one.",
  },
});

export async function generateMetadata(): Promise<Metadata> {
  return { title: messages[await getLocale()].metaTitle };
}

/**
 * Ziel des Links aus der Bestätigungs-E-Mail. Bestätigt wird erst per Klick:
 * Viele Mailsysteme öffnen Links automatisch zur Virenprüfung – ein automatisches
 * Einlösen würde den Einmal-Link sonst verbrauchen, bevor der Kunde ihn nutzt.
 */
export default async function VerifyEmailPage({ searchParams }: PageProps<"/[lang]/kundenportal/email-bestaetigen">) {
  const [{ token }, locale] = await Promise.all([searchParams, getLocale()]);
  const t = messages[locale];
  const validToken = typeof token === "string" && token.length >= 20 ? token : undefined;

  return (
    <AuthShell
      title={t.title}
      description={t.description}
      footer={
        <Link href={routes.portalLogin} className="font-semibold text-accent-ink underline underline-offset-4">
          {t.toLogin}
        </Link>
      }
    >
      {validToken ? <ConfirmEmailButton token={validToken} /> : <AuthAlert tone="error">{t.incomplete}</AuthAlert>}
    </AuthShell>
  );
}
