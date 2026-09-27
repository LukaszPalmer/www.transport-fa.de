import {
  AccountingPeriodQuery,
  SendAccountingExportInput,
  type AccountingExportRow,
  type AccountingSummary,
  type AccountingSourceFilter,
} from "@fa/shared";
import { Router, type Request, type Response } from "express";
import { datevBookingBatch, withinOneFiscalYear } from "../../accounting/datev";
import { journalCsv } from "../../accounting/csv";
import { buildJournal, toJournalRow, type Journal } from "../../accounting/journal";
import { accountingPackageBuffer, packageFileName, writeAccountingPackage } from "../../accounting/package";
import { datevReady, loadAccountingSettings, saveAccountingSettings } from "../../accounting/settings";
import { requirePermission } from "../../auth/middleware";
import { AppError } from "../../http/errors";
import { audit } from "../../lib/audit";
import { sendMail } from "../../mail/mailer";
import { accountingExportMail } from "../../mail/templates";
import { AccountingExport, StaffProfile, type IAccountingExport } from "../../models";

/**
 * /api/v1/admin/accounting – Buchhaltung: Auswertung je Zeitraum, DATEV-Buchungsstapel,
 * Rechnungsausgangsbuch, Belegpaket (ZIP) und Versand an die Steuerberatung.
 */
export const adminAccountingRouter = Router();

adminAccountingRouter.use(requirePermission("can_manage_accounting"));

/** Resend nimmt bis 40 MB – mit Base64-Aufschlag bleiben wir sicher darunter. */
const MAX_MAIL_ZIP_BYTES = 25 * 1024 * 1024;
const euro = (cents: number) => `${(cents / 100).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
const germanDate = (day: string) => `${day.slice(8, 10)}.${day.slice(5, 7)}.${day.slice(0, 4)}`;

function periodOf(req: Request) {
  return AccountingPeriodQuery.parse(req.query);
}

async function exporterName(req: Request): Promise<string> {
  const profile = await StaffProfile.findOne({ userId: req.auth!.user.id }).select("displayName").lean();
  return profile?.displayName ?? req.auth!.user.name;
}

function revenueTotal(journal: Journal): { count: number; grossCents: number } {
  let grossCents = 0;
  for (const entry of journal.entries) if (!entry.cancelled) grossCents += (entry.type === "CREDIT_NOTE" ? -1 : 1) * entry.grossCents;
  return { count: journal.entries.length, grossCents };
}

async function recordExport(
  req: Request,
  kind: IAccountingExport["kind"],
  journal: Journal,
  source: AccountingSourceFilter,
  sentTo?: string,
): Promise<void> {
  const { count, grossCents } = revenueTotal(journal);
  await AccountingExport.create({ kind, from: journal.from, to: journal.to, source, count, grossCents, createdById: req.auth!.user.id, sentTo });
  audit(req, "accounting.exported", { meta: { kind, from: journal.from, to: journal.to, count, sentTo } });
}

async function recentExports(): Promise<AccountingExportRow[]> {
  const exports = await AccountingExport.find().sort({ createdAt: -1 }).limit(20).lean();
  const names = new Map(
    (await StaffProfile.find({ userId: { $in: exports.flatMap((entry) => (entry.createdById ? [entry.createdById] : [])) } }).select("userId displayName").lean()).map(
      (profile) => [String(profile.userId), profile.displayName],
    ),
  );
  return exports.map((entry) => ({
    id: String(entry._id),
    kind: entry.kind,
    from: entry.from,
    to: entry.to,
    count: entry.count,
    grossCents: entry.grossCents,
    by: entry.createdById ? names.get(String(entry.createdById)) : undefined,
    sentTo: entry.sentTo,
    createdAt: entry.createdAt.toISOString(),
  }));
}

function attachment(res: Response, fileName: string, contentType: string) {
  res.set({
    "Content-Type": contentType,
    "Content-Disposition": `attachment; filename="${fileName}"`,
    "Cache-Control": "no-store",
  });
}

// --- Einstellungen ------------------------------------------------------------------------

adminAccountingRouter.get("/settings", async (_req, res) => {
  res.json(await loadAccountingSettings());
});

adminAccountingRouter.put("/settings", async (req, res) => {
  const settings = await saveAccountingSettings(req.body, req.auth!.user.id);
  audit(req, "accounting.settings_updated", { meta: { chart: settings.chart, debtorMode: settings.debtorMode } });
  res.json(settings);
});

// --- Auswertung ---------------------------------------------------------------------------

adminAccountingRouter.get("/summary", async (req, res) => {
  const period = periodOf(req);
  const settings = await loadAccountingSettings();
  const journal = await buildJournal(period, settings);

  const totals: AccountingSummary["totals"] = {
    count: journal.entries.length,
    invoiceCount: journal.entries.filter((entry) => entry.type === "INVOICE").length,
    creditNoteCount: journal.entries.filter((entry) => entry.type === "CREDIT_NOTE").length,
    cancelledCount: journal.entries.filter((entry) => entry.cancelled).length,
    netCents: 0,
    vatCents: 0,
    grossCents: 0,
    paidGrossCents: 0,
    openGrossCents: 0,
    cashGrossCents: journal.cashPayments.reduce((sum, payment) => sum + payment.grossCents, 0),
  };
  const months = new Map<string, { month: string; netCents: number; vatCents: number; grossCents: number; count: number }>();
  for (const entry of journal.entries) {
    if (entry.cancelled) continue;
    const sign = entry.type === "CREDIT_NOTE" ? -1 : 1;
    totals.netCents += sign * entry.netCents;
    totals.vatCents += sign * entry.vatCents;
    totals.grossCents += sign * entry.grossCents;
    if (entry.type === "INVOICE" && entry.paymentStatus === "PAID") totals.paidGrossCents += entry.grossCents;
    if (entry.type === "INVOICE" && (entry.paymentStatus === "PENDING" || entry.paymentStatus === "OVERDUE")) totals.openGrossCents += entry.grossCents;
    const key = entry.issueDate.slice(0, 7);
    const month = months.get(key) ?? { month: key, netCents: 0, vatCents: 0, grossCents: 0, count: 0 };
    month.netCents += sign * entry.netCents;
    month.vatCents += sign * entry.vatCents;
    month.grossCents += sign * entry.grossCents;
    month.count += 1;
    months.set(key, month);
  }

  const warnings = [...journal.warnings];
  if (!datevReady(settings)) warnings.unshift("Für den DATEV-Export fehlen Berater- und Mandantennummer (Einstellungen).");
  if (!withinOneFiscalYear(period.from, period.to, settings)) warnings.unshift("Der Zeitraum umfasst mehrere Wirtschaftsjahre – DATEV-Export bitte je Wirtschaftsjahr.");

  const body: AccountingSummary = {
    period: { from: period.from, to: period.to, source: journal.source },
    totals,
    byTax: journal.byTax,
    months: [...months.values()].sort((a, b) => a.month.localeCompare(b.month)),
    journal: journal.entries.slice(0, 2000).map(toJournalRow),
    warnings,
    settings,
    settingsComplete: datevReady(settings),
    exports: await recentExports(),
  };
  res.json(body);
});

// --- Exporte ------------------------------------------------------------------------------

/** DATEV-Buchungsstapel (EXTF 700) – Import in DATEV Rechnungswesen / Unternehmen online. */
adminAccountingRouter.get("/datev", async (req, res) => {
  const period = periodOf(req);
  const settings = await loadAccountingSettings();
  if (!datevReady(settings)) throw AppError.badRequest("Bitte zuerst Berater- und Mandantennummer in den Einstellungen hinterlegen.");
  if (!withinOneFiscalYear(period.from, period.to, settings)) throw AppError.badRequest("Ein DATEV-Buchungsstapel darf nur ein Wirtschaftsjahr umfassen. Bitte den Zeitraum teilen.");
  const journal = await buildJournal(period, settings);
  if (journal.bookings.length === 0) throw AppError.badRequest("Im gewählten Zeitraum gibt es keine Buchungen.");

  const file = datevBookingBatch({ bookings: journal.bookings, settings, from: period.from, to: period.to, exportedBy: await exporterName(req) });
  await recordExport(req, "DATEV", journal, period.source);
  attachment(res, `EXTF_Buchungsstapel_${period.from}_${period.to}.csv`, "text/csv; charset=windows-1252");
  res.send(file);
});

/** Rechnungsausgangsbuch als CSV (Excel). */
adminAccountingRouter.get("/journal.csv", async (req, res) => {
  const period = periodOf(req);
  const journal = await buildJournal(period, await loadAccountingSettings());
  await recordExport(req, "JOURNAL", journal, period.source);
  attachment(res, `Rechnungsausgangsbuch_${period.from}_${period.to}.csv`, "text/csv; charset=utf-8");
  res.send(journalCsv(journal));
});

/** Belegpaket (ZIP) – wird direkt gestreamt. */
adminAccountingRouter.get("/package", async (req, res) => {
  const period = periodOf(req);
  const settings = await loadAccountingSettings();
  const journal = await buildJournal(period, settings);
  if (journal.entries.length === 0) throw AppError.badRequest("Im gewählten Zeitraum gibt es keine Rechnungen oder Gutschriften.");

  const exportedBy = await exporterName(req);
  attachment(res, packageFileName(period.from, period.to), "application/zip");
  await writeAccountingPackage(journal, settings, exportedBy, (chunk, final) => {
    res.write(chunk);
    if (final) res.end();
  });
  await recordExport(req, "ZIP", journal, period.source);
});

/** Belegpaket per E-Mail an die Steuerberatung (oder eine andere Adresse). */
adminAccountingRouter.post("/send", async (req, res) => {
  const input = SendAccountingExportInput.parse(req.body);
  const settings = await loadAccountingSettings();
  const to = input.email ?? settings.accountantEmail;
  if (!to) throw AppError.validation({ email: "Bitte eine E-Mail-Adresse angeben oder die Steuerberatung in den Einstellungen hinterlegen." });
  if (input.from > input.to) throw AppError.validation({ to: "Das Enddatum liegt vor dem Startdatum." });

  const journal = await buildJournal({ from: input.from, to: input.to, source: input.source }, settings);
  if (journal.entries.length === 0) throw AppError.badRequest("Im gewählten Zeitraum gibt es keine Rechnungen oder Gutschriften.");

  const senderName = await exporterName(req);
  const zip = await accountingPackageBuffer(journal, settings, senderName);
  if (zip.length > MAX_MAIL_ZIP_BYTES) {
    throw AppError.badRequest("Das Belegpaket ist für eine E-Mail zu groß. Bitte herunterladen und z. B. über DATEV Unternehmen online übergeben – oder den Zeitraum verkleinern.");
  }

  const fileName = packageFileName(input.from, input.to);
  const { grossCents } = revenueTotal(journal);
  const mail = accountingExportMail({
    accountantName: input.email ? undefined : settings.accountantName,
    period: `${germanDate(input.from)} – ${germanDate(input.to)}`,
    invoiceCount: journal.entries.filter((entry) => entry.type === "INVOICE").length,
    creditNoteCount: journal.entries.filter((entry) => entry.type === "CREDIT_NOTE").length,
    grossTotal: euro(grossCents),
    includesDatev: datevReady(settings) && withinOneFiscalYear(input.from, input.to, settings),
    fileName,
    message: input.message,
    senderName,
  });
  const sent = await sendMail({
    type: "ACCOUNTING_EXPORT",
    to,
    ...mail,
    attachments: [{ filename: fileName, content: zip, contentType: "application/zip" }],
    sentById: req.auth!.user.id,
  });
  if (!sent) throw new AppError(502, "INTERNAL", "Die E-Mail konnte nicht gesendet werden. Bitte später erneut versuchen oder das Paket herunterladen.");

  await recordExport(req, "EMAIL", journal, input.source, to);
  res.json({ sentTo: to, sizeBytes: zip.length, exports: await recentExports() });
});
