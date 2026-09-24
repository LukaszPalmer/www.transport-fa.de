import "server-only";
import nodemailer, { type Transporter } from "nodemailer";

/**
 * E-Mail-Versand über SMTP (z. B. IONOS, Strato, Microsoft 365, Mailjet).
 * Ohne SMTP_HOST werden Mails in der Entwicklung nur protokolliert, damit
 * alle Formulare und Portal-Flows lokal testbar sind. In Produktion ist
 * fehlende Konfiguration ein Fehler.
 */
export interface MailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
  attachments?: Array<{ filename: string; content: Buffer; contentType?: string }>;
}

export type MailResult = { ok: true; simulated?: boolean } | { ok: false };

let transporter: Transporter | null | undefined;

function getTransporter(): Transporter | null {
  if (transporter !== undefined) return transporter;
  const host = process.env.SMTP_HOST;
  transporter = host
    ? nodemailer.createTransport({
        host,
        port: Number(process.env.SMTP_PORT ?? 587),
        secure: process.env.SMTP_SECURE === "true",
        auth: process.env.SMTP_USER
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
          : undefined,
      })
    : null;
  return transporter;
}

export const mailRecipients = {
  contact: process.env.MAIL_TO_CONTACT ?? "kontakt@transport-fa.de",
  careers: process.env.MAIL_TO_CAREERS ?? "kontakt@transport-fa.de",
};

export async function sendMail(message: MailMessage): Promise<MailResult> {
  const transport = getTransporter();

  if (!transport) {
    if (process.env.NODE_ENV !== "production") {
      const files = message.attachments?.map((file) => `${file.filename} (${file.content.byteLength} B)`);
      console.info(
        `\n[mail:dev] An: ${message.to}\n[mail:dev] Betreff: ${message.subject}\n` +
          (files?.length ? `[mail:dev] Anhänge: ${files.join(", ")}\n` : "") +
          `${message.text}\n`,
      );
      return { ok: true, simulated: true };
    }
    console.error("[mail] SMTP_HOST ist nicht gesetzt – E-Mail wurde nicht versendet.");
    return { ok: false };
  }

  try {
    await transport.sendMail({
      // IONOS-SMTP akzeptiert nur das eigene Postfach als Absender.
      from: process.env.MAIL_FROM ?? "FA Transport <kontakt@transport-fa.de>",
      ...message,
    });
    return { ok: true };
  } catch (error) {
    console.error("[mail] Versand fehlgeschlagen:", error);
    return { ok: false };
  }
}

/** HTML-Escaping für Nutzereingaben in E-Mail-Templates. */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}

/** Einfaches, markengerechtes HTML-Layout für Formular-E-Mails. */
export function renderMailTable(title: string, rows: Array<[string, string | undefined]>): string {
  const body = rows
    .filter(([, value]) => value)
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px 16px 8px 0;color:#62748e;vertical-align:top;white-space:nowrap">${escapeHtml(label)}</td>` +
        `<td style="padding:8px 0;color:#0b132b;white-space:pre-wrap">${escapeHtml(value ?? "")}</td></tr>`,
    )
    .join("");
  return (
    `<div style="font-family:Arial,sans-serif;max-width:640px">` +
    `<div style="background:#0b132b;color:#fff;padding:20px 24px;border-radius:12px 12px 0 0;font-size:18px;font-weight:bold">${escapeHtml(title)}</div>` +
    `<table style="width:100%;border-collapse:collapse;padding:16px 24px;display:block;border:1px solid #e2e8f0;border-top:0;border-radius:0 0 12px 12px">${body}</table></div>`
  );
}
