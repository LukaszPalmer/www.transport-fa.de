import type { InvoiceListResponse } from "@fa/shared";
import { Zip, ZipDeflate, ZipPassThrough } from "fflate";
import { Router, type Request } from "express";
import { Types } from "mongoose";
import { AppError } from "../http/errors";
import { CustomerProfile, DocumentModel, Invoice } from "../models";
import { buildCiiXml } from "../invoicing/cii";
import type { EInvoiceData } from "../invoicing/types";
import { logger } from "../lib/logger";
import { invoiceXml } from "../services/invoice-issuing";
import { toInvoiceItems } from "../services/invoices";
import { getObjectBuffer, signedDownloadUrl } from "../storage/r2";

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

const TYPE_FOLDER: Record<string, string> = { INVOICE: "Rechnungen", CREDIT_NOTE: "Gutschriften", OFFER: "Angebote", ORDER_CONFIRMATION: "Auftragsbestaetigungen" };

/**
 * Alle Belege als ZIP – z. B. bevor der Kunde sein Konto löscht. PDFs nacheinander aus R2,
 * E-Rechnungen zusätzlich als XRechnung-XML.
 */
invoicesRouter.get("/archive.zip", async (req, res) => {
  const customerId = await currentCustomerId(req);
  const invoices = await Invoice.find({ customerId }).select("+einvoice type number documentId source").sort({ issueDate: -1 }).limit(500).lean();
  if (invoices.length === 0) throw AppError.notFound("Es sind noch keine Belege vorhanden.");
  const documents = await DocumentModel.find({ _id: { $in: invoices.map((invoice) => invoice.documentId) }, customerId, status: "READY" }).select("storage").lean();
  const keyById = new Map(documents.map((document) => [String(document._id), document.storage.key]));

  res.set({
    "Content-Type": "application/zip",
    "Content-Disposition": `attachment; filename="Belege_FA-Transport.zip"`,
    "Cache-Control": "no-store",
  });
  const zip = new Zip((error, chunk, final) => {
    if (error) {
      logger.error({ err: error }, "Beleg-ZIP fehlgeschlagen");
      res.destroy(error);
      return;
    }
    res.write(chunk);
    if (final) res.end();
  });
  const safe = (value: string) => value.replace(/[^A-Za-z0-9._-]+/g, "_");
  for (const invoice of invoices) {
    const key = keyById.get(String(invoice.documentId));
    const folder = TYPE_FOLDER[invoice.type] ?? "Belege";
    if (key) {
      try {
        const file = new ZipPassThrough(`${folder}/${safe(invoice.number)}.pdf`);
        zip.add(file);
        file.push(await getObjectBuffer(key), true);
      } catch (error) {
        logger.warn({ err: error, number: invoice.number }, "Beleg für das Kunden-ZIP nicht lesbar");
      }
    }
    const data = (invoice as { einvoice?: EInvoiceData }).einvoice;
    if (invoice.source === "GENERATED" && data) {
      const xml = new ZipDeflate(`${folder}/${safe(invoice.number)}_XRechnung.xml`, { level: 6 });
      zip.add(xml);
      xml.push(Buffer.from(buildCiiXml(data, "XRECHNUNG"), "utf8"), true);
    }
  }
  zip.end();
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
