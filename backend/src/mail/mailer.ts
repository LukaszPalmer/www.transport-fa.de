import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { COMPANY, type EmailType } from "@fa/shared";
import type { Types } from "mongoose";
import { env } from "../config/env";
import { logger } from "../lib/logger";
import { EmailLog } from "../models";
import { LOGO_MARK_PNG_BASE64 } from "./assets/logo";
import { LOGO_CID } from "./layout";

export interface MailMessage {
  type: EmailType;
  to: string;
  subject: string;
  text: string;
  html: string;
  userId?: Types.ObjectId;
  customerId?: Types.ObjectId;
}

/** Lokale Vorschau der Mails (gitignored) – im Browser öffnen. */
const PREVIEW_DIR = path.resolve(".mail-preview");

/**
 * Versand über den konfigurierten Anbieter (Resend oder Konsole) – jede Mail
 * landet im EmailLog. Inhalte mit Token-Links speichert das Modell bewusst nicht.
 * Liefert false bei Fehlschlag, wirft aber nie: Mailprobleme dürfen z. B. eine
 * Registrierung nicht abbrechen.
 */
export async function sendMail(message: MailMessage, options: { log?: boolean } = {}): Promise<boolean> {
  if (options.log === false) return sendUnlogged(message);

  const log = await EmailLog.create({
    type: message.type,
    to: message.to,
    subject: message.subject,
    bodyText: message.text,
    userId: message.userId,
    customerId: message.customerId,
    provider: env.MAIL_PROVIDER,
  });

  try {
    const providerMessageId =
      env.MAIL_PROVIDER === "resend" ? await sendViaResend(message, String(log._id)) : writePreview(message, String(log._id));
    await EmailLog.updateOne({ _id: log._id }, { status: "SENT", sentAt: new Date(), providerMessageId });
    return true;
  } catch (error) {
    logger.error({ err: error, emailLogId: String(log._id), type: message.type }, "E-Mail-Versand fehlgeschlagen");
    await EmailLog.updateOne({ _id: log._id }, { status: "FAILED", error: String(error).slice(0, 2000) });
    return false;
  }
}

/** Versand ohne EmailLog – z. B. die Bestätigung einer Kontolöschung. */
async function sendUnlogged(message: MailMessage): Promise<boolean> {
  try {
    if (env.MAIL_PROVIDER === "resend") await sendViaResend(message, `unlogged-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    else writePreview(message, "unlogged");
    return true;
  } catch (error) {
    logger.error({ err: error, type: message.type }, "E-Mail-Versand fehlgeschlagen");
    return false;
  }
}

async function sendViaResend(message: MailMessage, idempotencyKey: string): Promise<string | undefined> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify({
      from: env.MAIL_FROM,
      to: [message.to],
      reply_to: COMPANY.contact.email,
      subject: message.subject,
      text: message.text,
      html: message.html,
      // Logo als eingebettetes Bild: erscheint sofort, ohne „Bilder laden"
      attachments: [{ filename: "fa-transport.png", content: LOGO_MARK_PNG_BASE64, content_type: "image/png", content_id: LOGO_CID }],
    }),
    signal: AbortSignal.timeout(10_000),
  });
  const body = (await response.json().catch(() => ({}))) as { id?: string; message?: string };
  if (!response.ok) throw new Error(`Resend ${response.status}: ${body.message ?? "unbekannter Fehler"}`);
  return body.id;
}

/** Entwicklung: Mail ins Log und als HTML-Vorschau in .mail-preview/ statt zu versenden. */
function writePreview(message: MailMessage, id: string): undefined {
  mkdirSync(PREVIEW_DIR, { recursive: true });
  const file = path.join(PREVIEW_DIR, `${new Date().toISOString().replace(/[:.]/g, "-")}-${message.type.toLowerCase()}-${id.slice(-6)}.html`);
  writeFileSync(file, message.html.replaceAll(`cid:${LOGO_CID}`, `data:image/png;base64,${LOGO_MARK_PNG_BASE64}`));
  logger.info(
    `\n✉  E-Mail (${message.type}) an ${message.to}\n   Betreff: ${message.subject}\n   Vorschau: ${file}\n\n${message.text}\n`,
  );
  return undefined;
}
