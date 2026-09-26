import type { ReactNode } from "react";
import { requireStaff } from "@/lib/admin-session";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminRealtimeProvider } from "@/components/admin/realtime/AdminRealtime";

/**
 * Geschützter Admin-Bereich: nur Mitarbeiter mit bestätigtem zweiten Faktor
 * (sonst Weiterleitung zur Anmeldung bzw. Code-Eingabe).
 */
export default async function AdminAreaLayout({ children }: { children: ReactNode }) {
  const me = await requireStaff();
  return (
    <AdminRealtimeProvider me={me}>
      <AdminShell me={me}>{children}</AdminShell>
    </AdminRealtimeProvider>
  );
}
