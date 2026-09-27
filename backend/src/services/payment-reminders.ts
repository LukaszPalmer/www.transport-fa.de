import { COMPANY, effectivePaymentStatus, PAYMENT_REMINDER_LABEL, type PaymentReminderResult } from "@fa/shared";
import type { Types } from "mongoose";
import { env } from "../config/env";
import { AppError } from "../http/errors";
import { addDays, berlinToday } from "../invoicing/build";
import { amountDueCents, type EInvoiceData } from "../invoicing/types";
import { mailFormats } from "../lib/locale";
import { sendMail } from "../mail/mailer";
import { paymentReminderMail } from "../mail/templates";
import { CustomerProfile, DocumentModel, Invoice, User, type IInvoice } from "../models";
import { getObjectBuffer } from "../storage/r2";

/**
 * Zahlungserinnerung und Mahnungen für überfällige Rechnungen: Stufe 1 = freundliche Erinnerung,
 * Stufe 2 = 1. Mahnung, Stufe 3 = 2. Mahnung. Jede Stufe setzt eine neue Frist von 7 Tagen und hängt
 * die Rechnung als PDF an. Auch Kunden, die ihr Konto gelöscht haben, können gemahnt werden – dann an
 * die Adresse, an die die Rechnung ging.
 */

const NEW_DEADLINE_DAYS = 7;

export async function sendPaymentReminder(invoiceId: Types.ObjectId, sentById: Types.ObjectId): Promise<{ result: PaymentReminderResult; invoice: IInvoice }> {
  const invoice = await Invoice.findById(invoiceId).select("+einvoice");
  if (!invoice) throw AppError.notFound("Beleg nicht gefunden.");
  if (invoice.type !== "INVOICE") throw AppError.badRequest("Nur Rechnungen können angemahnt werden.");
  if (effectivePaymentStatus(invoice.paymentStatus, invoice.dueDate) !== "OVERDUE") throw AppError.badRequest("Die Rechnung ist nicht überfällig.");

  const current = invoice.reminders?.at(-1)?.level ?? 0;
  if (current >= 3) throw AppError.conflict("Es wurden bereits alle Mahnstufen gesendet. Bitte das weitere Vorgehen mit der Buchhaltung klären.");
  const level = (current + 1) as 1 | 2 | 3;

  const profile = await CustomerProfile.findById(invoice.customerId).select("userId firstName lastName companyName type locale").lean();
  const user = profile ? await User.findById(profile.userId).select("email state emailVerifiedAt").lean() : null;
  const data = invoice.einvoice as EInvoiceData | undefined;
  const to = user?.state === "ACTIVE" && user.emailVerifiedAt ? user.email : (invoice.emailedTo ?? data?.buyer.email);
  if (!to) throw AppError.badRequest("Für diese Rechnung ist keine E-Mail-Adresse bekannt.");

  const document = await DocumentModel.findOne({ _id: invoice.documentId, status: "READY" }).select("storage").lean();
  const pdf = document ? await getObjectBuffer(document.storage.key).catch(() => null) : null;

  const today = berlinToday();
  const dueCents = data ? amountDueCents(data) : invoice.grossCents;
  const greetingName = profile
    ? profile.type === "BUSINESS" && profile.companyName
      ? ""
      : profile.firstName
    : (data?.buyer.name?.split(" ")[0] ?? "");
  const locale = profile?.locale ?? "de";
  const format = mailFormats(locale);
  const mail = paymentReminderMail({
    locale,
    level,
    greetingName,
    number: invoice.number,
    issueDate: format.isoDay(invoice.issueDate.toISOString().slice(0, 10)),
    dueDate: invoice.dueDate ? format.isoDay(berlinToday(invoice.dueDate)) : "–",
    amount: format.euro(dueCents),
    iban: COMPANY.bank.iban,
    accountHolder: COMPANY.legalName,
    newDueDate: format.isoDay(addDays(today, NEW_DEADLINE_DAYS)),
    url: profile ? `${env.FRONTEND_URL}/kundenportal/rechnungen` : undefined,
  });

  const sent = await sendMail({
    type: "PAYMENT_REMINDER",
    to,
    ...mail,
    userId: profile?.userId,
    customerId: profile?._id,
    invoiceId: invoice._id,
    documentIds: document ? [document._id] : [],
    sentById,
    attachments: pdf && document ? [{ filename: document.storage.originalName, content: pdf, contentType: "application/pdf" }] : [],
  });
  if (!sent) throw new AppError(502, "INTERNAL", `${PAYMENT_REMINDER_LABEL[level]} konnte nicht gesendet werden. Bitte später erneut versuchen.`);

  const sentAt = new Date();
  invoice.reminders = [...(invoice.reminders ?? []), { level, sentAt, sentTo: to }];
  await invoice.save();
  return { result: { level, sentTo: to, sentAt: sentAt.toISOString() }, invoice };
}
