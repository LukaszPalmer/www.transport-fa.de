import type { AdminShipmentRow } from "@fa/shared";
import type { Types } from "mongoose";
import { CustomerProfile, DocumentModel, DriverProfile, nextSequence, type IShipment } from "../models";
import { invoicesByShipment } from "./invoices";

/** Gemeinsame Bausteine für Auftragslisten im Admin-Bereich (Aufträge, 360°-Akte). */

export async function nextShipmentNumber(): Promise<string> {
  const year = new Date().getFullYear();
  return `SN-${year}-${String(await nextSequence(`shipment:${year}`)).padStart(5, "0")}`;
}

type ShipmentLike = Pick<
  IShipment,
  "_id" | "shipmentNumber" | "status" | "service" | "customerId" | "driverId" | "pickup" | "delivery" | "plannedPickupAt" | "plannedDeliveryAt" | "createdAt"
>;

/**
 * Lädt Kunden, Fahrer und Dokumentanzahl in je einer Abfrage und baut die Tabellenzeilen.
 * Mit `withInvoices` (Recht „Rechnungen & Belege“) auch Rechnung bzw. Entwurf je Auftrag.
 */
export async function toAdminShipmentRows(shipments: ShipmentLike[], { withInvoices = false } = {}): Promise<AdminShipmentRow[]> {
  if (shipments.length === 0) return [];
  const customerIds = [...new Set(shipments.map((shipment) => String(shipment.customerId)))];
  const driverIds = [...new Set(shipments.flatMap((shipment) => (shipment.driverId ? [String(shipment.driverId)] : [])))];
  const shipmentIds = shipments.map((shipment) => shipment._id);

  const [customers, drivers, documentCounts, billing] = await Promise.all([
    CustomerProfile.find({ _id: { $in: customerIds } }).select("customerNumber firstName lastName companyName").lean(),
    driverIds.length ? DriverProfile.find({ _id: { $in: driverIds } }).select("firstName lastName phone vehicle").lean() : [],
    DocumentModel.aggregate<{ _id: Types.ObjectId; count: number }>([
      { $match: { shipmentId: { $in: shipmentIds }, status: "READY" } },
      { $group: { _id: "$shipmentId", count: { $sum: 1 } } },
    ]),
    withInvoices ? invoicesByShipment(shipmentIds) : undefined,
  ]);
  const customerById = new Map(customers.map((customer) => [String(customer._id), customer]));
  const driverById = new Map(drivers.map((driver) => [String(driver._id), driver]));
  const documentsById = new Map(documentCounts.map((entry) => [String(entry._id), entry.count]));

  return shipments.map((shipment) => {
    const customer = customerById.get(String(shipment.customerId));
    const driver = shipment.driverId ? driverById.get(String(shipment.driverId)) : undefined;
    return {
      id: String(shipment._id),
      shipmentNumber: shipment.shipmentNumber,
      status: shipment.status,
      service: shipment.service,
      customer: {
        id: String(shipment.customerId),
        customerNumber: customer?.customerNumber ?? "–",
        name: customer ? customer.companyName || `${customer.firstName} ${customer.lastName}` : "Gelöschter Kunde",
      },
      pickupCity: shipment.pickup.address.city,
      deliveryCity: shipment.delivery.address.city,
      plannedPickupAt: shipment.plannedPickupAt?.toISOString(),
      plannedDeliveryAt: shipment.plannedDeliveryAt?.toISOString(),
      driver: driver
        ? { id: String(driver._id), name: `${driver.firstName} ${driver.lastName}`, phone: driver.phone, plate: driver.vehicle?.plate }
        : undefined,
      documents: documentsById.get(String(shipment._id)) ?? 0,
      invoice: billing?.invoices.get(String(shipment._id)),
      invoiceDraftId: billing?.drafts.get(String(shipment._id)),
      createdAt: shipment.createdAt.toISOString(),
    };
  });
}
