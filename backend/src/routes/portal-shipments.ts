import {
  TRACKABLE_STATUSES,
  type LngLat,
  type ShipmentDetail,
  type ShipmentListResponse,
  type ShipmentLive,
  type ShipmentStatus,
  type ShipmentSummary,
  type StopView,
} from "@fa/shared";
import { Router, type Request } from "express";
import { Types } from "mongoose";
import { AppError } from "../http/errors";
import { CustomerProfile, DocumentModel, DriverProfile, Shipment, type IShipment, type Stop } from "../models";
import { toDocumentItem } from "../services/documents";

/**
 * /api/v1/portal/shipments – Sendungsverfolgung. Fahrerdaten erst ab Zuweisung,
 * Live-Position nur solange der LKW für diesen Kunden unterwegs ist.
 */
export const shipmentsRouter = Router();

const ACTIVE_STATUSES: ShipmentStatus[] = ["PLANNED", "ASSIGNED", "EN_ROUTE_TO_PICKUP", "IN_TRANSIT"];
const DRIVER_VISIBLE: ShipmentStatus[] = ["ASSIGNED", "EN_ROUTE_TO_PICKUP", "IN_TRANSIT"];

async function currentCustomerId(req: Request): Promise<Types.ObjectId> {
  const profile = await CustomerProfile.findOne({ userId: req.auth!.user.id }).select("_id").lean();
  if (!profile) throw AppError.notFound("Kundenprofil nicht gefunden.");
  return profile._id;
}

type DriverContact = { firstName: string; lastName: string; phone: string; vehicle?: { plate: string; label?: string } };

function toSummary(shipment: IShipment, driver?: DriverContact): ShipmentSummary {
  const showDriver = driver && DRIVER_VISIBLE.includes(shipment.status);
  return {
    id: String(shipment._id),
    shipmentNumber: shipment.shipmentNumber,
    status: shipment.status,
    service: shipment.service,
    pickupCity: shipment.pickup.address.city,
    deliveryCity: shipment.delivery.address.city,
    plannedPickupAt: shipment.plannedPickupAt?.toISOString(),
    plannedDeliveryAt: shipment.plannedDeliveryAt?.toISOString(),
    etaAt: shipment.tracking?.etaAt?.toISOString(),
    driver: showDriver ? { firstName: driver.firstName, lastName: driver.lastName, phone: driver.phone } : undefined,
  };
}

function toStopView(stop: Stop): StopView {
  return {
    street: stop.address.line1,
    postalCode: stop.address.postalCode,
    city: stop.address.city,
    countryCode: stop.address.countryCode,
    location: stop.location ? (stop.location.coordinates as LngLat) : undefined,
  };
}

function toLive(shipment: IShipment): ShipmentLive {
  const trackable = TRACKABLE_STATUSES.includes(shipment.status);
  const tracking = shipment.tracking;
  return {
    status: shipment.status,
    trackable,
    position: trackable && tracking?.lastLocation ? (tracking.lastLocation.coordinates as LngLat) : undefined,
    positionAt: trackable ? tracking?.lastLocationAt?.toISOString() : undefined,
    distanceCoveredMeters: trackable ? tracking?.distanceCoveredMeters : undefined,
    etaAt: trackable ? tracking?.etaAt?.toISOString() : undefined,
  };
}

async function driversFor(shipments: IShipment[]): Promise<Map<string, DriverContact>> {
  const ids = shipments.flatMap((shipment) => (shipment.driverId && DRIVER_VISIBLE.includes(shipment.status) ? [shipment.driverId] : []));
  if (ids.length === 0) return new Map();
  const drivers = await DriverProfile.find({ _id: { $in: ids } }).select("firstName lastName phone vehicle").lean();
  return new Map(drivers.map((driver) => [String(driver._id), driver]));
}

async function findShipment(req: Request): Promise<IShipment> {
  if (!Types.ObjectId.isValid(String(req.params.id))) throw AppError.notFound("Auftrag nicht gefunden.");
  const shipment = await Shipment.findOne({ _id: req.params.id, customerId: await currentCustomerId(req) }).lean();
  if (!shipment) throw AppError.notFound("Auftrag nicht gefunden.");
  return shipment;
}

shipmentsRouter.get("/", async (req, res) => {
  const customerId = await currentCustomerId(req);
  const [active, past] = await Promise.all([
    Shipment.find({ customerId, status: { $in: ACTIVE_STATUSES } }).sort({ plannedPickupAt: 1, createdAt: -1 }).limit(50).lean(),
    Shipment.find({ customerId, status: { $nin: ACTIVE_STATUSES } }).sort({ updatedAt: -1 }).limit(10).lean(),
  ]);
  const drivers = await driversFor(active);
  const body: ShipmentListResponse = {
    active: active.map((shipment) => toSummary(shipment, drivers.get(String(shipment.driverId)))),
    past: past.map((shipment) => toSummary(shipment)),
  };
  res.json(body);
});

shipmentsRouter.get("/:id", async (req, res) => {
  const shipment = await findShipment(req);
  const [drivers, documents] = await Promise.all([
    driversFor([shipment]),
    DocumentModel.find({ shipmentId: shipment._id, customerId: shipment.customerId, visibility: "CUSTOMER", status: "READY" })
      .sort({ createdAt: -1 })
      .lean(),
  ]);
  const driver = drivers.get(String(shipment.driverId));
  const shipmentNumbers = new Map([[String(shipment._id), shipment.shipmentNumber]]);

  const body: ShipmentDetail = {
    ...toSummary(shipment, driver),
    customerReference: shipment.customerReference,
    cargoDescription: shipment.cargoDescription,
    pickup: toStopView(shipment.pickup),
    delivery: toStopView(shipment.delivery),
    statusHistory: shipment.statusHistory.map((change) => ({ status: change.status, at: change.at.toISOString() })),
    vehicle: driver?.vehicle && DRIVER_VISIBLE.includes(shipment.status) ? driver.vehicle : undefined,
    route: shipment.route,
    live: toLive(shipment),
    documents: documents.map((document) => toDocumentItem(document, { userId: req.auth!.user.id, shipmentNumbers })),
  };
  res.json(body);
});

/** Leichtgewichtige Abfrage für die Live-Karte (alle paar Sekunden). */
shipmentsRouter.get("/:id/live", async (req, res) => {
  const shipment = await findShipment(req);
  res.set("Cache-Control", "no-store").json(toLive(shipment));
});
