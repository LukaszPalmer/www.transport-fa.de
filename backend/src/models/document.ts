import {
  DOCUMENT_CATEGORIES,
  DOCUMENT_VISIBILITIES,
  MAX_UPLOAD_BYTES,
  ROLES,
  UPLOAD_STATES,
  type DocumentCategory,
  type DocumentVisibility,
  type Role,
  type UploadState,
} from "@fa/shared";
import { Schema } from "mongoose";
import { defineModel, ObjectId, type Id } from "../db/schema-kit";

/**
 * Jede Datei in Cloudflare R2 hat genau einen Document-Eintrag – Kunden-Uploads,
 * Rechnungs-PDFs, Chat-Anhänge. Kontolöschung = Präfix customers/<customerId>/ leeren.
 */
export interface StoredFile {
  key: string; // customers/<customerId>/<documentId>.<ext>
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  sha256?: string;
}

export interface IDocument {
  _id: Id;
  customerId: Id; // → CustomerProfile
  shipmentId?: Id; // → Shipment
  category: DocumentCategory;
  title: string;
  visibility: DocumentVisibility;
  uploadedById?: Id;
  uploadedByRole: Role;
  storage: StoredFile;
  status: UploadState; // READY erst nach vollständigem Upload + Dateityp-Prüfung
  handToDriver: boolean; // „Dem Fahrer mitgeben" – Büro druckt es für den LKW aus
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema<IDocument>(
  {
    customerId: { type: ObjectId, ref: "CustomerProfile", required: true },
    shipmentId: { type: ObjectId, ref: "Shipment" },
    category: { type: String, enum: DOCUMENT_CATEGORIES, required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    visibility: { type: String, enum: DOCUMENT_VISIBILITIES, default: "CUSTOMER" },
    uploadedById: { type: ObjectId, ref: "User" },
    uploadedByRole: { type: String, enum: ROLES, required: true },
    storage: {
      type: new Schema<StoredFile>(
        {
          key: { type: String, required: true },
          originalName: { type: String, required: true, maxlength: 255 },
          mimeType: { type: String, required: true, maxlength: 120 },
          sizeBytes: { type: Number, required: true, min: 1, max: MAX_UPLOAD_BYTES },
          sha256: String,
        },
        { _id: false },
      ),
      required: true,
    },
    status: { type: String, enum: UPLOAD_STATES, default: "PENDING_UPLOAD" },
    handToDriver: { type: Boolean, default: false },
  },
  { timestamps: true },
);

DocumentSchema.index({ "storage.key": 1 }, { unique: true });
DocumentSchema.index({ customerId: 1, category: 1, createdAt: -1 });
DocumentSchema.index({ shipmentId: 1 }, { partialFilterExpression: { shipmentId: { $exists: true } } });
DocumentSchema.index({ handToDriver: 1, createdAt: -1 }, { partialFilterExpression: { handToDriver: true } }); // Druckliste fürs Büro
DocumentSchema.index({ createdAt: 1 }, { partialFilterExpression: { status: "PENDING_UPLOAD" } }); // Aufräumjob

export const DocumentModel = defineModel("Document", DocumentSchema); // Name ≠ `Document` (DOM-/Mongoose-Typen)
