import type { DocumentListResponse } from "@fa/shared";
import { Router, type Request } from "express";
import { Types } from "mongoose";
import { consumeRateLimit } from "../auth/rate-limit";
import { AppError } from "../http/errors";
import { audit } from "../lib/audit";
import { CustomerProfile, DocumentModel, Shipment } from "../models";
import { receiveCustomerUpload, toDocumentItem } from "../services/documents";
import { deleteObject, signedDownloadUrl } from "../storage/r2";

/**
 * /api/v1/portal/documents – Dokumente des Kunden: eigene Uploads und Unterlagen
 * vom Büro. Ansehen/Download über kurzlebige R2-Links (5 Min.).
 */
export const documentsRouter = Router();

async function currentCustomerId(req: Request): Promise<Types.ObjectId> {
  const profile = await CustomerProfile.findOne({ userId: req.auth!.user.id }).select("_id").lean();
  if (!profile) throw AppError.notFound("Kundenprofil nicht gefunden.");
  return profile._id;
}

async function shipmentNumbersFor(customerId: Types.ObjectId): Promise<Map<string, string>> {
  const shipments = await Shipment.find({ customerId }).select("shipmentNumber").lean();
  return new Map(shipments.map((shipment) => [String(shipment._id), shipment.shipmentNumber]));
}

documentsRouter.get("/", async (req, res) => {
  const customerId = await currentCustomerId(req);
  const [documents, shipments] = await Promise.all([
    DocumentModel.find({ customerId, visibility: "CUSTOMER", status: "READY" }).sort({ createdAt: -1 }).limit(300).lean(),
    Shipment.find({ customerId, status: { $ne: "CANCELLED" } })
      .sort({ createdAt: -1 })
      .limit(30)
      .select("shipmentNumber pickup.address.city delivery.address.city")
      .lean(),
  ]);
  const shipmentNumbers = new Map(shipments.map((shipment) => [String(shipment._id), shipment.shipmentNumber]));

  const body: DocumentListResponse = {
    documents: documents.map((document) => toDocumentItem(document, { userId: req.auth!.user.id, shipmentNumbers })),
    shipments: shipments.map((shipment) => ({
      id: String(shipment._id),
      shipmentNumber: shipment.shipmentNumber,
      label: `${shipment.shipmentNumber} · ${shipment.pickup.address.city} → ${shipment.delivery.address.city}`,
    })),
  };
  res.json(body);
});

documentsRouter.post("/", async (req, res) => {
  const customerId = await currentCustomerId(req);
  await consumeRateLimit(`upload:user:${req.auth!.user.id}`, 60, 60 * 60);

  const document = await receiveCustomerUpload(req, { customerId, userId: req.auth!.user.id });
  audit(req, "document.uploaded", { targetType: "Document", targetId: document._id, customerId });

  res.status(201).json(toDocumentItem(document, { userId: req.auth!.user.id, shipmentNumbers: await shipmentNumbersFor(customerId) }));
});

async function findVisibleDocument(req: Request) {
  if (!Types.ObjectId.isValid(String(req.params.id))) throw AppError.notFound("Dokument nicht gefunden.");
  const customerId = await currentCustomerId(req);
  const document = await DocumentModel.findOne({ _id: req.params.id, customerId, visibility: "CUSTOMER", status: "READY" }).lean();
  if (!document) throw AppError.notFound("Dokument nicht gefunden.");
  return document;
}

/** Ansehen & Drucken im Browser – leitet auf einen kurzlebigen R2-Link weiter. */
documentsRouter.get("/:id/view", async (req, res) => {
  const document = await findVisibleDocument(req);
  const url = await signedDownloadUrl(document.storage.key, {
    filename: document.storage.originalName,
    contentType: document.storage.mimeType,
    disposition: "inline",
  });
  res.set("Cache-Control", "no-store").redirect(302, url);
});

documentsRouter.get("/:id/download", async (req, res) => {
  const document = await findVisibleDocument(req);
  const url = await signedDownloadUrl(document.storage.key, {
    filename: document.storage.originalName,
    contentType: document.storage.mimeType,
    disposition: "attachment",
  });
  res.set("Cache-Control", "no-store").redirect(302, url);
});

/** Nur eigene Uploads – Unterlagen vom Büro kann der Kunde nicht löschen. */
documentsRouter.delete("/:id", async (req, res) => {
  const document = await findVisibleDocument(req);
  if (document.uploadedByRole !== "CUSTOMER" || !document.uploadedById?.equals(req.auth!.user.id)) {
    throw AppError.forbidden("Dieses Dokument wurde von FA Transport bereitgestellt und kann nicht gelöscht werden.");
  }
  await deleteObject(document.storage.key);
  await DocumentModel.deleteOne({ _id: document._id });
  audit(req, "document.deleted", { targetType: "Document", targetId: document._id, customerId: document.customerId });
  res.status(204).end();
});
