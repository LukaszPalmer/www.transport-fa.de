import type { AdminInvoiceDraft, InvoiceEditorContext } from "@fa/shared";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { routes } from "@/content/navigation";
import { can, requireStaff } from "@/lib/admin-session";
import { ApiError } from "@/lib/api/errors";
import { apiServer } from "@/lib/api/server";
import { InvoiceEditor } from "@/components/admin/invoices/editor/InvoiceEditor";
import { AdminPage, NoAccess } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Rechnungsentwurf" };

/** Gespeicherten Rechnungsentwurf weiterbearbeiten, ansehen und versenden. */
export default async function InvoiceDraftPage({ params }: PageProps<"/admin/invoices/drafts/[id]">) {
  const me = await requireStaff();
  if (!can(me, "can_manage_invoices")) return <NoAccess />;
  const { id } = await params;

  let draft: AdminInvoiceDraft;
  try {
    draft = await apiServer<AdminInvoiceDraft>(`/admin/invoices/drafts/${id}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
  const context = await apiServer<InvoiceEditorContext>(`/admin/invoices/drafts/context?customerId=${draft.customer.id}`).catch(() => undefined);

  return (
    <AdminPage
      title="Rechnungsentwurf"
      description={`${draft.customer.name} · ${draft.customer.customerNumber} – nur im Admin-Bereich sichtbar, bis Sie die Rechnung senden.`}
      actions={
        <Link href={routes.adminInvoices} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-primary">
          <ArrowLeft aria-hidden="true" className="size-4" /> Alle Rechnungen
        </Link>
      }
    >
      <InvoiceEditor draft={draft} initialContext={context} />
    </AdminPage>
  );
}
