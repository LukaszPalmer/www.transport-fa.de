import {
  CreateLeadInput,
  LEAD_RETENTION_DAYS,
  LEAD_WON_RETENTION_DAYS,
  type AdminLeadDetail,
  type AdminLeadRow,
  type LeadStatus,
} from "@fa/shared";
import type { Types } from "mongoose";
import { berlinYearMonth } from "../lib/berlin-time";
import { CustomerProfile, Lead, nextSequence, StaffProfile, type ILead } from "../models";

/**
 * Anfragen (Leads): Nummernvergabe, Löschfristen und Aufbereitung für die Admin-Oberfläche.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

/** Löschfrist ab jetzt: gewonnene Anfragen 3 Jahre, alle anderen 6 Monate nach der letzten Aktivität. */
export function leadExpiry(status: LeadStatus, from = new Date()): Date {
  return new Date(from.getTime() + (status === "WON" ? LEAD_WON_RETENTION_DAYS : LEAD_RETENTION_DAYS) * DAY_MS);
}

export async function createLead(raw: unknown, options: { assignedToId?: Types.ObjectId; noteAuthorId?: Types.ObjectId; note?: string } = {}) {
  const input = CreateLeadInput.parse(raw);
  const year = berlinYearMonth().year;
  const number = `A-${year}-${String(await nextSequence(`lead:${year}`)).padStart(5, "0")}`;
  return Lead.create({
    ...input,
    number,
    assignedToId: options.assignedToId,
    notes: options.note ? [{ authorId: options.noteAuthorId, body: options.note }] : [],
    statusChangedAt: new Date(),
    expiresAt: leadExpiry("NEW"),
  });
}

type LeadLike = Pick<
  ILead,
  | "_id"
  | "number"
  | "status"
  | "source"
  | "topic"
  | "name"
  | "company"
  | "email"
  | "phone"
  | "callback"
  | "from"
  | "to"
  | "preferredDate"
  | "message"
  | "assignedToId"
  | "customerId"
  | "followUpAt"
  | "estimatedValueCents"
  | "createdAt"
  | "statusChangedAt"
>;

function preview(text: string, length = 140): string {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length > length ? `${flat.slice(0, length - 1)}…` : flat;
}

async function lookups(leads: Array<Pick<ILead, "assignedToId" | "customerId" | "notes">>) {
  const staffIds = new Set<string>();
  const customerIds = new Set<string>();
  for (const lead of leads) {
    if (lead.assignedToId) staffIds.add(String(lead.assignedToId));
    if (lead.customerId) customerIds.add(String(lead.customerId));
    for (const note of lead.notes ?? []) if (note.authorId) staffIds.add(String(note.authorId));
  }
  const [staff, customers] = await Promise.all([
    staffIds.size ? StaffProfile.find({ userId: { $in: [...staffIds] } }).select("userId displayName").lean() : [],
    customerIds.size ? CustomerProfile.find({ _id: { $in: [...customerIds] } }).select("customerNumber firstName lastName companyName").lean() : [],
  ]);
  return {
    staffName: new Map(staff.map((profile) => [String(profile.userId), profile.displayName])),
    customer: new Map(customers.map((profile) => [String(profile._id), profile])),
  };
}

function toRow(lead: LeadLike, maps: Awaited<ReturnType<typeof lookups>>): AdminLeadRow {
  const customer = lead.customerId ? maps.customer.get(String(lead.customerId)) : undefined;
  const assigned = lead.assignedToId ? maps.staffName.get(String(lead.assignedToId)) : undefined;
  return {
    id: String(lead._id),
    number: lead.number,
    status: lead.status,
    source: lead.source,
    topic: lead.topic,
    name: lead.name,
    company: lead.company,
    email: lead.email,
    phone: lead.phone,
    callback: lead.callback,
    route: lead.from || lead.to ? [lead.from, lead.to].filter(Boolean).join(" → ") : undefined,
    preferredDate: lead.preferredDate,
    messagePreview: preview(lead.message),
    assignedTo: assigned ? { id: String(lead.assignedToId), name: assigned } : undefined,
    customer: customer
      ? { id: String(customer._id), customerNumber: customer.customerNumber, name: customer.companyName || `${customer.firstName} ${customer.lastName}` }
      : undefined,
    followUpAt: lead.followUpAt?.toISOString(),
    estimatedValueCents: lead.estimatedValueCents,
    createdAt: lead.createdAt.toISOString(),
    statusChangedAt: lead.statusChangedAt.toISOString(),
  };
}

export async function toLeadRows(leads: Array<LeadLike & Pick<ILead, "notes">>): Promise<AdminLeadRow[]> {
  const maps = await lookups(leads);
  return leads.map((lead) => toRow(lead, maps));
}

export async function toLeadDetail(lead: ILead): Promise<AdminLeadDetail> {
  const maps = await lookups([lead]);
  return {
    ...toRow(lead, maps),
    message: lead.message,
    from: lead.from,
    to: lead.to,
    lostReason: lead.lostReason,
    locale: lead.locale,
    expiresAt: lead.expiresAt.toISOString(),
    notes: [...lead.notes]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((note) => ({
        id: String(note._id),
        body: note.body,
        author: note.authorId ? (maps.staffName.get(String(note.authorId)) ?? "Ehemaliger Mitarbeiter") : undefined,
        createdAt: note.createdAt.toISOString(),
      })),
  };
}
