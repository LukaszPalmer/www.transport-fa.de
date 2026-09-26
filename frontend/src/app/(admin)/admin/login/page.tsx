import type { MfaStatus } from "@fa/shared";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { routes } from "@/content/navigation";
import { ApiError } from "@/lib/api/errors";
import { apiServer } from "@/lib/api/server";
import { AdminLoginFlow, type LoginStep } from "@/components/admin/AdminLoginFlow";
import { Logo } from "@/components/ui/Logo";

export const metadata: Metadata = { title: "Anmeldung" };

/** Wo steht die aktuelle Sitzung? Bestimmt den Einstiegsschritt der Anmeldung. */
async function initialStep(): Promise<LoginStep> {
  try {
    const status = await apiServer<MfaStatus>("/auth/mfa/status");
    if (status.enabled && status.verified) redirect(routes.admin);
    return status.enabled ? "code" : "setup";
  } catch (error) {
    if (error instanceof ApiError) return "credentials"; // nicht angemeldet oder kein Mitarbeiterkonto
    throw error;
  }
}

export default async function AdminLoginPage({ searchParams }: PageProps<"/admin/login">) {
  const { fehler } = await searchParams;
  const step = await initialStep();

  return (
    <div className="relative isolate flex min-h-dvh flex-1 items-center justify-center bg-primary px-4 py-12">
      <div aria-hidden="true" className="bg-grid absolute inset-0 -z-10 opacity-60 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Logo />
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Admin-Bereich</p>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
          <AdminLoginFlow initialStep={step} noAccess={fehler === "kein-zugang"} />
        </div>
        <p className="mt-6 text-center text-xs text-slate-400">Zugang nur für Mitarbeiter · Anmeldung mit Zwei-Faktor-Authentifizierung</p>
      </div>
    </div>
  );
}
