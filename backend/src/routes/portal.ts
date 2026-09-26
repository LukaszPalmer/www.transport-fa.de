import {
  effectivePaymentStatus,
  type DocumentSummary,
  type InvoiceSummary,
  type PortalOverview,
  type ShipmentStatus,
  type ShipmentSummary,
} from "@fa/shared";
import { Router } from "express";
import { requireRole, requireVerifiedEmail } from "../auth/middleware";
import { AppError } from "../http/errors";
import { CustomerProfile, DocumentModel, DriverProfile, Invoice, Shipment } from "../models";
import { toCustomerSummary } from "../services/customers";
import { documentsRouter } from "./portal-documents";
import { invoicesRouter } from "./portal-invoices";
import { shipmentsRouter } from "./portal-shipments";

/**
 * /api/v1/portal – Daten des angemeldeten Kunden. Jede Abfrage ist fest auf
 * seine customerId beschränkt; fremde Daten sind nicht adressierbar.
 */
export const portalRouter = Router();

portalRouter.use(requireRole("CUSTOMER"), requireVerifiedEmail);
portalRouter.use("/documents", documentsRouter);
portalRouter.use("/invoices", invoicesRouter);
portalRouter.use("/shipments", shipmentsRouter);

const ACTIVE_SHIPMENT_STATUSES: ShipmentStatus[] = ["PLANNED", "ASSIGNED", "EN_ROUTE_TO_PICKUP", "IN_TRANSIT"];
const DRIVER_VISIBLE_STATUSES: ShipmentStatus[] = ["ASSIGNED", "EN_ROUTE_TO_PICKUP", "IN_TRANSIT"];

portalRouter.get("/overview", async (req, res) => {
  const customer = await CustomerProfile.findOne({ userId: req.auth!.user.id }).lean();
  if (!customer) throw AppError.notFound("Kundenprofil nicht gefunden.");
  const customerId = customer._id;

  const openInvoiceFilter = { customerId, type: "INVOICE" as const, paymentStatus: "PENDING" as const };
  const customerDocumentFilter = { customerId, visibility: "CUSTOMER" as const, status: "READY" as const };

  const [shipments, activeShipmentCount, invoices, openInvoiceTotals, overdueInvoices, documents, documentCount] = await Promise.all([
    Shipment.find({ customerId, status: { $in: ACTIVE_SHIPMENT_STATUSES } }).sort({ plannedPickupAt: 1, createdAt: -1 }).limit(3).lean(),
    Shipment.countDocuments({ customerId, status: { $in: ACTIVE_SHIPMENT_STATUSES } }),
    Invoice.find(openInvoiceFilter).sort({ dueDate: 1 }).limit(5).lean(),
    Invoice.aggregate<{ count: number; gross: number }>([
      { $match: openInvoiceFilter },
      { $group: { _id: null, count: { $sum: 1 }, gross: { $sum: "$grossCents" } } },
    ]),
    Invoice.countDocuments({ ...openInvoiceFilter, dueDate: { $lt: new Date() } }),
    DocumentModel.find(customerDocumentFilter).sort({ createdAt: -1 }).limit(5).lean(),
    DocumentModel.countDocuments(customerDocumentFilter),
  ]);

  const driverIds = shipments.filter((s) => s.driverId && DRIVER_VISIBLE_STATUSES.includes(s.status)).map((s) => s.driverId!);
  const drivers = driverIds.length
    ? await DriverProfile.find({ _id: { $in: driverIds } }).select("firstName lastName phone").lean()
    : [];
  const driverById = new Map(drivers.map((driver) => [String(driver._id), driver]));

  const activeShipments: ShipmentSummary[] = shipments.map((shipment) => {
    const driver = shipment.driverId && DRIVER_VISIBLE_STATUSES.includes(shipment.status) ? driverById.get(String(shipment.driverId)) : undefined;
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
      driver: driver ? { firstName: driver.firstName, lastName: driver.lastName, phone: driver.phone } : undefined,
    };
  });

  const openInvoices: InvoiceSummary[] = invoices.map((invoice) => ({
    id: String(invoice._id),
    type: invoice.type,
    number: invoice.number,
    grossCents: invoice.grossCents,
    issueDate: invoice.issueDate.toISOString(),
    dueDate: invoice.dueDate?.toISOString(),
    paymentStatus: effectivePaymentStatus(invoice.paymentStatus, invoice.dueDate),
  }));

  const recentDocuments: DocumentSummary[] = documents.map((document) => ({
    id: String(document._id),
    title: document.title,
    category: document.category,
    mimeType: document.storage.mimeType,
    sizeBytes: document.storage.sizeBytes,
    createdAt: document.createdAt.toISOString(),
  }));

  const body: PortalOverview = {
    customer: toCustomerSummary(customer),
    stats: {
      activeShipments: activeShipmentCount,
      openInvoices: openInvoiceTotals[0]?.count ?? 0,
      openInvoicesGrossCents: openInvoiceTotals[0]?.gross ?? 0,
      overdueInvoices,
      documents: documentCount,
    },
    activeShipments,
    openInvoices,
    recentDocuments,
  };
  res.json(body);
});
