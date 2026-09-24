import { S3Client } from "@aws-sdk/client-s3";
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
