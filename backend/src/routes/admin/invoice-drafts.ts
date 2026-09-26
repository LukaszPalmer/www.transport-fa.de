import { InvoiceDraftInput, IssueInvoiceInput, type AdminInvoiceDraft, type IssueInvoiceResponse } from "@fa/shared";
import { Router, type Request } from "express";
import { Types } from "mongoose";
import { z } from "zod";
import { AppError } from "../../http/errors";
import { audit } from "../../lib/audit";
import { CustomerProfile, InvoiceDraft, type IInvoiceDraft } from "../../models";
import { assertDraftTargets, invoiceEditorContext, issueInvoiceFromDraft, renderDraftPreview, toDraftRows } from "../../services/invoice-issuing";

/**
 * /api/v1/admin/invoices/drafts – Rechnungen im Portal erstellen: Entwurf speichern, als PDF
 * ansehen und versenden. Recht „Rechnungen & Belege“ prüft der übergeordnete Router.
 */
export const adminInvoiceDraftsRouter = Router();

async function findDraft(req: Request) {
  if (!Types.ObjectId.isValid(String(req.params.id))) throw AppError.notFound("Entwurf nicht gefunden.");
  const draft = await InvoiceDraft.findById(req.params.id);
  if (!draft) throw AppError.notFound("Entwurf nicht gefunden – wurde die Rechnung schon versendet?");
  return draft;
}

async function toDraft(draft: IInvoiceDraft): Promise<AdminInvoiceDraft> {
  const customer = await CustomerProfile.findById(draft.customerId).select("customerNumber firstName lastName companyName").lean();
  return {
    id: String(draft._id),
    content: InvoiceDraftInput.parse(draft.content),
    customer: {
      id: String(draft.customerId),
      customerNumber: customer?.customerNumber ?? "–",
      name: customer ? customer.companyName || `${customer.firstName} ${customer.lastName}` : "Gelöschter Kunde",
    },
    updatedAt: draft.updatedAt.toISOString(),
  };
}

adminInvoiceDraftsRouter.get("/", async (_req, res) => {
  const drafts = await InvoiceDraft.find().sort({ updatedAt: -1 }).limit(100).lean();
  res.json({ drafts: await toDraftRows(drafts) });
});

/** Stammdaten, Aufträge und Hinweise zu einem Kunden – Grundlage für die Vorbelegung im Editor. */
adminInvoiceDraftsRouter.get("/context", async (req, res) => {
  const { customerId } = z.object({ customerId: z.string().regex(/^[a-f0-9]{24}$/, "Kunde fehlt.") }).parse(req.query);
  res.json(await invoiceEditorContext(new Types.ObjectId(customerId)));
});

adminInvoiceDraftsRouter.post("/", async (req, res) => {
  const content = InvoiceDraftInput.parse(req.body);
  await assertDraftTargets(content);
  const userId = req.auth!.user.id;
  const draft = await InvoiceDraft.create({
    customerId: content.customerId,
    shipmentId: content.shipmentId,
    content,
    createdById: userId,
    updatedById: userId,
  });
  audit(req, "invoice_draft.created", { targetType: "InvoiceDraft", targetId: draft._id, customerId: draft.customerId });
  res.status(201).json(await toDraft(draft));
});

adminInvoiceDraftsRouter.get("/:id", async (req, res) => {
  res.json(await toDraft(await findDraft(req)));
});

adminInvoiceDraftsRouter.put("/:id", async (req, res) => {
  const draft = await findDraft(req);
  if (draft.issuingAt) throw AppError.conflict("Diese Rechnung wird gerade versendet.");
  const content = InvoiceDraftInput.parse(req.body);
  await assertDraftTargets(content);
  draft.set({
    customerId: content.customerId,
    shipmentId: content.shipmentId,
    content,
    updatedById: req.auth!.user.id,
  });
  draft.markModified("content");
  await draft.save();
  res.json(await toDraft(draft));
});

adminInvoiceDraftsRouter.delete("/:id", async (req, res) => {
  const draft = await findDraft(req);
  if (draft.issuingAt) throw AppError.conflict("Diese Rechnung wird gerade versendet.");
  await draft.deleteOne();
  audit(req, "invoice_draft.deleted", { targetType: "InvoiceDraft", targetId: draft._id, customerId: draft.customerId });
  res.status(204).end();
});

/** Vorschau als PDF (Wasserzeichen „Entwurf“) – im Browser ansehen oder drucken. */
adminInvoiceDraftsRouter.get("/:id/preview", async (req, res) => {
  const pdf = await renderDraftPreview(await findDraft(req));
  res
    .set({
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="Rechnungsentwurf.pdf"',
      "Cache-Control": "no-store",
    })
    .send(pdf);
});

/** Rechnung erstellen: Nummer vergeben, E-Rechnung ablegen, im Portal bereitstellen, optional mailen. */
adminInvoiceDraftsRouter.post("/:id/issue", async (req, res) => {
  const options = IssueInvoiceInput.parse(req.body ?? {});
  const draft = await findDraft(req);
  const { invoice, mail } = await issueInvoiceFromDraft(draft._id, { userId: req.auth!.user.id, role: req.auth!.user.role }, options);

  audit(req, "invoice.issued", {
    targetType: "Invoice",
    targetId: invoice._id,
    customerId: invoice.customerId,
    meta: { type: invoice.type, number: invoice.number, source: "GENERATED", mail: mail.status, paidWith: options.paidWith },
  });
  const body: IssueInvoiceResponse = { invoiceId: String(invoice._id), number: invoice.number, mail };
  res.status(201).json(body);
});
