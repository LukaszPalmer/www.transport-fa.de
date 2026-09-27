import { AccountingSettingsInput, defaultAccountingSettings, type AccountingSettings } from "@fa/shared";
import type { Types } from "mongoose";
import { logger } from "../lib/logger";
import { Setting } from "../models";

const KEY = "accounting";

/** Einstellungen der Buchhaltung (DATEV-Nummern, Kontenrahmen, Steuerberatung) – mit Standardwerten. */
export async function loadAccountingSettings(): Promise<AccountingSettings> {
  const stored = await Setting.findById(KEY).lean();
  if (!stored) return defaultAccountingSettings();
  const parsed = AccountingSettingsInput.safeParse(stored.value);
  if (!parsed.success) {
    logger.warn({ issues: parsed.error.issues }, "Gespeicherte Buchhaltungs-Einstellungen ungültig – Standardwerte aktiv");
    return defaultAccountingSettings();
  }
  return parsed.data;
}

export async function saveAccountingSettings(input: unknown, userId: Types.ObjectId): Promise<AccountingSettings> {
  const settings = AccountingSettingsInput.parse(input);
  await Setting.updateOne({ _id: KEY }, { $set: { value: settings, updatedById: userId } }, { upsert: true });
  return settings;
}

/** DATEV verlangt Berater- und Mandantennummer – ohne sie lässt sich kein Buchungsstapel importieren. */
export function datevReady(settings: AccountingSettings): boolean {
  return Boolean(settings.consultantNumber && settings.clientNumber);
}
