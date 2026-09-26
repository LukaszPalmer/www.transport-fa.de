import {
  AssignDriverInput,
  CreateShipmentInput,
  SHIPMENT_STATUSES,
  UpdateShipmentStatusInput,
  type AdminDriver,
  type AdminShipmentList,
  type ShipmentStatus,
} from "@fa/shared";
import { Router, type Request } from "express";
import { Types } from "mongoose";
import { z } from "zod";
import { requireAnyPermission, requirePermission } from "../../auth/middleware";
import { AppError } from "../../http/errors";
import { audit } from "../../lib/audit";
import { CustomerProfile, DriverProfile, Shipment, type IShipment } from "../../models";
import { nextShipmentNumber, toAdminShipmentRows } from "../../services/admin-shipments";
import { notifyShipmentUpdate } from "../../services/notifications";

/** /api/v1/admin/shipments – Aufträge anlegen, Status pflegen, Fahrer zuweisen. */
export const adminShipmentsRouter = Router();

const ACTIVE_STATUSES: ShipmentStatus[] = ["PLANNED", "ASSIGNED", "EN_ROUTE_TO_PICKUP", "IN_TRANSIT"];
const NEEDS_DRIVER: ShipmentStatus[] = ["ASSIGNED", "EN_ROUTE_TO_PICKUP", "IN_TRANSIT"];
const CLOSED: ShipmentStatus[] = ["DELIVERED", "CANCELLED"];

const ListQuery = z.object({
  status: z.enum([...SHIPMENT_STATUSES, "ACTIVE", "UNASSIGNED"]).optional(),
  customerId: z.string().regex(/^[a-f0-9]{24}$/).optional(),
  q: z.string().trim().max(50).optional(),
  page: z.coerce.number().int().min(1).max(1000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function findShipment(req: Request) {
  if (!Types.ObjectId.isValid(String(req.params.id))) throw AppError.notFound("Auftrag nicht gefunden.");
  const shipment = await Shipment.findById(req.params.id);
  if (!shipment) throw AppError.notFound("Auftrag nicht gefunden.");
  return shipment;
}

async function rowFor(shipment: IShipment) {
  const [row] = await toAdminShipmentRows([shipment]);
  return row;
}

adminShipmentsRouter.get("/", requireAnyPermission("can_manage_orders", "can_manage_drivers", "can_view_customers"), async (req, res) => {
  const query = ListQuery.parse(req.query);
  const filter: Record<string, unknown> = {};
  if (query.status === "ACTIVE") filter.status = { $in: ACTIVE_STATUSES };
  else if (query.status === "UNASSIGNED") Object.assign(filter, { status: { $in: ACTIVE_STATUSES }, driverId: { $exists: false } });
  else if (query.status) filter.status = query.status;
  if (query.customerId) filter.customerId = new Types.ObjectId(query.customerId);
  if (query.q) filter.shipmentNumber = { $regex: escapeRegex(query.q.toUpperCase()) };

  const [shipments, total] = await Promise.all([
    Shipment.find(filter)
      .sort({ createdAt: -1 })
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .lean(),
    Shipment.countDocuments(filter),
  ]);
  const body: AdminShipmentList = { shipments: await toAdminShipmentRows(shipments), total };
  res.json(body);
});

adminShipmentsRouter.post("/", requirePermission("can_manage_orders"), async (req, res) => {
  const input = CreateShipmentInput.parse(req.body);
  const customer = await CustomerProfile.findById(input.customerId).select("_id").lean();
  if (!customer) throw AppError.validation({ customerId: "Kunde nicht gefunden." });

  const toStop = (stop: typeof input.pickup) => ({
    address: { line1: stop.line1, postalCode: stop.postalCode, city: stop.city, countryCode: stop.countryCode },
    contactName: stop.contactName,
  });
  const shipment = await Shipment.create({
    shipmentNumber: await nextShipmentNumber(),
    customerId: customer._id,
    service: input.service,
    cargoDescription: input.cargoDescription,
    customerReference: input.customerReference,
    pickup: toStop(input.pickup),
    delivery: toStop(input.delivery),
    plannedPickupAt: input.plannedPickupAt ? new Date(input.plannedPickupAt) : undefined,
    plannedDeliveryAt: input.plannedDeliveryAt ? new Date(input.plannedDeliveryAt) : undefined,
    statusHistory: [{ status: "PLANNED", at: new Date(), byUserId: req.auth!.user.id }],
  });

  audit(req, "shipment.created", { targetType: "Shipment", targetId: shipment._id, customerId: customer._id });
  res.status(201).json(await rowFor(shipment));
});

adminShipmentsRouter.patch("/:id/status", requirePermission("can_manage_orders"), async (req, res) => {
  const { status } = UpdateShipmentStatusInput.parse(req.body);
  const shipment = await findShipment(req);
  if (shipment.status === status) {
    res.json(await rowFor(shipment));
    return;
  }
  if (NEEDS_DRIVER.includes(status) && !shipment.driverId) throw AppError.validation({ status: "Bitte zuerst einen Fahrer zuweisen." });

  const now = new Date();
  shipment.status = status;
  shipment.statusHistory.push({ status, at: now, byUserId: req.auth!.user.id });
  if (status === "IN_TRANSIT") shipment.pickedUpAt ??= now;
  if (status === "DELIVERED") shipment.deliveredAt = now;
  await shipment.save();

  audit(req, "shipment.status_changed", { targetType: "Shipment", targetId: shipment._id, customerId: shipment.customerId, meta: { status } });
  notifyShipmentUpdate(shipment._id, status);
  res.json(await rowFor(shipment));
});

/**
 * Fahrer zuweisen: Name, Telefon (international) und Kennzeichen sind Pflicht. Ein
 * bekannter Fahrer (per ID oder gleicher Telefonnummer) wird aktualisiert statt doppelt angelegt.
 */
adminShipmentsRouter.put("/:id/driver", requirePermission("can_manage_drivers"), async (req, res) => {
  const input = AssignDriverInput.parse(req.body);
  const shipment = await findShipment(req);
  if (CLOSED.includes(shipment.status)) throw AppError.badRequest("Abgeschlossene Aufträge können nicht mehr umgeplant werden.");

  let driver = input.driverId ? await DriverProfile.findById(input.driverId) : await DriverProfile.findOne({ phone: input.phone });
  if (input.driverId && !driver) throw AppError.validation({ driverId: "Fahrer nicht gefunden." });

  const data = {
    firstName: input.firstName,
    lastName: input.lastName,
    phone: input.phone,
    vehicle: { plate: input.plate.replace(/\s+/g, " "), label: input.vehicleLabel },
    active: true,
  };
  if (driver) {
    driver.set(data);
    await driver.save();
  } else {
    driver = await DriverProfile.create(data);
  }

  const firstAssignment = shipment.status === "PLANNED";
  shipment.driverId = driver._id;
  if (firstAssignment) {
    shipment.status = "ASSIGNED";
    shipment.statusHistory.push({ status: "ASSIGNED", at: new Date(), byUserId: req.auth!.user.id });
  }
  await shipment.save();

  audit(req, "shipment.driver_assigned", {
    targetType: "Shipment",
    targetId: shipment._id,
    customerId: shipment.customerId,
    meta: { driverId: String(driver._id) },
  });
  if (firstAssignment) notifyShipmentUpdate(shipment._id, "ASSIGNED");
  res.json(await rowFor(shipment));
});

adminShipmentsRouter.delete("/:id/driver", requirePermission("can_manage_drivers"), async (req, res) => {
  const shipment = await findShipment(req);
  if (CLOSED.includes(shipment.status)) throw AppError.badRequest("Abgeschlossene Aufträge können nicht mehr umgeplant werden.");
  if (shipment.status !== "PLANNED" && shipment.status !== "ASSIGNED") {
    throw AppError.badRequest("Der Fahrer ist bereits unterwegs – bitte zuerst den Status zurücksetzen.");
  }
  shipment.driverId = undefined;
  if (shipment.status === "ASSIGNED") {
    shipment.status = "PLANNED";
    shipment.statusHistory.push({ status: "PLANNED", at: new Date(), byUserId: req.auth!.user.id });
  }
  await shipment.save();
  audit(req, "shipment.driver_unassigned", { targetType: "Shipment", targetId: shipment._id, customerId: shipment.customerId });
  res.json(await rowFor(shipment));
});

// --- Fahrer ---------------------------------------------------------------------------

export const adminDriversRouter = Router();

adminDriversRouter.get("/", requirePermission("can_manage_drivers"), async (req, res) => {
  const { q } = z.object({ q: z.string().trim().max(100).optional() }).parse(req.query);
  const filter: Record<string, unknown> = { active: true };
  if (q) {
    const pattern = { $regex: escapeRegex(q), $options: "i" };
    filter.$or = [{ firstName: pattern }, { lastName: pattern }, { phone: pattern }, { "vehicle.plate": pattern }];
  }
  const drivers = await DriverProfile.find(filter).sort({ lastName: 1 }).limit(200).lean();
  const counts = await Shipment.aggregate<{ _id: Types.ObjectId; count: number }>([
    { $match: { driverId: { $in: drivers.map((driver) => driver._id) }, status: { $in: ACTIVE_STATUSES } } },
    { $group: { _id: "$driverId", count: { $sum: 1 } } },
  ]);
  const countById = new Map(counts.map((entry) => [String(entry._id), entry.count]));

  const body: AdminDriver[] = drivers.map((driver) => ({
    id: String(driver._id),
    firstName: driver.firstName,
    lastName: driver.lastName,
    phone: driver.phone,
    plate: driver.vehicle?.plate,
    vehicleLabel: driver.vehicle?.label,
    active: driver.active,
    activeShipments: countById.get(String(driver._id)) ?? 0,
  }));
  res.json({ drivers: body });
});
