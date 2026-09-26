import { hasPaymentStatus, UpdateInvoicePaymentInput, type AdminInvoiceList, type AdminInvoiceRow } from "@fa/shared";
import { Router, type Request } from "express";
import { Types, type QueryFilter } from "mongoose";
import { z } from "zod";
import { requirePermission } from "../../auth/middleware";
import { AppError } from "../../http/errors";
import { audit } from "../../lib/audit";
import { CustomerProfile, DocumentModel, Invoice, type IInvoice } from "../../models";
import { receiveUpload } from "../../services/documents";
import { invoiceXml, resendInvoiceMail } from "../../services/invoice-issuing";
import { invoiceStats, prepareInvoiceUpload, toAdminInvoiceRows } from "../../services/invoices";
import { notifyInvoiceIssued } from "../../services/notifications";
import { deleteObject, signedDownloadUrl } from "../../storage/r2";
import { adminInvoiceDraftsRouter } from "./invoice-drafts";

/**
 * /api/v1/admin/invoices – Rechnungen im Portal erstellen (Entwürfe unter /drafts), Belege aus
 * der Buchhaltung an Kunden senden (PDF + Eckdaten) und Zahlungen verbuchen.
 */
export const adminInvoicesRouter = Router();

adminInvoicesRouter.use(requirePermission("can_manage_invoices"));
adminInvoicesRouter.use("/drafts", adminInvoiceDraftsRouter);

const FILTERS = ["ALL", "OPEN", "OVERDUE", "PAID", "CANCELLED", "OFFER", "ORDER_CONFIRMATION", "CREDIT_NOTE"] as const;

const ListQuery = z.object({
  filter: z.enum(FILTERS).default("ALL"),
  customerId: z.string().regex(/^[a-f0-9]{24}$/).optional(),
  q: z.string().trim().max(60).optional(),
  page: z.coerce.number().int().min(1).max(1000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function filterFor(filter: (typeof FILTERS)[number]): QueryFilter<IInvoice> {
  switch (filter) {
    case "OPEN":
      return { type: "INVOICE", paymentStatus: "PENDING" };
    case "OVERDUE":
      return { type: "INVOICE", paymentStatus: "PENDING", dueDate: { $lt: new Date() } };
    case "PAID":
      return { type: "INVOICE", paymentStatus: "PAID" };
    case "CANCELLED":
      return { type: "INVOICE", paymentStatus: "CANCELLED" };
    case "OFFER":
    case "ORDER_CONFIRMATION":
    case "CREDIT_NOTE":
      return { type: filter };
    default:
      return {};
  }
}

async function findInvoice(req: Request) {
  if (!Types.ObjectId.isValid(String(req.params.id))) throw AppError.notFound("Beleg nicht gefunden.");
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) throw AppError.notFound("Beleg nicht gefunden.");
  return invoice;
}

async function rowFor(invoice: IInvoice): Promise<AdminInvoiceRow> {
  const [row] = await toAdminInvoiceRows([invoice]);
  return row!;
}

adminInvoicesRouter.get("/", async (req, res) => {
  const query = ListQuery.parse(req.query);
  const scope: QueryFilter<IInvoice> = query.customerId ? { customerId: new Types.ObjectId(query.customerId) } : {};
  const filter: QueryFilter<IInvoice> = { ...scope, ...filterFor(query.filter) };

  if (query.q) {
    // Suche nach Belegnummer oder Kunde (Nummer, Name, Firma, E-Mail).
    const pattern = escapeRegex(query.q);
    const customerIds = await CustomerProfile.find({ searchText: { $regex: escapeRegex(query.q.toLowerCase()) } })
      .limit(200)
      .distinct("_id");
    filter.$or = [{ number: { $regex: pattern, $options: "i" } }, { customerId: { $in: customerIds } }];
  }

  const [invoices, total, stats] = await Promise.all([
    Invoice.find(filter)
      .sort({ issueDate: -1, createdAt: -1 })
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .lean(),
    Invoice.countDocuments(filter),
    invoiceStats(scope),
  ]);
  const body: AdminInvoiceList = { invoices: await toAdminInvoiceRows(invoices), total, stats };
  res.json(body);
});

/** Beleg senden: Multipart mit Eckdaten (zuerst) und PDF. */
adminInvoicesRouter.post("/", async (req, res) => {
  const staff = { userId: req.auth!.user.id, role: req.auth!.user.role };
  const { invoice, notify } = await receiveUpload(req, (fields) => prepareInvoiceUpload(fields, staff));

  audit(req, "invoice.issued", {
    targetType: "Invoice",
    targetId: invoice._id,
    customerId: invoice.customerId,
    meta: { type: invoice.type, number: invoice.number, notify },
  });
  if (notify) notifyInvoiceIssued(invoice._id);
  res.status(201).json(await rowFor(invoice));
});

/** Zahlstatus pflegen: offen, bezahlt (Überweisung oder bar) oder storniert. */
adminInvoicesRouter.patch("/:id/payment", async (req, res) => {
  const input = UpdateInvoicePaymentInput.parse(req.body);
  const invoice = await findInvoice(req);
  if (!hasPaymentStatus(invoice.type)) throw AppError.badRequest("Nur Rechnungen haben einen Zahlstatus.");

  invoice.paymentStatus = input.status;
  if (input.status === "PAID") {
    if (invoice.paymentMethod !== input.method || !invoice.paidAt) invoice.paidAt = new Date();
    invoice.paymentMethod = input.method;
  } else {
    invoice.paymentMethod = undefined;
    invoice.paidAt = undefined;
  }
  await invoice.save();

  audit(req, "invoice.payment_updated", {
    targetType: "Invoice",
    targetId: invoice._id,
    customerId: invoice.customerId,
    meta: { status: input.status, method: input.method },
  });
  res.json(await rowFor(invoice));
});

/** Versehentlich gesendeten Upload-Beleg zurückziehen – das Original bleibt in der Buchhaltung. */
adminInvoicesRouter.delete("/:id", async (req, res) => {
  const invoice = await findInvoice(req);
  // Im Portal erstellte Rechnungen sind Originale (GoBD): nicht löschen, sondern stornieren.
  if (invoice.source === "GENERATED") throw AppError.conflict("Erstellte Rechnungen können nicht gelöscht werden – bitte als storniert markieren.");
  const document = await DocumentModel.findById(invoice.documentId).lean();
  if (document) await deleteObject(document.storage.key);
  await DocumentModel.deleteOne({ _id: invoice.documentId });
  await Invoice.deleteOne({ _id: invoice._id });

  audit(req, "invoice.deleted", {
    targetType: "Invoice",
    targetId: invoice._id,
    customerId: invoice.customerId,
    meta: { type: invoice.type, number: invoice.number },
  });
  res.status(204).end();
});

for (const [path, disposition] of [
  ["/:id/view", "inline"],
  ["/:id/download", "attachment"],
] as const) {
  adminInvoicesRouter.get(path, async (req, res) => {
    const invoice = await findInvoice(req);
    const document = await DocumentModel.findOne({ _id: invoice.documentId, status: "READY" }).lean();
    if (!document) throw AppError.notFound("Die PDF zu diesem Beleg fehlt.");
    const url = await signedDownloadUrl(document.storage.key, {
      filename: document.storage.originalName,
      contentType: document.storage.mimeType,
      disposition,
    });
    res.set("Cache-Control", "no-store").redirect(302, url);
  });
}

/** XRechnung-XML (für Behörden und Buchhaltungsprogramme) – nur für im Portal erstellte Rechnungen. */
adminInvoicesRouter.get("/:id/xml", async (req, res) => {
  const invoice = await findInvoice(req);
  const { xml, fileName } = await invoiceXml(invoice._id);
  res
    .set({
      "Content-Type": "application/xml; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    })
    .send(xml);
});

/** Rechnung (PDF im Anhang) erneut per E-Mail an den Kunden senden. */
adminInvoicesRouter.post("/:id/email", async (req, res) => {
  const invoice = await findInvoice(req);
  const mail = await resendInvoiceMail(invoice, req.auth!.user.id);
  audit(req, "invoice.emailed", { targetType: "Invoice", targetId: invoice._id, customerId: invoice.customerId, meta: { status: mail.status } });
  res.json({ mail, invoice: await rowFor((await Invoice.findById(invoice._id)) ?? invoice) });
});
