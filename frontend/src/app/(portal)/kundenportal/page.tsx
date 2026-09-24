import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { routes } from "@/content/navigation";
import { googleAuthEnabled } from "@/lib/auth";
import { getSession, safeRedirectPath } from "@/lib/session";
import { AuthShell } from "@/components/portal/AuthShell";
import { LoginForm } from "@/components/portal/LoginForm";

export const metadata: Metadata = { title: "Kundenportal – Anmelden" };

const notices: Record<string, { tone: "error" | "success" | "info"; text: string }> = {
  abgemeldet: { tone: "success", text: "Sie wurden erfolgreich abgemeldet." },
  google: { tone: "error", text: "Die Anmeldung mit Google wurde abgebrochen oder ist fehlgeschlagen. Bitte versuchen Sie es erneut." },
  sitzung: { tone: "info", text: "Bitte melden Sie sich an, um fortzufahren." },
};

export default async function LoginPage({ searchParams }: PageProps<"/kundenportal">) {
  const params = await searchParams;
  const redirectTo = safeRedirectPath(params.weiter, routes.portalAccount);

  if (await getSession()) redirect(redirectTo);

  const noticeKey = params.abgemeldet ? "abgemeldet" : typeof params.fehler === "string" ? params.fehler : params.weiter ? "sitzung" : undefined;

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
      <LoginForm googleEnabled={googleAuthEnabled} redirectTo={redirectTo} notice={noticeKey ? notices[noticeKey] : undefined} />
    </AuthShell>
  );
}
