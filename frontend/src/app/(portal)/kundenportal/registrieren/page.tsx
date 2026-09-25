import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { routes } from "@/content/navigation";
import { getAuthProviders, getMe } from "@/lib/session";
import { AuthShell } from "@/components/portal/AuthShell";
import { RegisterForm } from "@/components/portal/RegisterForm";

export const metadata: Metadata = { title: "Kundenportal – Konto erstellen" };

export default async function RegisterPage() {
  if (await getMe()) redirect(routes.portal);
  const { google } = await getAuthProviders();

  return (
    <AuthShell
      title="Konto erstellen"
      description="In einer Minute registriert – danach sehen Sie alle Aufträge und Dokumente an einem Ort."
      footer={
        <>
          Bereits registriert?{" "}
          <Link href={routes.portalLogin} className="font-semibold text-accent-ink underline underline-offset-4">
            Anmelden
          </Link>
        </>
      }
    >
      <RegisterForm googleEnabled={google} />
    </AuthShell>
  );
}
