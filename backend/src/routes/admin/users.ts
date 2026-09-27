import {
  CreateStaffInput,
  DeleteStaffInput,
  isStaffRole,
  ROLES,
  UpdateCredentialsInput,
  UpdateStaffInput,
  type AdminUserRow,
  type Role,
} from "@fa/shared";
import { Router, type Request } from "express";
import mongoose, { Types } from "mongoose";
import { z } from "zod";
import { requireAdmin, requirePermission } from "../../auth/middleware";
import { hashPassword, isPasswordPwned, verifyPassword } from "../../auth/password";
import { consumeRateLimit } from "../../auth/rate-limit";
import { revokeAllSessions } from "../../auth/sessions";
import { AppError, emailTakenError } from "../../http/errors";
import { audit } from "../../lib/audit";
import { CustomerProfile, StaffProfile, User, type IUser } from "../../models";
import { isOnline } from "../../realtime/presence";
import { changeCredentials } from "../../services/credentials";
import { deleteStaffMember } from "../../services/staff-deletion";

/**
 * /api/v1/admin/users – alle Konten, Zugangsdaten neu setzen, Mitarbeiter verwalten.
 * Passwörter sind gehasht gespeichert: sie lassen sich nicht anzeigen, nur neu vergeben.
 */
export const adminUsersRouter = Router();

const PWNED_PASSWORD = "Dieses Passwort ist aus Datenlecks bekannt. Bitte wählen Sie ein anderes.";

const ListQuery = z.object({
  role: z.enum([...ROLES, "STAFF"]).optional(),
  q: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).max(1000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function objectIdParam(req: Request): Types.ObjectId {
  const id = String(req.params.id);
  if (!Types.ObjectId.isValid(id)) throw AppError.notFound("Konto nicht gefunden.");
  return new Types.ObjectId(id);
}

/** Mitarbeiter sehen die Kontenliste mit Kunden-Recht; Mitarbeiterkonten nur Admins. */
adminUsersRouter.get("/", requirePermission("can_view_customers"), async (req, res) => {
  const query = ListQuery.parse(req.query);
  const isAdmin = req.auth!.user.role === "ADMIN";

  const filter: Record<string, unknown> = {};
  if (query.role === "STAFF") filter.role = { $in: ["ADMIN", "EMPLOYEE"] };
  else if (query.role) filter.role = query.role;
  if (!isAdmin) filter.role = "CUSTOMER";
  if (query.q) {
    const pattern = { $regex: escapeRegex(query.q), $options: "i" };
    filter.$or = [{ email: pattern }, { name: pattern }];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ role: 1, createdAt: -1 })
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .select("email name role state lastLoginAt lastSeenAt createdAt mfa")
      .lean(),
    User.countDocuments(filter),
  ]);

  const ids = users.map((user) => user._id);
  const [customers, staff] = await Promise.all([
    CustomerProfile.find({ userId: { $in: ids } }).select("userId customerNumber").lean(),
    StaffProfile.find({ userId: { $in: ids } }).select("userId displayName jobTitle permissions").lean(),
  ]);
  const customerByUser = new Map(customers.map((customer) => [String(customer.userId), customer]));
  const staffByUser = new Map(staff.map((profile) => [String(profile.userId), profile]));

  const rows: AdminUserRow[] = users.map((user) => {
    const staffProfile = staffByUser.get(String(user._id));
    return {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
      state: user.state,
      online: isOnline(user._id),
      lastLoginAt: user.lastLoginAt?.toISOString(),
      lastSeenAt: user.lastSeenAt?.toISOString(),
      createdAt: user.createdAt.toISOString(),
      customerNumber: customerByUser.get(String(user._id))?.customerNumber,
      staff: staffProfile
        ? { displayName: staffProfile.displayName, jobTitle: staffProfile.jobTitle, permissions: staffProfile.permissions, mfaEnabled: Boolean(user.mfa) }
        : undefined,
    };
  });
  res.json({ users: rows, total });
});

/**
 * Zugangsdaten neu setzen. ADMIN: alle Konten (auch das eigene). EMPLOYEE mit
 * can_edit_credentials: nur Kundenkonten. Neues Passwort gilt sofort, alle
 * Sitzungen des Kontos enden (bei eigener Änderung bleibt die aktuelle bestehen).
 */
adminUsersRouter.patch("/:id/credentials", requirePermission("can_edit_credentials"), async (req, res) => {
  const auth = req.auth!;
  await consumeRateLimit(`admin-credentials:user:${auth.user.id}`, 30, 15 * 60);
  const targetId = objectIdParam(req);
  const input = UpdateCredentialsInput.parse(req.body);

  const target = await User.findById(targetId).select("role state").lean();
  if (!target) throw AppError.notFound("Konto nicht gefunden.");
  assertMayEdit(auth.user.role, target.role);
  if (target.role === "DRIVER") throw AppError.badRequest("Fahrerkonten werden über die Fahrerverwaltung gepflegt.");
  if (input.password && (await isPasswordPwned(input.password))) throw AppError.validation({ password: PWNED_PASSWORD });

  const self = targetId.equals(auth.user.id);
  const result = await changeCredentials({
    userId: targetId,
    email: input.email,
    password: input.password,
    changedBy: self ? "self" : "staff",
    keepSessionId: self ? auth.sessionId : undefined,
  });

  const profile = target.role === "CUSTOMER" ? await CustomerProfile.findOne({ userId: targetId }).select("_id").lean() : null;
  audit(req, "admin.credentials_changed", {
    targetType: "User",
    targetId,
    customerId: profile?._id,
    meta: { email: result.emailChanged, password: result.passwordChanged, sessionsEnded: result.sessionsEnded },
  });
  res.json(result);
});

function assertMayEdit(actorRole: Role, targetRole: Role): void {
  if (actorRole === "ADMIN") return;
  if (targetRole !== "CUSTOMER") throw AppError.forbidden("Zugangsdaten von Mitarbeitern kann nur ein Administrator ändern.");
}

// --- Mitarbeiter (nur ADMIN) -----------------------------------------------------------

adminUsersRouter.post("/staff", requireAdmin, async (req, res) => {
  const input = CreateStaffInput.parse(req.body);
  if (await User.exists({ email: input.email })) throw emailTakenError();
  if (await isPasswordPwned(input.password)) throw AppError.validation({ password: PWNED_PASSWORD });

  const passwordHash = await hashPassword(input.password);
  const user = await mongoose.connection.transaction(async (session) => {
    const [created] = await User.create(
      [
        {
          email: input.email,
          name: input.displayName,
          role: input.role,
          passwordHash,
          passwordChangedAt: new Date(),
          emailVerifiedAt: new Date(), // vom Admin angelegt – Adresse gilt als bekannt
        },
      ],
      { session },
    );
    if (!created) throw new Error("Mitarbeiter konnte nicht angelegt werden");
    await StaffProfile.create(
      [
        {
          userId: created._id,
          displayName: input.displayName,
          jobTitle: input.jobTitle,
          permissions: input.role === "ADMIN" ? [] : input.permissions,
          createdById: req.auth!.user.id,
        },
      ],
      { session },
    );
    return created;
  });

  audit(req, "admin.staff_created", { targetType: "User", targetId: user._id, meta: { role: input.role, permissions: input.permissions } });
  res.status(201).json({ id: String(user._id) });
});

adminUsersRouter.patch("/staff/:id", requireAdmin, async (req, res) => {
  const targetId = objectIdParam(req);
  const input = UpdateStaffInput.parse(req.body);
  const target = await User.findById(targetId).select("role state").lean();
  if (!target || !isStaffRole(target.role)) throw AppError.notFound("Mitarbeiter nicht gefunden.");

  const self = targetId.equals(req.auth!.user.id);
  const demotes = input.role !== undefined && input.role !== target.role;
  const disables = input.state === "DISABLED" && target.state !== "DISABLED";
  if (self && (demotes || disables || input.resetMfa)) {
    throw AppError.badRequest("Die eigene Rolle, Sperre oder 2FA ändert ein anderer Administrator.");
  }
  if (target.role === "ADMIN" && (demotes || disables)) await assertAnotherAdminRemains(targetId);

  const userUpdate: Partial<Pick<IUser, "role" | "state" | "name">> = {};
  if (input.role) userUpdate.role = input.role;
  if (input.state) userUpdate.state = input.state;
  if (input.displayName) userUpdate.name = input.displayName;

  await User.updateOne(
    { _id: targetId },
    { $set: userUpdate, ...(input.resetMfa ? { $unset: { mfa: 1, mfaPendingSecret: 1 } } : {}) },
  );
  const profileSet: Record<string, unknown> = {};
  if (input.displayName) profileSet.displayName = input.displayName;
  if (input.jobTitle) profileSet.jobTitle = input.jobTitle;
  if (input.permissions) profileSet.permissions = input.permissions;
  await StaffProfile.updateOne(
    { userId: targetId },
    { $set: profileSet, ...(input.jobTitle === "" ? { $unset: { jobTitle: 1 } } : {}) },
  );

  // Rolle, Sperre oder 2FA-Reset: bestehende Sitzungen passen nicht mehr → beenden.
  const sessionsEnded = demotes || disables || input.resetMfa ? await revokeAllSessions(targetId) : 0;
  audit(req, "admin.staff_updated", { targetType: "User", targetId, meta: { ...input, sessionsEnded } });
  res.json({ ok: true, sessionsEnded });
});

async function assertAnotherAdminRemains(excludeId: Types.ObjectId): Promise<void> {
  const others = await User.countDocuments({ role: "ADMIN", state: "ACTIVE", _id: { $ne: excludeId } });
  if (others === 0) throw AppError.badRequest("Es muss mindestens ein aktiver Administrator bestehen bleiben.");
}

/**
 * Mitarbeiter endgültig löschen – alle Daten zur Person verschwinden (siehe deleteStaffMember).
 * Bestätigung: eigenes Passwort des Administrators plus Eingabe der E-Mail des Mitarbeiters.
 */
adminUsersRouter.post("/staff/:id/delete", requireAdmin, async (req, res) => {
  const auth = req.auth!;
  await consumeRateLimit(`staff-delete:user:${auth.user.id}`, 10, 15 * 60);
  const targetId = objectIdParam(req);
  const input = DeleteStaffInput.parse(req.body);

  if (targetId.equals(auth.user.id)) throw AppError.badRequest("Den eigenen Zugang kann nur ein anderer Administrator löschen.");
  const target = await User.findById(targetId).select("role email").lean();
  if (!target || !isStaffRole(target.role)) throw AppError.notFound("Mitarbeiter nicht gefunden.");
  if (input.confirmEmail !== target.email) throw AppError.validation({ confirmEmail: "Die E-Mail-Adresse stimmt nicht mit dem Mitarbeiter überein." });

  const self = await User.findById(auth.user.id).select("+passwordHash").lean();
  if (!self?.passwordHash || !(await verifyPassword(self.passwordHash, input.password))) {
    throw AppError.validation({ password: "Das Passwort ist nicht korrekt." });
  }
  if (target.role === "ADMIN") await assertAnotherAdminRemains(targetId);

  await deleteStaffMember(targetId, auth.user.id);
  // Bewusst ohne Namen/E-Mail: Vom gelöschten Mitarbeiter soll nichts übrig bleiben.
  audit(req, "admin.staff_deleted", { meta: { role: target.role } });
  res.status(204).end();
});
