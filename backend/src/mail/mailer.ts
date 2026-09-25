import type { EmailType } from "@fa/shared";
import type { Types } from "mongoose";
import { env } from "../config/env";
import { logger } from "../lib/logger";
import { EmailLog } from "../models";

export interface MailMessage {
  type: EmailType;
  to: string;
  subject: string;
  text: string;
  html: string;
  userId?: Types.ObjectId;
  customerId?: Types.ObjectId;
}

/**
 * Versand über den konfigurierten Anbieter (Resend oder Konsole) – jede Mail
 * landet im EmailLog. Inhalte mit Token-Links speichert das Modell bewusst nicht.
 * Liefert false bei Fehlschlag, wirft aber nie: Mailprobleme dürfen z. B. eine
 * Registrierung nicht abbrechen.
 */
export async function sendMail(message: MailMessage): Promise<boolean> {
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
    const providerMessageId = env.MAIL_PROVIDER === "resend" ? await sendViaResend(message, String(log._id)) : logToConsole(message);
    await EmailLog.updateOne({ _id: log._id }, { status: "SENT", sentAt: new Date(), providerMessageId });
    return true;
  } catch (error) {
    logger.error({ err: error, emailLogId: String(log._id), type: message.type }, "E-Mail-Versand fehlgeschlagen");
    await EmailLog.updateOne({ _id: log._id }, { status: "FAILED", error: String(error).slice(0, 2000) });
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
    body: JSON.stringify({ from: env.MAIL_FROM, to: [message.to], subject: message.subject, text: message.text, html: message.html }),
    signal: AbortSignal.timeout(10_000),
  });
  const body = (await response.json().catch(() => ({}))) as { id?: string; message?: string };
  if (!response.ok) throw new Error(`Resend ${response.status}: ${body.message ?? "unbekannter Fehler"}`);
  return body.id;
}

/** Entwicklung: Mail samt Links im Log ausgeben statt zu versenden. */
function logToConsole(message: MailMessage): undefined {
  logger.info(`\n✉  E-Mail (${message.type}) an ${message.to}\n   Betreff: ${message.subject}\n\n${message.text}\n`);
  return undefined;
}
