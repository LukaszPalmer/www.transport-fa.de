import { ChangePasswordInput, type AdminActivityList, type StaffMe, type StaffOption } from "@fa/shared";
import { Router } from "express";
import { z } from "zod";
import { requireAdmin, requireStaff } from "../../auth/middleware";
import { isPasswordPwned, verifyPassword } from "../../auth/password";
import { consumeRateLimit } from "../../auth/rate-limit";
import { AppError } from "../../http/errors";
import { audit } from "../../lib/audit";
import { changeCredentials } from "../../services/credentials";
import { AuditLog, StaffProfile, User } from "../../models";
import { ACTIVITY_GROUPS, toActivityItems } from "../../services/activity";
import { buildDashboard } from "../../services/dashboard";
import { adminAccountingRouter } from "./accounting";
import { adminCustomersRouter } from "./customers";
import { adminDocumentsRouter } from "./documents";
import { adminInvoicesRouter } from "./invoices";
import { adminLeadsRouter } from "./leads";
import { adminDriversRouter, adminShipmentsRouter } from "./shipments";
import { adminUsersRouter } from "./users";

/**
 * /api/v1/admin – Admin-Bereich. Jede Route verlangt einen Mitarbeiter (ADMIN/EMPLOYEE)
 * mit bestätigtem zweiten Faktor; einzelne Module prüfen zusätzlich feingranulare Rechte.
 */
export const adminRouter = Router();

adminRouter.use(requireStaff);

adminRouter.get("/me", async (req, res) => {
  const { user } = req.auth!;
  const profile = await StaffProfile.findById(req.staff!.profileId).lean();
  if (!profile) throw AppError.forbidden();
  const body: StaffMe = {
    user: { id: String(user.id), name: user.name, email: user.email, role: user.role as StaffMe["user"]["role"] },
    staff: {
      displayName: profile.displayName,
      jobTitle: profile.jobTitle,
      permissions: req.staff!.permissions,
      presence: profile.presence,
      soundEnabled: profile.soundEnabled,
    },
  };
  res.json(body);
});

adminRouter.patch("/me", async (req, res) => {
  const input = z.object({ soundEnabled: z.boolean() }).parse(req.body);
  await StaffProfile.updateOne({ _id: req.staff!.profileId }, { soundEnabled: input.soundEnabled });
  res.status(204).end();
});

/** Eigenes Passwort ändern – für alle Mitarbeiter, unabhängig von can_edit_credentials. */
adminRouter.post("/me/password", async (req, res) => {
  const auth = req.auth!;
  await consumeRateLimit(`password-change:user:${auth.user.id}`, 5, 15 * 60);
  const input = ChangePasswordInput.parse(req.body);

  const record = await User.findById(auth.user.id).select("+passwordHash").lean();
  if (!record?.passwordHash || !(await verifyPassword(record.passwordHash, input.currentPassword))) {
    throw AppError.validation({ currentPassword: "Das aktuelle Passwort ist nicht korrekt." });
  }
  if (await isPasswordPwned(input.newPassword)) {
    throw AppError.validation({ newPassword: "Dieses Passwort ist aus Datenlecks bekannt. Bitte wählen Sie ein anderes." });
  }
  const result = await changeCredentials({ userId: auth.user.id, password: input.newPassword, changedBy: "self", keepSessionId: auth.sessionId });
  audit(req, "account.password_changed", { targetType: "User", targetId: auth.user.id, meta: { sessionsEnded: result.sessionsEnded } });
  res.json({ ok: true, sessionsEnded: result.sessionsEnded });
});

/** Aktive Mitarbeiter für Auswahlfelder (Betreuer eines Kunden, Zuständigkeit einer Anfrage). */
adminRouter.get("/staff-options", async (_req, res) => {
  const users = await User.find({ role: { $in: ["ADMIN", "EMPLOYEE"] }, state: "ACTIVE" }).select("_id").lean();
  const profiles = await StaffProfile.find({ userId: { $in: users.map((user) => user._id) } }).select("userId displayName").sort({ displayName: 1 }).lean();
  const body: StaffOption[] = profiles.map((profile) => ({ id: String(profile.userId), name: profile.displayName }));
  res.json(body);
});

/** Übersicht (Dashboard) – Inhalte je nach Rechten des Mitarbeiters. */
adminRouter.get("/overview", async (req, res) => {
  res.json(await buildDashboard(req.staff!.permissions, req.auth!.user.role === "ADMIN"));
});

const ActivityQuery = z.object({
  group: z.string().regex(/^[a-z_]+$/).optional(),
  actorId: z.string().regex(/^[a-f0-9]{24}$/).optional(),
  page: z.coerce.number().int().min(1).max(1000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

/** Aktivitätsprotokoll (12 Monate) – wer hat wann was getan. Nur Administratoren. */
adminRouter.get("/activity", requireAdmin, async (req, res) => {
  const query = ActivityQuery.parse(req.query);
  const filter: Record<string, unknown> = {};
  if (query.group) filter.action = { $regex: `^${query.group}[.]` };
  if (query.actorId) filter.actorId = query.actorId;
  const [entries, total] = await Promise.all([
    AuditLog.find(filter).sort({ createdAt: -1 }).skip((query.page - 1) * query.limit).limit(query.limit).lean(),
    AuditLog.countDocuments(filter),
  ]);
  const body: AdminActivityList = { items: await toActivityItems(entries), total, groups: ACTIVITY_GROUPS };
  res.json(body);
});

adminRouter.use("/customers", adminCustomersRouter);
adminRouter.use("/users", adminUsersRouter);
adminRouter.use("/shipments", adminShipmentsRouter);
adminRouter.use("/drivers", adminDriversRouter);
adminRouter.use("/documents", adminDocumentsRouter);
adminRouter.use("/invoices", adminInvoicesRouter);
adminRouter.use("/leads", adminLeadsRouter);
adminRouter.use("/accounting", adminAccountingRouter);
