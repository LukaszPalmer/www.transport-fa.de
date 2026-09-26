import type { InvoiceListResponse } from "@fa/shared";
import { Router, type Request } from "express";
import { Types } from "mongoose";
import { AppError } from "../http/errors";
import { CustomerProfile, DocumentModel, Invoice } from "../models";
import { invoiceXml } from "../services/invoice-issuing";
import { toInvoiceItems } from "../services/invoices";
import { signedDownloadUrl } from "../storage/r2";

/**
 * /api/v1/portal/invoices – Angebote, Auftragsbestätigungen, Rechnungen und Gutschriften
 * des Kunden. PDF ansehen/drucken und herunterladen über kurzlebige R2-Links, E-Rechnungen
 * zusätzlich als XRechnung-XML.
 */
export const invoicesRouter = Router();

async function currentCustomerId(req: Request): Promise<Types.ObjectId> {
  const profile = await CustomerProfile.findOne({ userId: req.auth!.user.id }).select("_id").lean();
  if (!profile) throw AppError.notFound("Kundenprofil nicht gefunden.");
  return profile._id;
}

invoicesRouter.get("/", async (req, res) => {
  const customerId = await currentCustomerId(req);
  const invoices = await Invoice.find({ customerId }).sort({ issueDate: -1, createdAt: -1 }).limit(500).lean();
  const items = await toInvoiceItems(invoices);

  const open = items.filter((item) => item.paymentStatus === "PENDING" || item.paymentStatus === "OVERDUE");
  const body: InvoiceListResponse = {
    invoices: items,
    stats: {
      openCount: open.length,
      openGrossCents: open.reduce((sum, item) => sum + item.grossCents, 0),
      overdueCount: items.filter((item) => item.paymentStatus === "OVERDUE").length,
      paidCount: items.filter((item) => item.paymentStatus === "PAID").length,
    },
  };
  res.json(body);
});

/** E-Rechnung als XRechnung-XML – für Buchhaltungsprogramme, die reine XML erwarten. */
invoicesRouter.get("/:id/xml", async (req, res) => {
  if (!Types.ObjectId.isValid(String(req.params.id))) throw AppError.notFound("Beleg nicht gefunden.");
  const customerId = await currentCustomerId(req);
  const { xml, fileName } = await invoiceXml(new Types.ObjectId(String(req.params.id)), customerId);
  res
    .set({
      "Content-Type": "application/xml; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    })
    .send(xml);
});

for (const [path, disposition] of [
  ["/:id/view", "inline"],
  ["/:id/download", "attachment"],
] as const) {
  invoicesRouter.get(path, async (req, res) => {
    if (!Types.ObjectId.isValid(String(req.params.id))) throw AppError.notFound("Beleg nicht gefunden.");
    const customerId = await currentCustomerId(req);
    const invoice = await Invoice.findOne({ _id: req.params.id, customerId }).select("documentId").lean();
    if (!invoice) throw AppError.notFound("Beleg nicht gefunden.");
    const document = await DocumentModel.findOne({ _id: invoice.documentId, customerId, status: "READY" }).lean();
    if (!document) throw AppError.notFound("Die PDF zu diesem Beleg ist nicht mehr verfügbar.");

    const url = await signedDownloadUrl(document.storage.key, {
      filename: document.storage.originalName,
      contentType: document.storage.mimeType,
      disposition,
    });
    res.set("Cache-Control", "no-store").redirect(302, url);
  });
}
