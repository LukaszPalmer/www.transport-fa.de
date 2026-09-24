/**
 * Prüft den Zugriff auf Cloudflare R2: Schreiben, Lesen, Löschen.
 * Läuft das über den EU-Endpoint, ist die EU-Jurisdiktion bestätigt – ein Bucket
 * außerhalb der EU wäre dort nicht erreichbar.
 * Lokal: npm run storage:check · Railway: nach dem ersten Deploy einmal ausführen.
 */
import { randomUUID } from "node:crypto";
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { env } from "../src/config/env";
import { r2, R2_BUCKET, r2Endpoint } from "../src/storage/r2";

const key = `system/healthcheck/${randomUUID()}.txt`;
const body = `FA Transport Storage-Check ${new Date().toISOString()}`;

console.log(`Bucket: ${R2_BUCKET} · Endpoint: ${r2Endpoint()}`);

await r2.send(new PutObjectCommand({ Bucket: R2_BUCKET, Key: key, Body: body, ContentType: "text/plain" }));
console.log("✔ Schreiben");

const read = await r2.send(new GetObjectCommand({ Bucket: R2_BUCKET, Key: key }));
if ((await read.Body?.transformToString()) !== body) throw new Error("Gelesener Inhalt stimmt nicht überein");
console.log("✔ Lesen");

await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }));
console.log("✔ Löschen");

if (env.R2_JURISDICTION === "eu") console.log("✔ EU-Jurisdiktion bestätigt (Zugriff über den EU-Endpoint)");
