import { createHash } from "node:crypto";
import {
  computeInvoiceTotals,
  InvoiceDraftInput,
  invoiceIssueProblems,
  type AdminInvoiceDraftRow,
  type InvoiceAddress,
  type InvoiceDraftContent,
  type InvoiceEditorContext,
  type InvoiceMailResult,
  type PaymentMethod,
  type Role,
} from "@fa/shared";
import { Types } from "mongoose";
import { env, isProduction } from "../config/env";
import { AppError } from "../http/errors";
import { berlinToday, buildInvoiceData } from "../invoicing/build";
import { buildCiiXml } from "../invoicing/cii";
import { renderInvoicePdf } from "../invoicing/pdf";
import { sellerWarnings } from "../invoicing/seller";
import type { EInvoiceData } from "../invoicing/types";
import { logger } from "../lib/logger";
import { sendMail } from "../mail/mailer";
import { invoiceDeliveryMail } from "../mail/templates";
import {
  Counter,
  CustomerProfile,
  DocumentModel,
  Invoice,
  InvoiceDraft,
  nextSequence,
  Shipment,
  User,
  type IInvoice,
  type IInvoiceDraft,
} from "../models";
import { customerPrefix, deleteObject, getObjectBuffer, putObject } from "../storage/r2";
import { calendarDay } from "./invoices";

/**
 * Rechnungen im Portal erstellen: Entwurf → Vorschau → Versand. Beim Versand entsteht eine
 * unveränderliche E-Rechnung (ZUGFeRD-PDF in R2 + eingefrorene Daten), der Kunde bekommt sie
 * per E-Mail (PDF im Anhang) und sieht sie sofort im Kundenportal.
 */

const euro = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });
const day = (isoDay: string) => isoDay.split("-").reverse().join(".");

/** Nach so langer Zeit gilt ein hängengebliebener Versand als abgebrochen. */
const ISSUE_LOCK_MS = 2 * 60 * 1000;

export const invoiceFileName = (number: string) => `Rechnung_${number}.pdf`;

function formatNumber(year: string, sequence: number): string {
  return `RE-${year}-${String(sequence).padStart(5, "0")}`;
}

/** Nächste Rechnungsnummer, fortlaufend je Jahr. Nummern, die ein Beleg-Upload schon belegt, werden übersprungen. */
async function allocateInvoiceNumber(year: string): Promise<string> {
  for (let attempt = 0; attempt < 20; attempt++) {
    const number = formatNumber(year, await nextSequence(`invoice:${year}`));
    if (!(await Invoice.exists({ type: "INVOICE", number }))) return number;
  }
  throw new Error("Keine freie Rechnungsnummer gefunden");
}

/** Voraussichtliche nächste Nummer – nur zur Anzeige im Editor. */
export async function peekInvoiceNumber(): Promise<string> {
  const year = berlinToday().slice(0, 4);
  const counter = await Counter.findById(`invoice:${year}`).lean();
  return formatNumber(year, (counter?.seq ?? 0) + 1);
}

function customerName(customer: { companyName?: string; firstName: string; lastName: string }): string {
  return customer.companyName || `${customer.firstName} ${customer.lastName}`;
}

/** Nur bestätigte, aktive Konten bekommen Rechnungen per Mail – sonst ginge sie womöglich an ein fremdes Postfach. */
function mailBlockedReason(user: { state: string; emailVerifiedAt?: Date } | null): string | undefined {
  if (!user) return "Zum Kunden gibt es kein Benutzerkonto.";
  if (user.state !== "ACTIVE") return "Das Kundenkonto ist nicht aktiv.";
  if (!user.emailVerifiedAt) return "Der Kunde hat seine E-Mail-Adresse noch nicht bestätigt.";
  return undefined;
}

const toAddress = (address: InvoiceAddress): InvoiceAddress => ({
  line1: address.line1,
  line2: address.line2,
  postalCode: address.postalCode,
  city: address.city,
  countryCode: address.countryCode,
});

// --- Editor -----------------------------------------------------------------------------------

export async function invoiceEditorContext(customerId: Types.ObjectId): Promise<InvoiceEditorContext> {
  const profile = await CustomerProfile.findById(customerId).lean();
  if (!profile) throw AppError.notFound("Kunde nicht gefunden.");
  const [user, shipments, nextNumber] = await Promise.all([
    User.findById(profile.userId).select("email emailVerifiedAt state").lean(),
    Shipment.find({ customerId, status: { $ne: "CANCELLED" } }).sort({ createdAt: -1 }).limit(50).lean(),
    peekInvoiceNumber(),
  ]);
  const invoiced = shipments.length
    ? await Invoice.find({ shipmentId: { $in: shipments.map((shipment) => shipment._id) }, type: "INVOICE", paymentStatus: { $ne: "CANCELLED" } })
        .select("shipmentId number")
        .lean()
    : [];
  const invoicedAs = new Map(invoiced.map((invoice) => [String(invoice.shipmentId), invoice.number]));

  return {
    customer: {
      id: String(profile._id),
      customerNumber: profile.customerNumber,
      type: profile.type,
      firstName: profile.firstName,
      lastName: profile.lastName,
      companyName: profile.companyName,
      vatId: profile.vatId,
      email: user?.email ?? "",
      billingAddress: profile.billingAddress ? toAddress(profile.billingAddress) : undefined,
      mailBlockedReason: mailBlockedReason(user),
    },
    shipments: shipments.map((shipment) => {
      const serviceDate = shipment.deliveredAt ?? shipment.plannedDeliveryAt ?? shipment.plannedPickupAt;
      return {
        id: String(shipment._id),
        shipmentNumber: shipment.shipmentNumber,
        service: shipment.service,
        status: shipment.status,
        pickup: toAddress(shipment.pickup.address),
        delivery: toAddress(shipment.delivery.address),
        customerReference: shipment.customerReference,
        serviceDate: serviceDate ? berlinToday(serviceDate) : undefined,
        invoicedAs: invoicedAs.get(String(shipment._id)),
      };
    }),
    sellerWarnings: sellerWarnings(),
    nextNumber,
  };
}

/** Prüft Kunde und Auftrag eines Entwurfs – der Auftrag muss zum Kunden gehören. */
export async function assertDraftTargets(content: InvoiceDraftContent): Promise<void> {
  if (!(await CustomerProfile.exists({ _id: content.customerId }))) throw AppError.validation({ customerId: "Kunde nicht gefunden." });
  if (content.shipmentId && !(await Shipment.exists({ _id: content.shipmentId, customerId: content.customerId }))) {
    throw AppError.validation({ shipmentId: "Dieser Auftrag gehört zu einem anderen Kunden." });
  }
}

export async function toDraftRows(drafts: IInvoiceDraft[]): Promise<AdminInvoiceDraftRow[]> {
  if (drafts.length === 0) return [];
  const [customers, shipments, users] = await Promise.all([
    CustomerProfile.find({ _id: { $in: drafts.map((draft) => draft.customerId) } }).select("customerNumber firstName lastName companyName").lean(),
    Shipment.find({ _id: { $in: drafts.flatMap((draft) => (draft.shipmentId ? [draft.shipmentId] : [])) } }).select("shipmentNumber").lean(),
    User.find({ _id: { $in: drafts.map((draft) => draft.updatedById) } }).select("name").lean(),
  ]);
  const customerById = new Map(customers.map((customer) => [String(customer._id), customer]));
  const shipmentById = new Map(shipments.map((shipment) => [String(shipment._id), shipment]));
  const userById = new Map(users.map((user) => [String(user._id), user]));

  return drafts.map((draft) => {
    const customer = customerById.get(String(draft.customerId));
    const shipment = draft.shipmentId ? shipmentById.get(String(draft.shipmentId)) : undefined;
    const content = InvoiceDraftInput.parse(draft.content);
    return {
      id: String(draft._id),
      customer: {
        id: String(draft.customerId),
        customerNumber: customer?.customerNumber ?? "–",
        name: customer ? customerName(customer) : "Gelöschter Kunde",
      },
      shipment: shipment ? { id: String(shipment._id), shipmentNumber: shipment.shipmentNumber } : undefined,
      grossCents: computeInvoiceTotals(content.lines, content.taxTreatment).grossCents,
      lineCount: content.lines.length,
      updatedAt: draft.updatedAt.toISOString(),
      updatedBy: userById.get(String(draft.updatedById))?.name,
    };
  });
}

/** Vorschau-PDF eines Entwurfs: Wasserzeichen, noch ohne Nummer – Rechnungsdatum wäre heute. */
export async function renderDraftPreview(draft: IInvoiceDraft): Promise<Buffer> {
  const content = InvoiceDraftInput.parse(draft.content);
  const profile = await CustomerProfile.findById(draft.customerId).select("customerNumber userId").lean();
  const [user, shipment] = await Promise.all([
    profile ? User.findById(profile.userId).select("email").lean() : null,
    content.shipmentId ? Shipment.findById(content.shipmentId).select("shipmentNumber").lean() : null,
  ]);
  const data = buildInvoiceData({
    content,
    number: "Entwurf",
    issueDate: berlinToday(),
    customerNumber: profile?.customerNumber ?? "–",
    email: user?.email ?? "",
    shipmentNumber: shipment?.shipmentNumber,
  });
  return renderInvoicePdf(data, { draft: true });
}

// --- Versand ------------------------------------------------------------------------------------

export interface IssueResult {
  invoice: IInvoice;
  mail: InvoiceMailResult;
}

/**
 * Entwurf → Rechnung. Reihenfolge: sperren → prüfen → Nummer → PDF (mit XML) nach R2 →
 * Document + Invoice anlegen → Entwurf löschen → Mail. Scheitert etwas vor dem Anlegen der
 * Rechnung, bleibt der Entwurf erhalten und nichts ist halb gespeichert.
 */
export async function issueInvoiceFromDraft(
  draftId: Types.ObjectId,
  staff: { userId: Types.ObjectId; role: Role },
  options: { sendEmail: boolean; paidWith?: PaymentMethod },
): Promise<IssueResult> {
  const now = new Date();
  const draft = await InvoiceDraft.findOneAndUpdate(
    { _id: draftId, $or: [{ issuingAt: { $exists: false } }, { issuingAt: { $lt: new Date(now.getTime() - ISSUE_LOCK_MS) } }] },
    { $set: { issuingAt: now } },
    { returnDocument: "after" },
  ).lean();
  if (!draft) {
    if (await InvoiceDraft.exists({ _id: draftId })) throw AppError.conflict("Diese Rechnung wird gerade versendet.");
    throw AppError.notFound("Entwurf nicht gefunden – wurde die Rechnung schon versendet?");
  }

  try {
    const { invoice, pdf } = await createInvoice(draft, staff, options.paidWith);
    await InvoiceDraft.deleteOne({ _id: draft._id });
    const mail: InvoiceMailResult = options.sendEmail
      ? await deliverInvoiceMail(invoice, pdf, staff.userId)
      : { status: "SKIPPED", reason: "Versand per E-Mail wurde nicht gewählt." };
    return { invoice, mail };
  } catch (error) {
    await InvoiceDraft.updateOne({ _id: draft._id }, { $unset: { issuingAt: "" } }).catch(() => undefined);
    throw error;
  }
}

async function createInvoice(
  draft: IInvoiceDraft,
  staff: { userId: Types.ObjectId; role: Role },
  paidWith?: PaymentMethod,
): Promise<{ invoice: IInvoice; pdf: Buffer }> {
  const content = InvoiceDraftInput.parse(draft.content);
  const problems = invoiceIssueProblems(content);
  if (Object.keys(problems).length > 0) throw AppError.validation(problems, "Die Rechnung ist noch nicht vollständig.");

  const warnings = sellerWarnings();
  if (isProduction && warnings.length > 0) {
    throw new AppError(409, "CONFLICT", `Die Firmendaten sind noch unvollständig (${warnings.join(", ")}). Bitte zuerst die echten Daten hinterlegen lassen.`);
  }

  const profile = await CustomerProfile.findById(content.customerId).lean();
  if (!profile) throw AppError.validation({ customerId: "Kunde nicht gefunden." });
  const user = await User.findById(profile.userId).select("email").lean();
  const shipment = content.shipmentId ? await Shipment.findOne({ _id: content.shipmentId, customerId: profile._id }).select("shipmentNumber").lean() : null;
  if (content.shipmentId && !shipment) throw AppError.validation({ shipmentId: "Dieser Auftrag gehört zu einem anderen Kunden." });

  const issueDate = berlinToday();
  const number = await allocateInvoiceNumber(issueDate.slice(0, 4));
  const data = buildInvoiceData({
    content,
    number,
    issueDate,
    customerNumber: profile.customerNumber,
    email: user?.email ?? "",
    shipmentNumber: shipment?.shipmentNumber,
    paidWith,
  });
  const pdf = await renderInvoicePdf(data, { xml: buildCiiXml(data, "EN16931") });

  const documentId = new Types.ObjectId();
  const key = `${customerPrefix(String(profile._id))}${documentId}.pdf`;
  await putObject(key, pdf, "application/pdf");

  let documentCreated = false;
  try {
    await DocumentModel.create({
      _id: documentId,
      customerId: profile._id,
      shipmentId: shipment?._id,
      category: "INVOICE",
      title: `Rechnung ${number}`,
      visibility: "CUSTOMER",
      uploadedById: staff.userId,
      uploadedByRole: staff.role,
      handToDriver: false,
      storage: {
        key,
        originalName: invoiceFileName(number),
        mimeType: "application/pdf",
        sizeBytes: pdf.length,
        sha256: createHash("sha256").update(pdf).digest("hex"),
      },
      status: "READY",
    });
    documentCreated = true;

    const invoice = await Invoice.create({
      type: "INVOICE",
      source: "GENERATED",
      number,
      customerId: profile._id,
      shipmentId: shipment?._id,
      documentId,
      netCents: data.netCents,
      vatCents: data.vatCents,
      grossCents: data.grossCents,
      issueDate: calendarDay(issueDate),
      dueDate: calendarDay(data.dueDate, true),
      paymentStatus: paidWith ? "PAID" : "PENDING",
      paymentMethod: paidWith,
      paidAt: paidWith ? new Date() : undefined,
      einvoice: data,
      createdById: staff.userId,
    });

    // Rechnungsadresse und USt-IdNr. fürs nächste Mal merken, falls im Profil noch nichts steht.
    const { buyer } = content;
    const remember: Record<string, unknown> = {};
    if (!profile.billingAddress && buyer.line1 && buyer.postalCode && buyer.city) {
      remember.billingAddress = { line1: buyer.line1, line2: buyer.line2, postalCode: buyer.postalCode, city: buyer.city, countryCode: buyer.countryCode };
    }
    if (!profile.vatId && buyer.vatId) remember.vatId = buyer.vatId;
    if (Object.keys(remember).length > 0) {
      await CustomerProfile.updateOne({ _id: profile._id }, { $set: remember }).catch((error: unknown) =>
        logger.warn({ err: error }, "Rechnungsadresse konnte nicht im Profil gespeichert werden"),
      );
    }
    return { invoice, pdf };
  } catch (error) {
    if (documentCreated) await DocumentModel.deleteOne({ _id: documentId }).catch(() => undefined);
    await deleteObject(key).catch(() => undefined);
    throw error;
  }
}

/** PDF per E-Mail an den Kunden – beim Versand und für „Erneut senden“. Wirft nie. */
export async function deliverInvoiceMail(invoice: Pick<IInvoice, "_id" | "customerId" | "documentId">, pdf: Buffer, sentById: Types.ObjectId): Promise<InvoiceMailResult> {
  try {
    const stored = await Invoice.findById(invoice._id).select("+einvoice").lean();
    const data: EInvoiceData | undefined = stored?.einvoice;
    const profile = await CustomerProfile.findById(invoice.customerId).select("userId firstName").lean();
    const user = profile ? await User.findById(profile.userId).select("email emailVerifiedAt state").lean() : null;
    const blocked = mailBlockedReason(user);
    if (!stored || !data || !profile || !user || blocked) return { status: "SKIPPED", to: user?.email, reason: blocked ?? "Rechnung nicht gefunden." };

    const due = data.grossCents - (data.prepaid?.cents ?? 0);
    const mail = invoiceDeliveryMail({
      greetingName: profile.firstName,
      number: data.number,
      issueDate: day(data.issueDate),
      amount: euro.format(data.grossCents / 100),
      payment:
        due > 0
          ? { dueDate: day(data.dueDate), iban: data.seller.bank.iban.replace(/(.{4})(?=.)/g, "$1 "), accountHolder: data.seller.name }
          : { paidNote: `Bereits bezahlt (${data.prepaid?.method === "CASH" ? "bar" : "per Überweisung"}) – vielen Dank!` },
      shipmentNumber: data.shipmentNumber,
      fileName: invoiceFileName(data.number),
      url: new URL(`/kundenportal/rechnungen?beleg=${String(invoice._id)}`, env.FRONTEND_URL).toString(),
    });

    const sent = await sendMail({
      type: "INVOICE_ISSUED",
      to: user.email,
      userId: user._id,
      customerId: profile._id,
      invoiceId: invoice._id,
      documentIds: [invoice.documentId],
      sentById,
      attachments: [{ filename: invoiceFileName(data.number), content: pdf, contentType: "application/pdf" }],
      ...mail,
    });
    if (!sent) return { status: "FAILED", to: user.email, reason: "Der E-Mail-Versand ist fehlgeschlagen. Bitte später erneut senden." };
    await Invoice.updateOne({ _id: invoice._id }, { emailedAt: new Date(), emailedTo: user.email });
    return { status: "SENT", to: user.email };
  } catch (error) {
    logger.error({ err: error, invoiceId: String(invoice._id) }, "Rechnungs-Mail fehlgeschlagen");
    return { status: "FAILED", reason: "Der E-Mail-Versand ist fehlgeschlagen. Bitte später erneut senden." };
  }
}

/** „Erneut senden“ – lädt die archivierte PDF aus R2, damit exakt dieselbe Rechnung rausgeht. */
export async function resendInvoiceMail(invoice: IInvoice, sentById: Types.ObjectId): Promise<InvoiceMailResult> {
  if (invoice.source !== "GENERATED") throw AppError.badRequest("Nur im Portal erstellte Rechnungen können per E-Mail gesendet werden.");
  const document = await DocumentModel.findOne({ _id: invoice.documentId, status: "READY" }).select("storage.key").lean();
  if (!document) throw AppError.notFound("Die PDF zu dieser Rechnung fehlt.");
  return deliverInvoiceMail(invoice, await getObjectBuffer(document.storage.key), sentById);
}

/** XRechnung-XML (CII) einer erstellten Rechnung – aus den beim Versand eingefrorenen Daten. */
export async function invoiceXml(invoiceId: Types.ObjectId, customerId?: Types.ObjectId): Promise<{ xml: string; fileName: string }> {
  const invoice = await Invoice.findOne({ _id: invoiceId, ...(customerId ? { customerId } : {}) })
    .select("+einvoice source number")
    .lean();
  if (!invoice) throw AppError.notFound("Beleg nicht gefunden.");
  if (invoice.source !== "GENERATED" || !invoice.einvoice) throw AppError.notFound("Zu diesem Beleg gibt es keine E-Rechnung als XML.");
  return { xml: buildCiiXml(invoice.einvoice, "XRECHNUNG"), fileName: `Rechnung_${invoice.number}_XRechnung.xml` };
}
