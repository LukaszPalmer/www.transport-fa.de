import { LEAD_SOURCE_LABEL, LEAD_STATUS_INFO, type AdminLeadDetail, type StaffOption } from "@fa/shared";
import { ArrowLeft, FilePlus2, Mail, Phone, UserRound } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { company } from "@/content/company";
import { routes } from "@/content/navigation";
import { can, requireStaff } from "@/lib/admin-session";
import { leadStatusTone, leadTopicLabel } from "@/lib/admin-format";
import { ApiError } from "@/lib/api/errors";
import { apiServer } from "@/lib/api/server";
import { formatDate, formatDateTime } from "@/lib/portal-format";
import { LeadEditor, LeadNotes } from "@/components/admin/leads/LeadEditor";
import { CreateShipmentButton } from "@/components/admin/orders/CreateShipmentDialog";
import { AdminPage, Card, NoAccess } from "@/components/admin/ui";
import { StatusBadge } from "@/components/portal/dashboard/ui";
import { buttonClasses } from "@/components/ui/button-styles";

export const metadata: Metadata = { title: "Anfrage" };

export default async function AdminLeadPage({ params }: PageProps<"/admin/leads/[id]">) {
  const me = await requireStaff();
  if (!can(me, "can_manage_leads")) return <NoAccess />;
  const { id } = await params;

  let lead: AdminLeadDetail;
  let staff: StaffOption[];
  try {
    [lead, staff] = await Promise.all([apiServer<AdminLeadDetail>(`/admin/leads/${id}`), apiServer<StaffOption[]>("/admin/staff-options")]);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const replySubject = encodeURIComponent(`Ihre Anfrage ${lead.number} bei ${company.name}`);
  const replyBody = encodeURIComponent(`Guten Tag ${lead.name},\n\nvielen Dank für Ihre Anfrage zum Thema „${leadTopicLabel(lead.topic)}“.\n\n`);

  return (
    <AdminPage
      title={lead.company ? `${lead.name} · ${lead.company}` : lead.name}
      description={`${lead.number} · ${LEAD_SOURCE_LABEL[lead.source]} · eingegangen ${formatDateTime(lead.createdAt)}`}
      actions={
        <>
          <Link href={routes.adminLeads} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-primary">
            <ArrowLeft aria-hidden="true" className="size-4" /> Alle Anfragen
          </Link>
          {lead.customer && can(me, "can_manage_orders") && <CreateShipmentButton presetCustomer={lead.customer} />}
          {lead.customer && can(me, "can_manage_invoices") && (
            <Link href={`${routes.adminInvoiceNew}?kunde=${lead.customer.id}`} className={buttonClasses({ variant: "outline", size: "sm" })}>
              <FilePlus2 aria-hidden="true" className="size-4" /> Rechnung
            </Link>
          )}
        </>
      }
    >
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6">
          <Card title="Kontakt">
            <div className="mb-4">
              <StatusBadge tone={leadStatusTone[lead.status]}>{LEAD_STATUS_INFO[lead.status].label}</StatusBadge>
              {lead.callback && <span className="ml-2 text-sm font-semibold text-amber-700">Rückruf gewünscht</span>}
            </div>
            <ul className="space-y-3 text-sm">
              {lead.phone && (
                <li className="flex items-center gap-2">
                  <Phone aria-hidden="true" className="size-4 text-accent-ink" />
                  <a href={`tel:${lead.phone.replace(/[^\d+]/g, "")}`} className="font-semibold text-primary hover:text-accent-ink">
                    {lead.phone}
                  </a>
                </li>
              )}
              {lead.email && (
                <li className="flex items-center gap-2">
                  <Mail aria-hidden="true" className="size-4 text-accent-ink" />
                  <a href={`mailto:${lead.email}?subject=${replySubject}&body=${replyBody}`} className="font-semibold break-all text-primary hover:text-accent-ink">
                    {lead.email}
                  </a>
                </li>
              )}
              {lead.customer && (
                <li className="flex items-center gap-2">
                  <UserRound aria-hidden="true" className="size-4 text-accent-ink" />
                  <Link href={`${routes.adminUsers}/${lead.customer.id}`} className="font-semibold text-primary hover:text-accent-ink">
                    {lead.customer.name} · {lead.customer.customerNumber}
                  </Link>
                </li>
              )}
            </ul>
            <p className="mt-5 text-xs text-slate-500">
              Sprache: {lead.locale === "en" ? "Englisch" : "Deutsch"}
              {lead.expiresAt && ` · automatische Löschung am ${formatDate(lead.expiresAt)}`}
            </p>
          </Card>

          <Card title="Anfrage">
            <dl className="space-y-3 text-sm">
              <Row label="Thema" value={leadTopicLabel(lead.topic)} />
              {lead.from && <Row label="Von / Objekt" value={lead.from} />}
              {lead.to && <Row label="Nach" value={lead.to} />}
              {lead.preferredDate && <Row label="Wunschtermin" value={lead.preferredDate} />}
            </dl>
            {lead.message && <p className="mt-4 rounded-xl bg-surface p-4 text-sm leading-relaxed whitespace-pre-line text-slate-700">{lead.message}</p>}
          </Card>
        </div>

        <div className="space-y-6 xl:col-span-2">
          <Card title="Bearbeitung" description="Status, Zuständigkeit und Wiedervorlage – fällige Wiedervorlagen erscheinen in der Übersicht.">
            <LeadEditor lead={lead} staff={staff} canDelete={me.user.role === "ADMIN"} canCreateCustomer={can(me, "can_edit_customers")} />
          </Card>
          <Card title={`Notizen (${lead.notes.length})`}>
            <LeadNotes leadId={lead.id} notes={lead.notes} />
          </Card>
        </div>
      </div>
    </AdminPage>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-semibold text-primary">{value}</dd>
    </div>
  );
}
