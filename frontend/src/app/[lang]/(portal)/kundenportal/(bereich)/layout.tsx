import type { ReactNode } from "react";
import { getMe } from "@/lib/session";
import { PortalShell } from "@/components/portal/PortalShell";

/**
 * Rahmen der angemeldeten Bereiche. Holt den Nutzer nur für die Kopfzeile
 * (per cache() ohne Doppelabfrage) – die Zugriffsprüfung machen die Seiten selbst.
 */
export default async function PortalAreaLayout({ children }: { children: ReactNode }) {
  const me = await getMe();
  return <PortalShell me={me}>{children}</PortalShell>;
}
