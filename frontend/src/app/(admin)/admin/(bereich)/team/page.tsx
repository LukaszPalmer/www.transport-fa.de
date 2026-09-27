import { PERMISSION_INFO, type AdminUserRow } from "@fa/shared";
import type { Metadata } from "next";
import { requireStaff } from "@/lib/admin-session";
import { apiServer } from "@/lib/api/server";
import { OwnPasswordForm } from "@/components/admin/team/OwnPasswordForm";
import { StaffManager } from "@/components/admin/team/StaffManager";
import { AdminPage, Card } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Team & Zugang" };

export default async function AdminTeamPage() {
  const me = await requireStaff();
  const isAdmin = me.user.role === "ADMIN";
  const staff = isAdmin ? await apiServer<{ users: AdminUserRow[] }>("/admin/users?role=STAFF&limit=100") : null;

  return (
    <AdminPage
      title={isAdmin ? "Team & Zugang" : "Mein Zugang"}
      description={isAdmin ? "Mitarbeiter anlegen, Rechte vergeben, Zugänge sperren, 2FA zurücksetzen oder Mitarbeiter endgültig löschen." : "Ihre Rechte und Ihr Passwort."}
    >
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {staff && (
          <Card title="Mitarbeiter" description="Administratoren haben alle Rechte. Mitarbeiter erhalten Rechte einzeln." className="xl:col-span-3">
            <StaffManager staff={staff.users} selfId={me.user.id} />
          </Card>
        )}
        <Card title="Mein Zugang">
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Name</dt>
              <dd className="font-semibold text-primary">{me.staff.displayName}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">E-Mail</dt>
              <dd className="truncate font-semibold text-primary">{me.user.email}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Rolle</dt>
              <dd className="font-semibold text-primary">{isAdmin ? "Administrator" : "Mitarbeiter"}</dd>
            </div>
          </dl>
          <p className="mt-5 mb-2 text-sm font-semibold text-primary">Rechte</p>
          <ul className="space-y-1.5 text-sm text-slate-600">
            {me.staff.permissions.map((permission) => (
              <li key={permission}>✓ {PERMISSION_INFO[permission].label}</li>
            ))}
            {me.staff.permissions.length === 0 && <li>Keine besonderen Rechte.</li>}
          </ul>
        </Card>
        <Card title="Passwort ändern" description="Die Zwei-Faktor-Authentifizierung bleibt bestehen." className="xl:col-span-2">
          <OwnPasswordForm />
        </Card>
      </div>
    </AdminPage>
  );
}
