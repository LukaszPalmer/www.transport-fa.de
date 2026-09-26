import type { Readable } from "node:stream";
import { DeleteObjectCommand, DeleteObjectsCommand, GetObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "../config/env";

/**
 * Cloudflare R2 über die S3-kompatible API.
 * Der Bucket liegt in der EU-Jurisdiktion und ist nur über den EU-Endpoint erreichbar.
 */
export function r2Endpoint(jurisdiction: "eu" | "default" = env.R2_JURISDICTION): string {
  const subdomain = jurisdiction === "eu" ? `${env.R2_ACCOUNT_ID}.eu` : env.R2_ACCOUNT_ID;
  return `https://${subdomain}.r2.cloudflarestorage.com`;
}

export function createR2Client(jurisdiction: "eu" | "default" = env.R2_JURISDICTION): S3Client {
  return new S3Client({
    region: "auto",
    endpoint: r2Endpoint(jurisdiction),
    credentials: { accessKeyId: env.R2_ACCESS_KEY_ID, secretAccessKey: env.R2_SECRET_ACCESS_KEY },
    // Keine automatischen CRC32-Prüfsummen: sonst scheitern Browser-Uploads über Presigned URLs.
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });
}

export const r2 = createR2Client();
export const R2_BUCKET = env.R2_BUCKET;

/** Alles eines Kunden liegt unter einem Präfix → Kontolöschung = Präfix leeren. */
export function customerPrefix(customerId: string): string {
  return `customers/${customerId}/`;
}

/** Lädt einen Datenstrom hoch (Multipart, unbekannte Länge) – die Datei liegt nie komplett im Speicher. */
export function createStreamUpload(key: string, body: Readable, contentType: string): Upload {
  return new Upload({
    client: r2,
    params: { Bucket: R2_BUCKET, Key: key, Body: body, ContentType: contentType },
    queueSize: 2,
    partSize: 5 * 1024 * 1024,
  });
}

/** Kleine, im Server erzeugte Dateien (z. B. Rechnungs-PDF) in einem Stück hochladen. */
export async function putObject(key: string, body: Buffer, contentType: string): Promise<void> {
  await r2.send(new PutObjectCommand({ Bucket: R2_BUCKET, Key: key, Body: body, ContentType: contentType, ContentLength: body.length }));
}

export async function getObjectBuffer(key: string): Promise<Buffer> {
  const object = await r2.send(new GetObjectCommand({ Bucket: R2_BUCKET, Key: key }));
  if (!object.Body) throw new Error(`R2-Objekt ${key} ist leer`);
  return Buffer.from(await object.Body.transformToByteArray());
}

export async function deleteObject(key: string): Promise<void> {
  await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }));
}

/** Löscht alle Objekte unter einem Präfix (je 1000 pro Anfrage). Liefert die Anzahl. */
export async function deletePrefix(prefix: string): Promise<number> {
  let deleted = 0;
  let continuationToken: string | undefined;
  do {
    const page = await r2.send(new ListObjectsV2Command({ Bucket: R2_BUCKET, Prefix: prefix, ContinuationToken: continuationToken }));
    const keys = (page.Contents ?? []).flatMap((object) => (object.Key ? [{ Key: object.Key }] : []));
    if (keys.length > 0) {
      await r2.send(new DeleteObjectsCommand({ Bucket: R2_BUCKET, Delete: { Objects: keys, Quiet: true } }));
      deleted += keys.length;
    }
    continuationToken = page.IsTruncated ? page.NextContinuationToken : undefined;
  } while (continuationToken);
  return deleted;
}

/** Kurzlebiger Download-Link (5 Min.) – „inline" zum Ansehen/Drucken, „attachment" zum Speichern. */
export function signedDownloadUrl(
  key: string,
  { filename, contentType, disposition }: { filename: string; contentType: string; disposition: "inline" | "attachment" },
): Promise<string> {
  const asciiName = filename.replace(/[^\x20-\x7e]/g, "_").replace(/["\\]/g, "_");
  return getSignedUrl(
    r2,
    new GetObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      ResponseContentType: contentType,
      ResponseContentDisposition: `${disposition}; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
    }),
    { expiresIn: 300 },
  );
}
