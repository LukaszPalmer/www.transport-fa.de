import { ChangePasswordInput, type AdminOverview, type ShipmentStatus, type StaffMe } from "@fa/shared";
import { Router } from "express";
import { z } from "zod";
import { requireStaff } from "../../auth/middleware";
import { isPasswordPwned, verifyPassword } from "../../auth/password";
import { consumeRateLimit } from "../../auth/rate-limit";
import { AppError } from "../../http/errors";
import { audit } from "../../lib/audit";
import { changeCredentials } from "../../services/credentials";
import { ChatSession, CustomerProfile, Shipment, StaffProfile, User } from "../../models";
import { onlineUserIds } from "../../realtime/presence";
import { adminCustomersRouter } from "./customers";
import { adminDocumentsRouter } from "./documents";
import { adminDriversRouter, adminShipmentsRouter } from "./shipments";
import { adminUsersRouter } from "./users";

/**
 * /api/v1/admin – Admin-Bereich. Jede Route verlangt einen Mitarbeiter (ADMIN/EMPLOYEE)
 * mit bestätigtem zweiten Faktor; einzelne Module prüfen zusätzlich feingranulare Rechte.
 */
export const adminRouter = Router();

adminRouter.use(requireStaff);

const ACTIVE_STATUSES: ShipmentStatus[] = ["PLANNED", "ASSIGNED", "EN_ROUTE_TO_PICKUP", "IN_TRANSIT"];

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

adminRouter.get("/overview", async (_req, res) => {
  const online = onlineUserIds();
  const [customers, customersOnline, activeShipments, unassignedShipments, openChats, unreadChats] = await Promise.all([
    CustomerProfile.countDocuments(),
    online.length ? User.countDocuments({ _id: { $in: online }, role: "CUSTOMER" }) : 0,
    Shipment.countDocuments({ status: { $in: ACTIVE_STATUSES } }),
    Shipment.countDocuments({ status: "PLANNED", driverId: { $exists: false } }),
    ChatSession.countDocuments({ status: { $ne: "RESOLVED" } }),
    ChatSession.countDocuments({ status: { $ne: "RESOLVED" }, unreadByStaff: { $gt: 0 } }),
  ]);
  const body: AdminOverview = { stats: { customers, customersOnline, activeShipments, unassignedShipments, openChats, unreadChats } };
  res.json(body);
});

adminRouter.use("/customers", adminCustomersRouter);
adminRouter.use("/users", adminUsersRouter);
adminRouter.use("/shipments", adminShipmentsRouter);
adminRouter.use("/drivers", adminDriversRouter);
adminRouter.use("/documents", adminDocumentsRouter);
