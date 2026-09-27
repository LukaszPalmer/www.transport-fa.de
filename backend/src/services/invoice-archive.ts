import { retentionEnd, type InvoiceType } from "@fa/shared";
import type { Types } from "mongoose";
import { logger } from "../lib/logger";
import type { MailAttachment } from "../mail/mailer";
import { DocumentModel, Invoice } from "../models";
import { copyObject, deleteObject, getObjectBuffer, invoiceArchiveKey } from "../storage/r2";

/**
 * Aufbewahrung von Belegen gelöschter Kunden.
 *
 * Rechnungen und Gutschriften sind Buchungsbelege (8 Jahre), Angebote und Auftragsbestätigungen
 * Handelsbriefe (6 Jahre). Löscht ein Kunde sein Konto, bleiben sie deshalb erhalten – die
 * Löschpflicht tritt hinter die Aufbewahrungspflicht zurück (Art. 17 Abs. 3 lit. b DSGVO).
 * Die PDFs wandern aus dem Kundenpräfix nach archive/invoices/, die Belege behalten Kundennummer
 * und Namen als Schnappschuss. Nach Fristende löscht purgeExpiredInvoiceArchives() alles endgültig.
 */

interface CustomerForArchive {
  _id: Types.ObjectId;
  customerNumber: string;
  firstName: string;
  lastName: string;
  companyName?: string;
}

export interface ArchivedInvoiceFile {
  number: string;
  type: InvoiceType;
  issueDate: Date;
  key: string;
  fileName: string;
  sizeBytes: number;
}

/**
 * Sichert alle Belege eines Kunden vor der Kontolöschung. Idempotent: bricht die Löschung ab,
 * setzt der nächste Versuch dort fort, wo er aufgehört hat.
 */
export async function archiveCustomerInvoices(customer: CustomerForArchive): Promise<ArchivedInvoiceFile[]> {
  const invoices = await Invoice.find({ customerId: customer._id }).select("type number issueDate documentId archivedCustomer").lean();
  if (invoices.length === 0) return [];

  const now = new Date();
  const name = `${customer.firstName} ${customer.lastName}`.trim();
  const snapshot = {
    customerNumber: customer.customerNumber,
    name,
    companyName: customer.companyName,
    searchText: [customer.customerNumber, name, customer.companyName].filter(Boolean).join(" ").toLowerCase(),
    deletedAt: now,
  };

  const files: ArchivedInvoiceFile[] = [];
  for (const invoice of invoices) {
    const document = await DocumentModel.findById(invoice.documentId).select("storage status archivedAt").lean();
    let key = document?.storage.key;
    if (document && !document.archivedAt) {
      const extension = document.storage.key.split(".").pop() ?? "pdf";
      key = invoiceArchiveKey(String(invoice._id), extension);
      if (document.status === "READY") await copyObject(document.storage.key, key);
      await DocumentModel.updateOne({ _id: document._id }, { $set: { "storage.key": key, archivedAt: now } });
    }
    if (!invoice.archivedCustomer) {
      await Invoice.updateOne({ _id: invoice._id }, { $set: { archivedCustomer: snapshot, retainUntil: retentionEnd(invoice.type, invoice.issueDate) } });
    }
    if (document && key && document.status === "READY") {
      files.push({
        number: invoice.number,
        type: invoice.type,
        issueDate: invoice.issueDate,
        key,
        fileName: document.storage.originalName,
        sizeBytes: document.storage.sizeBytes,
      });
    }
  }
  logger.info({ invoices: invoices.length, files: files.length }, "Kontolöschung: Belege für die Aufbewahrungsfrist gesichert");
  return files;
}

/** Mail-Anhänge für die Abschiedsmail: Rechnungen und Gutschriften, neueste zuerst, in vernünftiger Größe. */
const MAX_ATTACHMENTS = 25;
const MAX_ATTACHMENT_BYTES = 15 * 1024 * 1024;

export async function farewellAttachments(files: ArchivedInvoiceFile[]): Promise<{ attachments: MailAttachment[]; omitted: number }> {
  const relevant = files.filter((file) => file.type === "INVOICE" || file.type === "CREDIT_NOTE").sort((a, b) => b.issueDate.getTime() - a.issueDate.getTime());
  const attachments: MailAttachment[] = [];
  let total = 0;
  for (const file of relevant) {
    if (attachments.length >= MAX_ATTACHMENTS || total + file.sizeBytes > MAX_ATTACHMENT_BYTES) break;
    try {
      attachments.push({ filename: file.fileName, content: await getObjectBuffer(file.key), contentType: "application/pdf" });
      total += file.sizeBytes;
    } catch (error) {
      logger.warn({ err: error, number: file.number }, "Beleg für die Abschiedsmail nicht lesbar");
    }
  }
  return { attachments, omitted: relevant.length - attachments.length };
}

/** Löscht Belege gelöschter Kunden nach Ablauf der Aufbewahrungsfrist (täglich geprüft). */
export async function purgeExpiredInvoiceArchives(): Promise<number> {
  const expired = await Invoice.find({ retainUntil: { $lt: new Date() } }).select("_id documentId").limit(500).lean();
  for (const invoice of expired) {
    const document = await DocumentModel.findById(invoice.documentId).select("storage.key").lean();
    if (document) {
      await deleteObject(document.storage.key);
      await DocumentModel.deleteOne({ _id: document._id });
    }
    await Invoice.deleteOne({ _id: invoice._id });
  }
  if (expired.length > 0) logger.info({ count: expired.length }, "Belege nach Ablauf der Aufbewahrungsfrist gelöscht");
  return expired.length;
}
