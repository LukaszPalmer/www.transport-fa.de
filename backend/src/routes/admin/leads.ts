import { LEAD_STATUSES, LeadNoteInput, UpdateLeadInput, type AdminLeadList, type LeadStatus } from "@fa/shared";
import { Router, type Request } from "express";
import { Types, type QueryFilter } from "mongoose";
import { z } from "zod";
import { requireAdmin, requirePermission } from "../../auth/middleware";
import { AppError } from "../../http/errors";
import { audit } from "../../lib/audit";
import { CustomerProfile, Lead, StaffProfile, type ILead } from "../../models";
import { createLead, leadExpiry, toLeadDetail, toLeadRows } from "../../services/leads";

/**
 * /api/v1/admin/leads – Anfragen aus dem Kontaktformular (und manuell erfasste) als Pipeline:
 * Neu → Kontaktiert → Angebot gesendet → Gewonnen/Verloren, mit Zuständigkeit, Wiedervorlage,
 * geschätztem Auftragswert und Notizen.
 */
export const adminLeadsRouter = Router();

adminLeadsRouter.use(requirePermission("can_manage_leads"));

const ListQuery = z.object({
  status: z.enum([...LEAD_STATUSES, "OPEN", "ALL", "FOLLOW_UP"]).default("OPEN"),
  mine: z.enum(["1"]).optional(),
  q: z.string().trim().max(80).optional(),
  page: z.coerce.number().int().min(1).max(1000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

const OPEN_STATUSES: LeadStatus[] = ["NEW", "CONTACTED", "OFFER_SENT"];

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function findLead(req: Request) {
  if (!Types.ObjectId.isValid(String(req.params.id))) throw AppError.notFound("Anfrage nicht gefunden.");
  const lead = await Lead.findById(req.params.id);
  if (!lead) throw AppError.notFound("Anfrage nicht gefunden.");
  return lead;
}

adminLeadsRouter.get("/", async (req, res) => {
  const query = ListQuery.parse(req.query);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const filter: QueryFilter<ILead> = {};
  if (query.status === "OPEN") filter.status = { $in: OPEN_STATUSES };
  else if (query.status === "FOLLOW_UP") Object.assign(filter, { status: { $in: OPEN_STATUSES }, followUpAt: { $lte: endOfToday } });
  else if (query.status !== "ALL") filter.status = query.status;
  if (query.mine) filter.assignedToId = req.auth!.user.id;
  if (query.q) {
    const pattern = { $regex: escapeRegex(query.q), $options: "i" };
    filter.$or = [{ number: pattern }, { name: pattern }, { company: pattern }, { email: pattern }, { phone: pattern }];
  }

  const [leads, total, grouped, followUpDue, pipeline] = await Promise.all([
    Lead.find(filter)
      .sort(query.status === "FOLLOW_UP" ? { followUpAt: 1 } : { createdAt: -1 })
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .lean(),
    Lead.countDocuments(filter),
    Lead.aggregate<{ _id: LeadStatus; count: number }>([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Lead.countDocuments({ status: { $in: OPEN_STATUSES }, followUpAt: { $lte: endOfToday } }),
    Lead.aggregate<{ total: number }>([
      { $match: { status: { $in: OPEN_STATUSES }, estimatedValueCents: { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: "$estimatedValueCents" } } },
    ]),
  ]);

  const counts = Object.fromEntries(LEAD_STATUSES.map((status) => [status, 0])) as AdminLeadList["counts"];
  for (const entry of grouped) counts[entry._id] = entry.count;
  counts.followUpDue = followUpDue;

  const body: AdminLeadList = { leads: await toLeadRows(leads), total, counts, pipelineValueCents: pipeline[0]?.total ?? 0 };
  res.json(body);
});

/** Anfrage manuell erfassen – z. B. nach einem Anruf oder aus MyHammer. */
adminLeadsRouter.post("/", async (req, res) => {
  const note = z.object({ note: z.string().trim().max(2000).optional() }).parse(req.body).note;
  const lead = await createLead(req.body, { assignedToId: req.auth!.user.id, noteAuthorId: req.auth!.user.id, note });
  audit(req, "lead.created", { targetType: "Lead", targetId: lead._id, meta: { number: lead.number, source: lead.source } });
  res.status(201).json(await toLeadDetail(lead.toObject()));
});

adminLeadsRouter.get("/:id", async (req, res) => {
  const lead = await findLead(req);
  res.json(await toLeadDetail(lead.toObject()));
});

adminLeadsRouter.patch("/:id", async (req, res) => {
  const input = UpdateLeadInput.parse(req.body);
  const lead = await findLead(req);

  if (input.status && input.status !== lead.status) {
    lead.status = input.status;
    lead.statusChangedAt = new Date();
    if (input.status !== "LOST") lead.lostReason = undefined;
  }
  if (input.assignedToId !== undefined) {
    if (input.assignedToId && !(await StaffProfile.exists({ userId: input.assignedToId }))) throw AppError.validation({ assignedToId: "Mitarbeiter nicht gefunden." });
    lead.assignedToId = input.assignedToId ? new Types.ObjectId(input.assignedToId) : undefined;
  }
  if (input.customerId !== undefined) {
    if (input.customerId && !(await CustomerProfile.exists({ _id: input.customerId }))) throw AppError.validation({ customerId: "Kunde nicht gefunden." });
    lead.customerId = input.customerId ? new Types.ObjectId(input.customerId) : undefined;
  }
  if (input.followUpAt !== undefined) lead.followUpAt = input.followUpAt ? new Date(`${input.followUpAt}T09:00:00+02:00`) : undefined;
  if (input.estimatedValueCents !== undefined) lead.estimatedValueCents = input.estimatedValueCents ?? undefined;
  if (input.lostReason !== undefined) lead.lostReason = input.lostReason || undefined;
  lead.expiresAt = leadExpiry(lead.status);
  await lead.save();

  audit(req, "lead.updated", { targetType: "Lead", targetId: lead._id, customerId: lead.customerId, meta: { number: lead.number, ...input } });
  res.json(await toLeadDetail(lead.toObject()));
});

adminLeadsRouter.post("/:id/notes", async (req, res) => {
  const { body } = LeadNoteInput.parse(req.body);
  const lead = await findLead(req);
  lead.notes.push({ authorId: req.auth!.user.id, body } as ILead["notes"][number]);
  lead.expiresAt = leadExpiry(lead.status);
  await lead.save();
  res.status(201).json(await toLeadDetail(lead.toObject()));
});

/** Endgültig löschen – z. B. auf Wunsch der anfragenden Person (DSGVO). Nur Administratoren. */
adminLeadsRouter.delete("/:id", requireAdmin, async (req, res) => {
  const lead = await findLead(req);
  await Lead.deleteOne({ _id: lead._id });
  audit(req, "lead.deleted", { targetType: "Lead", targetId: lead._id, meta: { number: lead.number } });
  res.status(204).end();
});
