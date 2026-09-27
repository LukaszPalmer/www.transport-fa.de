import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { routes } from "@/content/navigation";
import { defineMessages } from "@/i18n/config";
import { getLocale } from "@/i18n/server";
import { getAuthProviders, getMe, isCustomerSession } from "@/lib/session";
import { AuthShell } from "@/components/portal/AuthShell";
import { RegisterForm } from "@/components/portal/RegisterForm";

const messages = defineMessages({
  de: {
    metaTitle: "Kundenportal – Konto erstellen",
    title: "Konto erstellen",
    description: "In einer Minute registriert – danach sehen Sie alle Aufträge und Dokumente an einem Ort.",
    registered: "Bereits registriert?",
    signIn: "Anmelden",
  },
  en: {
    metaTitle: "Customer portal – Create account",
    title: "Create account",
    description: "Registered in a minute – then you'll see all your jobs and documents in one place.",
    registered: "Already registered?",
    signIn: "Sign in",
  },
});

export async function generateMetadata(): Promise<Metadata> {
  return { title: messages[await getLocale()].metaTitle };
}

export default async function RegisterPage() {
  if (isCustomerSession(await getMe())) redirect(routes.portal);
  const [{ google }, locale] = await Promise.all([getAuthProviders(), getLocale()]);
  const t = messages[locale];

  return (
    <AuthShell
      title={t.title}
      description={t.description}
      footer={
        <>
          {t.registered}{" "}
          <Link href={routes.portalLogin} className="font-semibold text-accent-ink underline underline-offset-4">
            {t.signIn}
          </Link>
        </>
      }
    >
      <RegisterForm googleEnabled={google} />
    </AuthShell>
  );
}
