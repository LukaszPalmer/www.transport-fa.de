import { z } from "zod";
import type { EffectivePaymentStatus, InvoiceSource, PaymentMethod } from "./domain";

/**
 * Buchhaltung im Admin-Bereich: Rechnungsausgangsbuch, Umsatzsteuer-Auswertung und Übergabe an
 * den Steuerberater (DATEV-Buchungsstapel im EXTF-Format, Belegpaket als ZIP mit PDF/ZUGFeRD und
 * XRechnung-XML). Die Kontenzuordnung ist einstellbar und sollte mit der Steuerberatung abgestimmt sein.
 */

export const CHARTS_OF_ACCOUNTS = ["SKR03", "SKR04"] as const;
export type ChartOfAccounts = (typeof CHARTS_OF_ACCOUNTS)[number];

export const DEBTOR_MODES = ["PER_CUSTOMER", "COLLECTIVE"] as const;
export type DebtorMode = (typeof DEBTOR_MODES)[number];

/** Steuerfälle der Ausgangsrechnungen – je Fall ein Erlöskonto. */
export const TAX_CASES = ["S19", "S7", "RC", "EXEMPT"] as const;
export type TaxCase = (typeof TAX_CASES)[number];

export const TAX_CASE_INFO: Record<TaxCase, { label: string; short: string }> = {
  S19: { label: "Erlöse 19 % USt", short: "19 %" },
  S7: { label: "Erlöse 7 % USt", short: "7 %" },
  RC: { label: "Reverse Charge (EU, § 13b UStG)", short: "RC" },
  EXEMPT: { label: "Steuerfrei (z. B. § 4 Nr. 3 UStG)", short: "0 %" },
};

/** Standardkonten laut DATEV-Kontenrahmen (Automatikkonten mit hinterlegtem Steuersatz). */
export const DEFAULT_ACCOUNTS: Record<ChartOfAccounts, Record<TaxCase | "cash", number>> = {
  SKR03: { S19: 8400, S7: 8300, RC: 8336, EXEMPT: 8150, cash: 1000 },
  SKR04: { S19: 4400, S7: 4300, RC: 4336, EXEMPT: 4150, cash: 1600 },
};

const account = z.coerce.number({ error: "Bitte eine Kontonummer angeben." }).int("Nur Ziffern.").min(1, "Ungültige Kontonummer.").max(99_999_999, "Ungültige Kontonummer.");

export const AccountingSettingsInput = z.object({
  /** Beraternummer der Steuerkanzlei (DATEV), 1001–9999999. */
  consultantNumber: z.coerce.number().int().min(1001, "Beraternummer: 1001 bis 9999999.").max(9_999_999, "Beraternummer: 1001 bis 9999999.").optional().or(z.literal("").transform(() => undefined)),
  /** Mandantennummer bei der Kanzlei, 1–99999. */
  clientNumber: z.coerce.number().int().min(1, "Mandantennummer: 1 bis 99999.").max(99_999, "Mandantennummer: 1 bis 99999.").optional().or(z.literal("").transform(() => undefined)),
  chart: z.enum(CHARTS_OF_ACCOUNTS).default("SKR03"),
  /** Beginn des Wirtschaftsjahres (Monat 1–12). */
  fiscalYearStartMonth: z.coerce.number().int().min(1).max(12).default(1),
  /** Sachkontenlänge (4 = Standard, Debitoren dann 5-stellig 10000–69999). */
  accountLength: z.coerce.number().int().min(4).max(8).default(4),
  debtorMode: z.enum(DEBTOR_MODES).default("PER_CUSTOMER"),
  collectiveDebtorAccount: account.default(10000),
  accounts: z.object({ S19: account, S7: account, RC: account, EXEMPT: account, cash: account }),
  /** Barzahlungen als Buchung „Kasse an Debitor" mitexportieren (Überweisungen kommen über den Kontoauszug). */
  includeCashPayments: z.boolean().default(true),
  accountantName: z.string().trim().max(120).transform((value) => value || undefined).optional(),
  accountantEmail: z.email("Bitte eine gültige E-Mail-Adresse angeben.").trim().toLowerCase().optional().or(z.literal("").transform(() => undefined)),
});
export type AccountingSettingsInput = z.input<typeof AccountingSettingsInput>;
export type AccountingSettings = z.output<typeof AccountingSettingsInput>;

export function defaultAccountingSettings(chart: ChartOfAccounts = "SKR03"): AccountingSettings {
  return {
    chart,
    fiscalYearStartMonth: 1,
    accountLength: 4,
    debtorMode: "PER_CUSTOMER",
    collectiveDebtorAccount: 10000,
    accounts: { ...DEFAULT_ACCOUNTS[chart] },
    includeCashPayments: true,
  };
}

export const ACCOUNTING_SOURCES = ["ALL", "GENERATED"] as const;
export type AccountingSourceFilter = (typeof ACCOUNTING_SOURCES)[number];

export const AccountingPeriodQuery = z
  .object({
    from: z.iso.date({ error: "Bitte ein Startdatum wählen." }),
    to: z.iso.date({ error: "Bitte ein Enddatum wählen." }),
    source: z.enum(ACCOUNTING_SOURCES).default("ALL"),
  })
  .refine((value) => value.from <= value.to, { path: ["to"], message: "Das Enddatum liegt vor dem Startdatum." });
export type AccountingPeriodQuery = z.input<typeof AccountingPeriodQuery>;

export interface AccountingJournalRow {
  id: string;
  type: "INVOICE" | "CREDIT_NOTE";
  number: string;
  issueDate: string;
  serviceDate?: string;
  customerNumber: string;
  customerName: string;
  customerDeleted: boolean;
  debtorAccount: number;
  netCents: number;
  vatCents: number;
  grossCents: number;
  /** Steuerfälle dieses Belegs, z. B. ["S19"] oder ["S19", "S7"]. */
  taxCases: TaxCase[];
  paymentStatus?: EffectivePaymentStatus;
  paymentMethod?: PaymentMethod;
  paidAt?: string;
  source: InvoiceSource;
  eInvoice: boolean;
  /** Hinweis für die Steuerberatung, z. B. „Steuersatz aus Beträgen abgeleitet". */
  note?: string;
}

export interface AccountingTaxRow {
  taxCase: TaxCase;
  account: number;
  count: number;
  netCents: number;
  vatCents: number;
  grossCents: number;
}

export interface AccountingExportRow {
  id: string;
  kind: "DATEV" | "ZIP" | "JOURNAL" | "EMAIL";
  from: string;
  to: string;
  count: number;
  grossCents: number;
  by?: string;
  sentTo?: string;
  createdAt: string;
}

export interface AccountingSummary {
  period: { from: string; to: string; source: AccountingSourceFilter };
  totals: {
    count: number;
    invoiceCount: number;
    creditNoteCount: number;
    cancelledCount: number;
    netCents: number;
    vatCents: number;
    grossCents: number;
    paidGrossCents: number;
    openGrossCents: number;
    cashGrossCents: number;
  };
  byTax: AccountingTaxRow[];
  months: Array<{ month: string; netCents: number; vatCents: number; grossCents: number; count: number }>;
  journal: AccountingJournalRow[];
  warnings: string[];
  settings: AccountingSettings;
  settingsComplete: boolean;
  exports: AccountingExportRow[];
}

export const SendAccountingExportInput = z.object({
  from: z.iso.date(),
  to: z.iso.date(),
  source: z.enum(ACCOUNTING_SOURCES).default("ALL"),
  /** Leer = hinterlegte Adresse der Steuerberatung. */
  email: z.email("Bitte eine gültige E-Mail-Adresse angeben.").trim().toLowerCase().optional().or(z.literal("").transform(() => undefined)),
  message: z.string().trim().max(2000).optional().transform((value) => value || undefined),
});
export type SendAccountingExportInput = z.input<typeof SendAccountingExportInput>;
