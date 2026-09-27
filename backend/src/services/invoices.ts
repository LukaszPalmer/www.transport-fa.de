import {
  effectivePaymentStatus,
  hasPaymentStatus,
  UploadInvoiceFields,
  type AdminInvoiceRow,
  type AdminInvoiceStats,
  type AdminShipmentInvoice,
  type InvoiceItem,
  type InvoiceType,
  type Role,
} from "@fa/shared";
import mongoose, { Types, type QueryFilter } from "mongoose";
import { AppError } from "../http/errors";
import { berlinMonthStart, berlinYearStart } from "../lib/berlin-time";
import { CustomerProfile, DocumentModel, Invoice, InvoiceDraft, Shipment, type IInvoice } from "../models";
import type { PreparedUpload } from "./documents";

/**
 * Belege (Angebot, Auftragsbestätigung, Rechnung, Gutschrift): PDF aus der Buchhaltung
 * plus Eckdaten. Gemeinsame Bausteine für Admin-Liste, 360°-Akte und Kundenportal.
 */

export const INVOICE_TYPE_LABEL: Record<InvoiceType, string> = {
  INVOICE: "Rechnung",
  OFFER: "Angebot",
  ORDER_CONFIRMATION: "Auftragsbestätigung",
  CREDIT_NOTE: "Gutschrift",
};

/**
 * Kalendertag (JJJJ-MM-TT) als Zeitpunkt, der in deutscher Zeit immer denselben Tag zeigt.
 * Fälligkeiten gelten bis Tagesende – „überfällig“ also erst ab dem Folgetag.
 */
export function calendarDay(value: string, end = false): Date {
  return new Date(end ? `${value}T23:59:59.999+02:00` : `${value}T12:00:00Z`);
}

// --- Admin -------------------------------------------------------------------------------

type InvoiceLike = Pick<
  IInvoice,
  | "_id"
  | "type"
  | "number"
  | "customerId"
  | "shipmentId"
  | "documentId"
  | "netCents"
  | "vatCents"
  | "grossCents"
  | "issueDate"
  | "dueDate"
  | "validUntil"
  | "paymentStatus"
  | "paymentMethod"
  | "paidAt"
  | "source"
  | "emailedAt"
  | "emailedTo"
  | "createdAt"
> &
  Partial<Pick<IInvoice, "archivedCustomer" | "retainUntil" | "reminders">>;

/** Lädt Kunden, Aufträge und Dateinamen in je einer Abfrage und baut die Tabellenzeilen. */
export async function toAdminInvoiceRows(invoices: InvoiceLike[]): Promise<AdminInvoiceRow[]> {
  if (invoices.length === 0) return [];
  const customerIds = [...new Set(invoices.map((invoice) => String(invoice.customerId)))];
  const shipmentIds = [...new Set(invoices.flatMap((invoice) => (invoice.shipmentId ? [String(invoice.shipmentId)] : [])))];

  const [customers, shipments, documents] = await Promise.all([
    CustomerProfile.find({ _id: { $in: customerIds } }).select("customerNumber firstName lastName companyName").lean(),
    shipmentIds.length ? Shipment.find({ _id: { $in: shipmentIds } }).select("shipmentNumber").lean() : [],
    DocumentModel.find({ _id: { $in: invoices.map((invoice) => invoice.documentId) } }).select("storage.originalName").lean(),
  ]);
  const customerById = new Map(customers.map((customer) => [String(customer._id), customer]));
  const shipmentById = new Map(shipments.map((shipment) => [String(shipment._id), shipment]));
  const fileById = new Map(documents.map((document) => [String(document._id), document.storage.originalName]));

  return invoices.map((invoice) => {
    const customer = customerById.get(String(invoice.customerId));
    const archived = invoice.archivedCustomer;
    const shipment = invoice.shipmentId ? shipmentById.get(String(invoice.shipmentId)) : undefined;
    return {
      id: String(invoice._id),
      type: invoice.type,
      number: invoice.number,
      customer: customer
        ? { id: String(invoice.customerId), customerNumber: customer.customerNumber, name: customer.companyName || `${customer.firstName} ${customer.lastName}` }
        : {
            id: String(invoice.customerId),
            customerNumber: archived?.customerNumber ?? "–",
            name: archived ? archived.companyName || archived.name : "Gelöschter Kunde",
            deleted: true,
          },
      retainUntil: invoice.retainUntil?.toISOString(),
      shipment: shipment ? { id: String(shipment._id), shipmentNumber: shipment.shipmentNumber } : undefined,
      netCents: invoice.netCents,
      vatCents: invoice.vatCents,
      grossCents: invoice.grossCents,
      issueDate: invoice.issueDate.toISOString(),
      dueDate: invoice.dueDate?.toISOString(),
      validUntil: invoice.validUntil?.toISOString(),
      paymentStatus: effectivePaymentStatus(invoice.paymentStatus, invoice.dueDate),
      paymentMethod: invoice.paymentMethod,
      paidAt: invoice.paidAt?.toISOString(),
      fileName: fileById.get(String(invoice.documentId)) ?? `${invoice.number}.pdf`,
      source: invoice.source ?? "UPLOAD", // Belege von vor der Rechnungserstellung haben kein Feld
      emailedAt: invoice.emailedAt?.toISOString(),
      emailedTo: invoice.emailedTo,
      reminderLevel: invoice.reminders?.at(-1)?.level,
      lastReminderAt: invoice.reminders?.at(-1)?.sentAt.toISOString(),
      createdAt: invoice.createdAt.toISOString(),
    };
  });
}

/**
 * Rechnung je Auftrag für die Auftragsliste: die neueste nicht stornierte, sonst die neueste
 * stornierte – plus offene Entwürfe. Zwei Abfragen für die ganze Seite.
 */
export async function invoicesByShipment(shipmentIds: Types.ObjectId[]): Promise<{
  invoices: Map<string, AdminShipmentInvoice>;
  drafts: Map<string, string>;
}> {
  if (shipmentIds.length === 0) return { invoices: new Map(), drafts: new Map() };
  const [invoices, drafts] = await Promise.all([
    Invoice.find({ shipmentId: { $in: shipmentIds }, type: "INVOICE" })
      .sort({ issueDate: -1, createdAt: -1 })
      .select("shipmentId number grossCents paymentStatus paymentMethod paidAt dueDate")
      .lean(),
    InvoiceDraft.find({ shipmentId: { $in: shipmentIds } }).sort({ updatedAt: -1 }).select("shipmentId").lean(),
  ]);

  const byShipment = new Map<string, AdminShipmentInvoice>();
  for (const invoice of invoices) {
    const key = String(invoice.shipmentId);
    const current = byShipment.get(key);
    // Sortiert nach Datum: die erste gewinnt – außer sie ist storniert und es gibt eine gültige.
    if (current && (current.paymentStatus !== "CANCELLED" || invoice.paymentStatus === "CANCELLED")) continue;
    byShipment.set(key, {
      id: String(invoice._id),
      number: invoice.number,
      grossCents: invoice.grossCents,
      paymentStatus: effectivePaymentStatus(invoice.paymentStatus, invoice.dueDate) ?? "PENDING",
      paymentMethod: invoice.paymentMethod,
      paidAt: invoice.paidAt?.toISOString(),
    });
  }
  const draftByShipment = new Map<string, string>();
  for (const draft of drafts) if (!draftByShipment.has(String(draft.shipmentId))) draftByShipment.set(String(draft.shipmentId), String(draft._id));
  return { invoices: byShipment, drafts: draftByShipment };
}

/**
 * Kennzahlen über alle Rechnungen, die zum Filter passen (ohne Seitenbegrenzung).
 * Einnahmen zählen nach Zahlungsdatum – auch Rechnungen von Kunden, die ihr Konto gelöscht
 * haben, denn deren Belege bleiben für die Aufbewahrungsfrist erhalten.
 */
export async function invoiceStats(filter: QueryFilter<IInvoice> = {}): Promise<AdminInvoiceStats> {
  const now = new Date();
  const monthStart = berlinMonthStart(now);
  const yearStart = berlinYearStart(now);
  const paid = { $eq: ["$paymentStatus", "PAID"] };
  const pending = { $eq: ["$paymentStatus", "PENDING"] };
  const overdue = { $and: [pending, { $lt: ["$dueDate", now] }] };
  const paidSince = (start: Date) => ({ $and: [paid, { $gte: ["$paidAt", start] }] });
  const sumIf = (condition: unknown, field: string | number) => ({ $sum: { $cond: [condition, field, 0] } });

  const [result] = await Invoice.aggregate<AdminInvoiceStats>([
    { $match: { ...filter, type: "INVOICE" } },
    {
      $group: {
        _id: null,
        openCount: sumIf(pending, 1),
        openGrossCents: sumIf(pending, "$grossCents"),
        overdueCount: sumIf(overdue, 1),
        overdueGrossCents: sumIf(overdue, "$grossCents"),
        paidThisMonthGrossCents: sumIf(paidSince(monthStart), "$grossCents"),
        paidThisMonthNetCents: sumIf(paidSince(monthStart), "$netCents"),
        paidThisMonthCount: sumIf(paidSince(monthStart), 1),
        paidThisYearGrossCents: sumIf(paidSince(yearStart), "$grossCents"),
        paidThisYearNetCents: sumIf(paidSince(yearStart), "$netCents"),
        paidTotalGrossCents: sumIf(paid, "$grossCents"),
        paidTotalNetCents: sumIf(paid, "$netCents"),
      },
    },
  ]);
  return {
    openCount: result?.openCount ?? 0,
    openGrossCents: result?.openGrossCents ?? 0,
    overdueCount: result?.overdueCount ?? 0,
    overdueGrossCents: result?.overdueGrossCents ?? 0,
    paidThisMonthGrossCents: result?.paidThisMonthGrossCents ?? 0,
    paidThisMonthNetCents: result?.paidThisMonthNetCents ?? 0,
    paidThisMonthCount: result?.paidThisMonthCount ?? 0,
    paidThisYearGrossCents: result?.paidThisYearGrossCents ?? 0,
    paidThisYearNetCents: result?.paidThisYearNetCents ?? 0,
    paidTotalGrossCents: result?.paidTotalGrossCents ?? 0,
    paidTotalNetCents: result?.paidTotalNetCents ?? 0,
  };
}

/**
 * Beleg-Upload aus dem Admin: prüft alle Felder, bevor die PDF angenommen wird, und legt
 * nach dem Speichern den Beleg an. Ist die Nummer doch schon vergeben, räumt der Upload auf.
 */
export async function prepareInvoiceUpload(
  fields: Record<string, string>,
  staff: { userId: Types.ObjectId; role: Role },
): Promise<PreparedUpload<{ invoice: IInvoice; notify: boolean }>> {
  const input = UploadInvoiceFields.parse(fields); // ZodError → 422 mit Feldfehlern
  const numberTaken = () => AppError.validation({ number: `Diese Nummer ist für eine ${INVOICE_TYPE_LABEL[input.type]} bereits vergeben.` });

  const customer = await CustomerProfile.findById(input.customerId).select("_id").lean();
  if (!customer) throw AppError.validation({ customerId: "Kunde nicht gefunden." });
  if (input.shipmentId && !(await Shipment.exists({ _id: input.shipmentId, customerId: customer._id }))) {
    throw AppError.validation({ shipmentId: "Dieser Auftrag gehört zu einem anderen Kunden." });
  }
  if (await Invoice.exists({ type: input.type, number: input.number })) throw numberTaken();

  const shipmentId = input.shipmentId ? new Types.ObjectId(input.shipmentId) : undefined;
  const paid = hasPaymentStatus(input.type) && input.paidWith !== undefined;

  return {
    customerId: customer._id,
    document: {
      category: input.type,
      title: `${INVOICE_TYPE_LABEL[input.type]} ${input.number}`,
      visibility: "CUSTOMER",
      uploadedById: staff.userId,
      uploadedByRole: staff.role,
      handToDriver: false,
      shipmentId,
    },
    accept: { types: ["application/pdf"], message: "Bitte laden Sie den Beleg als PDF hoch – so, wie er aus der Buchhaltung kommt." },
    finalize: async (document) => {
      try {
        const invoice = await Invoice.create({
          type: input.type,
          number: input.number,
          customerId: customer._id,
          shipmentId,
          documentId: document._id,
          netCents: input.netCents,
          vatCents: input.vatCents,
          grossCents: input.netCents + input.vatCents,
          issueDate: calendarDay(input.issueDate),
          dueDate: input.dueDate && input.type === "INVOICE" ? calendarDay(input.dueDate, true) : undefined,
          validUntil: input.validUntil && input.type === "OFFER" ? calendarDay(input.validUntil, true) : undefined,
          paymentStatus: hasPaymentStatus(input.type) ? (paid ? "PAID" : "PENDING") : undefined,
          paymentMethod: paid ? input.paidWith : undefined,
          paidAt: paid ? new Date() : undefined,
          createdById: staff.userId,
        });
        return { invoice, notify: input.notify };
      } catch (error) {
        // Gleichzeitiger Upload mit derselben Nummer – der Unique-Index gewinnt.
        if (error instanceof mongoose.mongo.MongoServerError && error.code === 11000) throw numberTaken();
        throw error;
      }
    },
  };
}

// --- Kundenportal --------------------------------------------------------------------------

export async function toInvoiceItems(invoices: InvoiceLike[]): Promise<InvoiceItem[]> {
  const shipmentIds = [...new Set(invoices.flatMap((invoice) => (invoice.shipmentId ? [String(invoice.shipmentId)] : [])))];
  const shipments = shipmentIds.length
    ? await Shipment.find({ _id: { $in: shipmentIds } }).select("shipmentNumber pickup.address.city delivery.address.city").lean()
    : [];
  const shipmentById = new Map(shipments.map((shipment) => [String(shipment._id), shipment]));

  return invoices.map((invoice) => {
    const shipment = invoice.shipmentId ? shipmentById.get(String(invoice.shipmentId)) : undefined;
    return {
      id: String(invoice._id),
      type: invoice.type,
      number: invoice.number,
      netCents: invoice.netCents,
      vatCents: invoice.vatCents,
      grossCents: invoice.grossCents,
      issueDate: invoice.issueDate.toISOString(),
      dueDate: invoice.dueDate?.toISOString(),
      validUntil: invoice.validUntil?.toISOString(),
      paymentStatus: effectivePaymentStatus(invoice.paymentStatus, invoice.dueDate),
      paymentMethod: invoice.paymentMethod,
      paidAt: invoice.paidAt?.toISOString(),
      shipment: shipment
        ? {
            id: String(shipment._id),
            shipmentNumber: shipment.shipmentNumber,
            route: `${shipment.pickup.address.city} → ${shipment.delivery.address.city}`,
          }
        : undefined,
      eInvoice: invoice.source === "GENERATED",
    };
  });
}
