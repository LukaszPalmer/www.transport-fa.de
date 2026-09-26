import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { routes } from "@/content/navigation";
import { getAuthProviders, getMe, isCustomerSession, safeRedirectPath } from "@/lib/session";
import { AuthShell } from "@/components/portal/AuthShell";
import { LoginForm } from "@/components/portal/LoginForm";

export const metadata: Metadata = { title: "Kundenportal – Anmelden" };

const notices: Record<string, { tone: "error" | "success" | "info"; text: string }> = {
  abgemeldet: { tone: "success", text: "Sie wurden erfolgreich abgemeldet." },
  geloescht: { tone: "success", text: "Ihr Konto wurde gelöscht – alle Ihre Daten wurden aus dem Portal entfernt. Eine Bestätigung ist per E-Mail unterwegs." },
  google: { tone: "error", text: "Die Anmeldung mit Google wurde abgebrochen oder ist fehlgeschlagen. Bitte versuchen Sie es erneut." },
  gesperrt: { tone: "error", text: "Dieses Konto ist deaktiviert. Bitte wenden Sie sich an uns." },
  "kein-kundenkonto": {
    tone: "info",
    text: "Sie sind gerade mit einem Konto ohne Kundenzugang angemeldet (z. B. Admin). Bitte melden Sie sich mit Ihrem Kundenkonto an.",
  },
  sitzung: { tone: "info", text: "Bitte melden Sie sich an, um fortzufahren." },
};

export default async function LoginPage({ searchParams }: PageProps<"/kundenportal/anmelden">) {
  const params = await searchParams;
  const redirectTo = safeRedirectPath(params.weiter, routes.portal);

  if (isCustomerSession(await getMe())) redirect(redirectTo);
  const { google } = await getAuthProviders();

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
      title="Willkommen zurück"
      description="Melden Sie sich an, um Ihre Aufträge, Termine und Dokumente einzusehen."
      footer={
        <>
          Noch kein Konto?{" "}
          <Link href={routes.portalRegister} className="font-semibold text-accent-ink underline underline-offset-4">
            Jetzt registrieren
          </Link>
        </>
      }
    >
      <LoginForm googleEnabled={google} redirectTo={redirectTo} notice={noticeKey ? notices[noticeKey] : undefined} />
    </AuthShell>
  );
}
