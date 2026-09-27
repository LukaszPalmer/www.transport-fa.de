import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { routes } from "@/content/navigation";
import { defineMessages } from "@/i18n/config";
import { getLocale } from "@/i18n/server";
import { getAuthProviders, getMe, isCustomerSession, safeRedirectPath } from "@/lib/session";
import { AuthShell } from "@/components/portal/AuthShell";
import { LoginForm } from "@/components/portal/LoginForm";

type Notice = { tone: "error" | "success" | "info"; text: string };

const messages = defineMessages({
  de: {
    metaTitle: "Kundenportal – Anmelden",
    title: "Willkommen zurück",
    description: "Melden Sie sich an, um Ihre Aufträge, Termine und Dokumente einzusehen.",
    noAccount: "Noch kein Konto?",
    register: "Jetzt registrieren",
    notices: {
      abgemeldet: { tone: "success", text: "Sie wurden erfolgreich abgemeldet." },
      geloescht: {
        tone: "success",
        text: "Ihr Konto wurde gelöscht – alle Ihre Daten wurden aus dem Portal entfernt. Eine Bestätigung ist per E-Mail unterwegs.",
      },
      google: { tone: "error", text: "Die Anmeldung mit Google wurde abgebrochen oder ist fehlgeschlagen. Bitte versuchen Sie es erneut." },
      gesperrt: { tone: "error", text: "Dieses Konto ist deaktiviert. Bitte wenden Sie sich an uns." },
      "kein-kundenkonto": {
        tone: "info",
        text: "Sie sind gerade mit einem Konto ohne Kundenzugang angemeldet (z. B. Admin). Bitte melden Sie sich mit Ihrem Kundenkonto an.",
      },
      sitzung: { tone: "info", text: "Bitte melden Sie sich an, um fortzufahren." },
    } as Record<string, Notice>,
  },
  en: {
    metaTitle: "Customer portal – Sign in",
    title: "Welcome back",
    description: "Sign in to view your jobs, dates and documents.",
    noAccount: "No account yet?",
    register: "Register now",
    notices: {
      abgemeldet: { tone: "success", text: "You have been signed out successfully." },
      geloescht: {
        tone: "success",
        text: "Your account has been deleted – all your data has been removed from the portal. A confirmation is on its way by email.",
      },
      google: { tone: "error", text: "Signing in with Google was cancelled or failed. Please try again." },
      gesperrt: { tone: "error", text: "This account has been deactivated. Please contact us." },
      "kein-kundenkonto": {
        tone: "info",
        text: "You are currently signed in with an account without customer access (e.g. admin). Please sign in with your customer account.",
      },
      sitzung: { tone: "info", text: "Please sign in to continue." },
    },
  },
});

export async function generateMetadata(): Promise<Metadata> {
  return { title: messages[await getLocale()].metaTitle };
}

export default async function LoginPage({ searchParams }: PageProps<"/[lang]/kundenportal/anmelden">) {
  const params = await searchParams;
  const redirectTo = safeRedirectPath(params.weiter, routes.portal);

  if (isCustomerSession(await getMe())) redirect(redirectTo);
  const [{ google }, locale] = await Promise.all([getAuthProviders(), getLocale()]);
  const t = messages[locale];

  const noticeKey = params.geloescht
    ? "geloescht"
    : params.abgemeldet
      ? "abgemeldet"
      : typeof params.fehler === "string"
        ? params.fehler
        : params.weiter
          ? "sitzung"
          : undefined;

  return (
    <AuthShell
      title={t.title}
      description={t.description}
      footer={
        <>
          {t.noAccount}{" "}
          <Link href={routes.portalRegister} className="font-semibold text-accent-ink underline underline-offset-4">
            {t.register}
          </Link>
        </>
      }
    >
      <LoginForm googleEnabled={google} redirectTo={redirectTo} notice={noticeKey ? t.notices[noticeKey] : undefined} />
    </AuthShell>
  );
}
