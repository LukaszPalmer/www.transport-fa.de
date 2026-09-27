import { LEAD_STATUS_INFO, type AdminCustomerDetail, type StaffOption } from "@fa/shared";
import { ArrowLeft, Download, Eye, FilePlus2, Lock, MessagesSquare } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { routes } from "@/content/navigation";
import { can, requireStaff } from "@/lib/admin-session";
import { formatRelative, leadStatusTone, leadTopicLabel } from "@/lib/admin-format";
import { adminDocumentUrl } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { apiServer } from "@/lib/api/server";
import { documentCategoryLabel, formatDate, formatDateTime, formatFileSize } from "@/lib/portal-format";
import { CredentialsForm } from "@/components/admin/CredentialsForm";
import { CustomerCrmForm } from "@/components/admin/customers/CustomerCrmCard";
import { EditCustomerProfileButton } from "@/components/admin/customers/CustomerProfileDialog";
import { LiveOnlineStatus } from "@/components/admin/customers/CustomerTable";
import { InvoiceTable } from "@/components/admin/invoices/InvoiceTable";
import { SendInvoiceButton } from "@/components/admin/invoices/SendInvoiceDialog";
import { CreateShipmentButton } from "@/components/admin/orders/CreateShipmentDialog";
import { ShipmentTable } from "@/components/admin/orders/ShipmentTable";
import { AdminPage, Card, NoAccess, tableClasses } from "@/components/admin/ui";
import { formatAddress } from "@/lib/address";
import { buttonClasses } from "@/components/ui/button-styles";
import { StatusBadge } from "@/components/portal/dashboard/ui";

export const metadata: Metadata = { title: "Kundenakte" };

const CHAT_STATUS: Record<string, string> = { OPEN: "Offen", IN_PROGRESS: "In Bearbeitung", RESOLVED: "Beendet" };

/** 360°-Akte: Stammdaten, Konto & Zugangsdaten, alle Aufträge, Dokumente und Chats. */
export default async function AdminCustomerPage({ params }: PageProps<"/admin/users/[id]">) {
  const me = await requireStaff();
  if (!can(me, "can_view_customers")) return <NoAccess />;
  const { id } = await params;

  let detail: AdminCustomerDetail;
  let staff: StaffOption[];
  try {
    [detail, staff] = await Promise.all([apiServer<AdminCustomerDetail>(`/admin/customers/${id}`), apiServer<StaffOption[]>("/admin/staff-options")]);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
  const { customer, user, shipments, documents, invoices, chats } = detail;
  const displayName = customer.companyName || `${customer.firstName} ${customer.lastName}`;
  const presetCustomer = { id: customer.id, name: displayName, customerNumber: customer.customerNumber, billingAddress: customer.billingAddress };

  return (
    <AdminPage
      title={displayName}
      description={`Kundennummer ${customer.customerNumber} · Kunde seit ${formatDate(customer.createdAt)}`}
      actions={
        <>
          <Link href={routes.adminUsers} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-primary">
            <ArrowLeft aria-hidden="true" className="size-4" /> Alle Kunden
          </Link>
          {can(me, "can_manage_orders") && <CreateShipmentButton presetCustomer={presetCustomer} />}
        </>
      }
    >
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card title="Kontakt & Konto" action={can(me, "can_edit_customers") ? <EditCustomerProfileButton customer={customer} /> : undefined}>
          <div className="mb-5">
            <LiveOnlineStatus userId={user.id} online={detail.online} lastSeenAt={user.lastSeenAt} />
          </div>
          <dl className="space-y-3 text-sm">
            <Row label="Name" value={`${customer.firstName} ${customer.lastName}`} />
            {customer.companyName && <Row label="Firma" value={customer.companyName} />}
            <Row label="Kundentyp" value={customer.type === "BUSINESS" ? "Geschäftskunde" : "Privatkunde"} />
            {customer.billingAddress ? (
              <Row label="Anschrift" value={formatAddress(customer.billingAddress)} />
            ) : (
              <Row label="Anschrift" value="fehlt" note="für Rechnungen nötig – bitte ergänzen" warn />
            )}
            {customer.vatId && <Row label="USt-IdNr." value={customer.vatId} />}
            <Row label="E-Mail" value={user.email} note={user.emailVerified ? "bestätigt" : "nicht bestätigt"} warn={!user.emailVerified} />
            <Row label="Telefon" value={customer.phone ?? "–"} href={customer.phone ? `tel:${customer.phone}` : undefined} />
            <Row label="Anmeldung" value={[user.hasPassword && "Passwort", user.googleLinked && "Google"].filter(Boolean).join(" + ") || "–"} />
            <Row label="Sprache" value={customer.locale === "en" ? "Englisch" : "Deutsch"} note={customer.locale === "en" ? "E-Mails auf Englisch" : undefined} />
            <Row label="Letzte Anmeldung" value={user.lastLoginAt ? formatRelative(user.lastLoginAt) : "–"} />
            <Row label="Konto" value={user.state === "ACTIVE" ? "Aktiv" : "Gesperrt"} warn={user.state !== "ACTIVE"} />
          </dl>
        </Card>

        <Card title="Zugangsdaten" description="E-Mail oder Passwort neu setzen – wirkt sofort." className="xl:col-span-2">
          {can(me, "can_edit_credentials") ? (
            <CredentialsForm userId={user.id} currentEmail={user.email} />
          ) : (
            <p className="flex items-center gap-2 text-sm text-slate-500">
              <Lock aria-hidden="true" className="size-4" /> Dafür fehlt Ihnen das Recht „Zugangsdaten ändern“.
            </p>
          )}
        </Card>

        <Card title="Betreuung & Notizen" description="Intern – der Kunde sieht diese Angaben nicht." className="xl:col-span-2">
          <CustomerCrmForm customerId={customer.id} crm={detail.crm} staff={staff} />
        </Card>

        <Card title={`Anfragen (${detail.crm.leads.length})`} description="Verknüpfte Anfragen aus dem CRM.">
          {detail.crm.leads.length === 0 ? (
            <p className="text-sm text-slate-500">Keine verknüpften Anfragen.</p>
          ) : (
            <ul className="space-y-2">
              {detail.crm.leads.map((lead) => (
                <li key={lead.id}>
                  <Link href={`${routes.adminLeads}/${lead.id}`} className="flex items-center justify-between gap-3 rounded-xl p-3 ring-1 ring-slate-100 hover:bg-surface">
                    <span className="text-sm">
                      <span className="block font-semibold text-primary">{lead.number}</span>
                      <span className="text-xs text-slate-500">
                        {leadTopicLabel(lead.topic)} · {formatDate(lead.createdAt)}
                      </span>
                    </span>
                    <StatusBadge tone={leadStatusTone[lead.status]}>{LEAD_STATUS_INFO[lead.status].label}</StatusBadge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title={`Aufträge (${shipments.length})`} className="xl:col-span-3">
          <ShipmentTable
            shipments={shipments}
            hideCustomer
            canManageOrders={can(me, "can_manage_orders")}
            canManageDrivers={can(me, "can_manage_drivers")}
            canManageInvoices={can(me, "can_manage_invoices")}
            emptyText="Noch keine Aufträge."
          />
        </Card>

        {can(me, "can_manage_invoices") && (
          <Card
            title={`Rechnungen & Belege (${invoices.length})`}
            description="Angebote, Auftragsbestätigungen und Rechnungen, die dieser Kunde im Portal sieht."
            action={
              <div className="flex flex-wrap gap-2">
                <SendInvoiceButton presetCustomer={presetCustomer} />
                <Link href={`${routes.adminInvoiceNew}?kunde=${customer.id}`} className={buttonClasses({ variant: "dark", size: "sm" })}>
                  <FilePlus2 aria-hidden="true" className="size-4" /> Rechnung erstellen
                </Link>
              </div>
            }
            className="xl:col-span-3"
          >
            <InvoiceTable invoices={invoices} hideCustomer emptyText="Noch keine Belege gesendet." />
          </Card>
        )}

        <Card title={`Dokumente (${documents.length})`} className="xl:col-span-2">
          {!can(me, "can_view_documents") ? (
            <p className="flex items-center gap-2 text-sm text-slate-500">
              <Lock aria-hidden="true" className="size-4" /> Dafür fehlt Ihnen das Recht „Dokumente einsehen“.
            </p>
          ) : documents.length === 0 ? (
            <p className="text-sm text-slate-500">Keine Dokumente.</p>
          ) : (
            <div className={tableClasses.wrapper}>
              <table className="w-full min-w-[36rem] text-left text-sm">
                <tbody>
                  {documents.map((document) => (
                    <tr key={document.id} className={tableClasses.row}>
                      <td className={tableClasses.td}>
                        <p className="font-semibold text-primary">{document.title}</p>
                        <p className="text-xs text-slate-500">
                          {documentCategoryLabel[document.category]} · {formatFileSize(document.sizeBytes)} · {formatDate(document.createdAt)}
                          {document.shipmentNumber && ` · ${document.shipmentNumber}`}
                        </p>
                      </td>
                      <td className={tableClasses.td}>
                        <div className="flex flex-wrap gap-1.5">
                          <StatusBadge tone={document.source === "CUSTOMER" ? "info" : "neutral"}>{document.source === "CUSTOMER" ? "vom Kunden" : "vom Büro"}</StatusBadge>
                          {document.visibility === "INTERNAL" && <StatusBadge tone="warning">intern</StatusBadge>}
                          {document.handToDriver && <StatusBadge tone="progress">für Fahrer</StatusBadge>}
                        </div>
                      </td>
                      <td className={`${tableClasses.td} text-right whitespace-nowrap`}>
                        <a href={adminDocumentUrl(document.id, "view")} target="_blank" rel="noopener" className="inline-flex items-center gap-1 rounded-lg px-2 py-1 font-semibold text-accent-ink hover:bg-surface">
                          <Eye aria-hidden="true" className="size-4" /> Ansehen
                        </a>
                        <a href={adminDocumentUrl(document.id, "download")} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 font-semibold text-accent-ink hover:bg-surface">
                          <Download aria-hidden="true" className="size-4" /> Laden
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card title="Chats" description="Beendete Chats werden nach 24 Stunden gelöscht.">
          {chats.length === 0 ? (
            <p className="text-sm text-slate-500">Keine Unterhaltungen.</p>
          ) : (
            <ul className="space-y-3">
              {chats.map((chat) => (
                <li key={chat.id}>
                  <Link
                    href={can(me, "can_chat") ? `${routes.adminChat}?chat=${chat.id}` : "#"}
                    className="block rounded-xl p-3 ring-1 ring-slate-100 transition-colors hover:bg-surface"
                  >
                    <p className="flex items-center justify-between gap-2 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        <MessagesSquare aria-hidden="true" className="size-3.5" />
                        {formatDateTime(chat.lastMessageAt)}
                      </span>
                      <span className="font-semibold">{CHAT_STATUS[chat.status] ?? chat.status}</span>
                    </p>
                    <p className="mt-1 truncate text-sm text-primary">{chat.preview || "–"}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </AdminPage>
  );
}

function Row({ label, value, note, warn, href }: { label: string; value: string; note?: string; warn?: boolean; href?: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
      <dt className="text-slate-500">{label}</dt>
      <dd className="min-w-0 text-right">
        {href ? (
          <a href={href} className="font-semibold text-primary hover:text-accent-ink">
            {value}
          </a>
        ) : (
          <span className={warn ? "font-semibold text-amber-700" : "font-semibold break-all text-primary"}>{value}</span>
        )}
        {note && <span className={warn ? "block text-xs font-semibold text-amber-700" : "block text-xs text-emerald-700"}>{note}</span>}
      </dd>
    </div>
  );
}
