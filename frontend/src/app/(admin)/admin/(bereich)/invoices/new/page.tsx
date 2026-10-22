import type { InvoiceEditorContext } from "@fa/shared";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { routes } from "@/content/navigation";
import { can, requireStaff } from "@/lib/admin-session";
import { ApiError } from "@/lib/api/errors";
import { apiServer } from "@/lib/api/server";
import { InvoiceEditor } from "@/components/admin/invoices/editor/InvoiceEditor";
import { AdminPage, NoAccess } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Neue Rechnung" };

const OBJECT_ID = /^[a-f0-9]{24}$/;

/** Neue E-Rechnung – optional vorbelegt mit Kunde (?kunde=) und Auftrag (?auftrag=). */
export default async function NewInvoicePage({ searchParams }: PageProps<"/admin/invoices/new">) {
  const me = await requireStaff();
  if (!can(me, "can_manage_invoices")) return <NoAccess />;

  const params = await searchParams;
  const customerId = typeof params.kunde === "string" && OBJECT_ID.test(params.kunde) ? params.kunde : undefined;
  const shipmentId = typeof params.auftrag === "string" && OBJECT_ID.test(params.auftrag) ? params.auftrag : undefined;

  let context: InvoiceEditorContext | undefined;
  if (customerId) {
    try {
      context = await apiServer<InvoiceEditorContext>(`/admin/invoices/drafts/context?customerId=${customerId}`);
    } catch (error) {
      if (!(error instanceof ApiError && error.status === 404)) throw error;
    }
  }

  return (
    <AdminPage
      title="Neue Rechnung"
      description="E-Rechnung nach EN 16931 erstellen – als PDF druckbar, herunterladbar und von Buchhaltungsprogrammen lesbar. Beim Versand geht sie per E-Mail an den Kunden und erscheint in seinem Kundenportal."
      actions={
        <Link href={routes.adminInvoices} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-primary">
          <ArrowLeft aria-hidden="true" className="size-4" /> Alle Rechnungen
        </Link>
      }
    >
      <InvoiceEditor
        initialContext={context}
        presetShipmentId={context?.shipments.some((shipment) => shipment.id === shipmentId) ? shipmentId : undefined}
        allowCreateCustomer={can(me, "can_edit_customers")}
      />
    </AdminPage>
  );
}
