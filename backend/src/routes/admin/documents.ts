import { Router, type Request } from "express";
import { Types } from "mongoose";
import { requirePermission } from "../../auth/middleware";
import { AppError } from "../../http/errors";
import { audit } from "../../lib/audit";
import { DocumentModel } from "../../models";
import { signedDownloadUrl } from "../../storage/r2";

/** /api/v1/admin/documents – alle Kundendokumente (auch interne) ansehen und herunterladen. */
export const adminDocumentsRouter = Router();

adminDocumentsRouter.use(requirePermission("can_view_documents"));

async function findDocument(req: Request) {
  if (!Types.ObjectId.isValid(String(req.params.id))) throw AppError.notFound("Dokument nicht gefunden.");
  const document = await DocumentModel.findOne({ _id: req.params.id, status: "READY" }).lean();
  if (!document) throw AppError.notFound("Dokument nicht gefunden.");
  return document;
}

for (const [path, disposition] of [
  ["/:id/view", "inline"],
  ["/:id/download", "attachment"],
] as const) {
  adminDocumentsRouter.get(path, async (req, res) => {
    const document = await findDocument(req);
    const url = await signedDownloadUrl(document.storage.key, {
      filename: document.storage.originalName,
      contentType: document.storage.mimeType,
      disposition,
    });
    audit(req, "document.opened_by_staff", { targetType: "Document", targetId: document._id, customerId: document.customerId });
    res.set("Cache-Control", "no-store").redirect(302, url);
  });
}
