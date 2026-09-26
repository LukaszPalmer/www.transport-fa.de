import { createHash } from "node:crypto";
import path from "node:path";
import { PassThrough, Transform, type Readable } from "node:stream";
import { DocumentUploadFields, MAX_UPLOAD_BYTES, UPLOAD_FILE_TYPES, type DocumentItem } from "@fa/shared";
import busboy from "busboy";
import type { Request } from "express";
import { Types } from "mongoose";
import { AppError } from "../http/errors";
import { detectFileType, FILE_SIGNATURE_BYTES } from "../lib/file-type";
import { DocumentModel, Shipment, type IDocument } from "../models";
import { createStreamUpload, customerPrefix, deleteObject } from "../storage/r2";

/** API-Darstellung eines Dokuments aus Sicht des Kunden. */
export function toDocumentItem(
  document: Pick<IDocument, "_id" | "title" | "category" | "storage" | "createdAt" | "uploadedByRole" | "uploadedById" | "handToDriver" | "shipmentId">,
  { userId, shipmentNumbers }: { userId: Types.ObjectId; shipmentNumbers: Map<string, string> },
): DocumentItem {
  const ownUpload = document.uploadedByRole === "CUSTOMER" && Boolean(document.uploadedById?.equals(userId));
  return {
    id: String(document._id),
    title: document.title,
    category: document.category,
    mimeType: document.storage.mimeType,
    sizeBytes: document.storage.sizeBytes,
    createdAt: document.createdAt.toISOString(),
    source: document.uploadedByRole === "CUSTOMER" ? "CUSTOMER" : "OFFICE",
    handToDriver: document.handToDriver ?? false,
    shipmentId: document.shipmentId ? String(document.shipmentId) : undefined,
    shipmentNumber: document.shipmentId ? shipmentNumbers.get(String(document.shipmentId)) : undefined,
    canDelete: ownUpload,
  };
}

// --- Upload -------------------------------------------------------------------------

interface UploadContext {
  customerId: Types.ObjectId;
  userId: Types.ObjectId;
}

/**
 * Nimmt einen Formular-Upload entgegen und streamt die Datei direkt nach R2.
 * Reihenfolge: Felder prüfen → Dateisignatur prüfen → hochladen (Größenlimit
 * läuft mit) → erst danach Datenbankeintrag. Abgebrochene Uploads hinterlassen nichts.
 */
export function receiveCustomerUpload(req: Request, context: UploadContext): Promise<IDocument> {
  return new Promise((resolve, reject) => {
    const fields: Record<string, string> = {};
    let fileSeen = false;

    let parser: busboy.Busboy;
    try {
      parser = busboy({ headers: req.headers, limits: { files: 1, fileSize: MAX_UPLOAD_BYTES, fields: 10, fieldSize: 2000 } });
    } catch {
      reject(AppError.badRequest("Bitte senden Sie die Datei als Formular-Upload."));
      return;
    }

    parser.on("field", (name, value) => {
      fields[name] = value;
    });
    parser.on("file", (_name, stream, info) => {
      fileSeen = true;
      storeFile(stream, info.filename, fields, context).then(resolve, (error: unknown) => {
        stream.resume(); // Rest verwerfen, damit die Anfrage sauber endet
        reject(error);
      });
    });
    parser.on("error", () => reject(AppError.badRequest("Der Upload konnte nicht gelesen werden.")));
    parser.on("close", () => {
      if (!fileSeen) reject(AppError.validation({ file: "Bitte wählen Sie eine Datei aus." }));
    });
    req.pipe(parser);
  });
}

async function storeFile(stream: Readable, filename: string, fields: Record<string, string>, context: UploadContext): Promise<IDocument> {
  const input = DocumentUploadFields.parse(fields); // ZodError → 422 mit Feldfehlern

  if (input.shipmentId && !(await Shipment.exists({ _id: input.shipmentId, customerId: context.customerId }))) {
    throw AppError.validation({ shipmentId: "Dieser Auftrag gehört nicht zu Ihrem Konto." });
  }

  const head = await readHead(stream, FILE_SIGNATURE_BYTES);
  const mimeType = detectFileType(head);
  if (!mimeType) {
    throw AppError.validation({ file: "Dieser Dateityp wird nicht unterstützt. Erlaubt sind PDF, JPG, PNG, WEBP und HEIC." });
  }

  const documentId = new Types.ObjectId();
  const key = `${customerPrefix(String(context.customerId))}${documentId}.${UPLOAD_FILE_TYPES[mimeType]}`;
  const hash = createHash("sha256");
  let size = 0;
  const counter = new Transform({
    transform(chunk: Buffer, _encoding, callback) {
      size += chunk.length;
      hash.update(chunk);
      callback(null, chunk);
    },
  });

  const body = new PassThrough();
  counter.pipe(body);
  counter.write(head);
  if (stream.readableEnded) counter.end();
  else stream.pipe(counter);

  const upload = createStreamUpload(key, body, mimeType);
  let tooLarge = false;
  stream.once("limit", () => {
    tooLarge = true;
    void upload.abort();
  });

  try {
    await upload.done();
  } catch (error) {
    await deleteObject(key).catch(() => undefined);
    if (tooLarge) throw new AppError(413, "PAYLOAD_TOO_LARGE", `Die Datei ist größer als ${MAX_UPLOAD_BYTES / 1024 / 1024} MB.`);
    throw error;
  }
  if (tooLarge) {
    await deleteObject(key).catch(() => undefined);
    throw new AppError(413, "PAYLOAD_TOO_LARGE", `Die Datei ist größer als ${MAX_UPLOAD_BYTES / 1024 / 1024} MB.`);
  }

  try {
    return await DocumentModel.create({
      _id: documentId,
      customerId: context.customerId,
      shipmentId: input.shipmentId ? new Types.ObjectId(input.shipmentId) : undefined,
      category: input.category,
      title: input.title,
      visibility: "CUSTOMER",
      uploadedById: context.userId,
      uploadedByRole: "CUSTOMER",
      handToDriver: input.handToDriver,
      storage: {
        key,
        originalName: path.basename(filename || `dokument.${UPLOAD_FILE_TYPES[mimeType]}`).slice(0, 255),
        mimeType,
        sizeBytes: size,
        sha256: hash.digest("hex"),
      },
      status: "READY",
    });
  } catch (error) {
    await deleteObject(key).catch(() => undefined);
    throw error;
  }
}

/** Liest die ersten Bytes eines Streams, ohne ihn zu verbrauchen (Rest folgt per pipe). */
function readHead(stream: Readable, minBytes: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let length = 0;
    const cleanup = () => {
      stream.off("data", onData);
      stream.off("end", onEnd);
      stream.off("error", onError);
    };
    const onData = (chunk: Buffer) => {
      chunks.push(chunk);
      length += chunk.length;
      if (length >= minBytes) {
        stream.pause();
        cleanup();
        resolve(Buffer.concat(chunks));
      }
    };
    const onEnd = () => {
      cleanup();
      resolve(Buffer.concat(chunks));
    };
    const onError = (error: Error) => {
      cleanup();
      reject(error);
    };
    stream.on("data", onData);
    stream.once("end", onEnd);
    stream.once("error", onError);
  });
}
