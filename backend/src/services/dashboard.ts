import type { AdminDashboard, LeadStatus, Permission, ShipmentStatus } from "@fa/shared";
import { berlinMidnight, berlinMonthStart, berlinYearMonth } from "../lib/berlin-time";
import { AuditLog, ChatSession, CustomerProfile, DriverProfile, Invoice, Lead, Shipment, User } from "../models";
import { onlineUserIds } from "../realtime/presence";
import { toActivityItems } from "./activity";
import { invoiceStats } from "./invoices";

/**
 * Admin-Übersicht: Kennzahlen, Finanzen (12 Monate), anstehende Aufträge, neueste Anfragen und
 * Team-Aktivität – jeweils nur, wofür der Mitarbeiter das Recht hat.
 */

const ACTIVE_STATUSES: ShipmentStatus[] = ["PLANNED", "ASSIGNED", "EN_ROUTE_TO_PICKUP", "IN_TRANSIT"];
const OPEN_LEAD_STATUSES: LeadStatus[] = ["NEW", "CONTACTED", "OFFER_SENT"];

/** Die letzten 12 Monate (inkl. aktuellem) als JJJJ-MM, älteste zuerst. */
function lastTwelveMonths(): { keys: string[]; start: Date } {
  const { year, month } = berlinYearMonth();
  const keys: string[] = [];
  for (let offset = 11; offset >= 0; offset--) {
    const date = new Date(Date.UTC(year, month - 1 - offset, 1));
    keys.push(`${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`);
  }
  const [startYear, startMonth] = keys[0]!.split("-").map(Number) as [number, number];
  return { keys, start: berlinMidnight(startYear, startMonth) };
}

async function financeSeries(): Promise<NonNullable<AdminDashboard["finance"]>["months"]> {
  const { keys, start } = lastTwelveMonths();
  const monthOf = (field: string) => ({ $dateToString: { format: "%Y-%m", date: field, timezone: "Europe/Berlin" } });
  const [invoiced, paid] = await Promise.all([
    Invoice.aggregate<{ _id: string; total: number }>([
      { $match: { type: "INVOICE", paymentStatus: { $ne: "CANCELLED" }, issueDate: { $gte: start } } },
      { $group: { _id: monthOf("$issueDate"), total: { $sum: "$grossCents" } } },
    ]),
    Invoice.aggregate<{ _id: string; total: number }>([
      { $match: { type: "INVOICE", paymentStatus: "PAID", paidAt: { $gte: start } } },
      { $group: { _id: monthOf("$paidAt"), total: { $sum: "$grossCents" } } },
    ]),
  ]);
  const invoicedBy = new Map(invoiced.map((entry) => [entry._id, entry.total]));
  const paidBy = new Map(paid.map((entry) => [entry._id, entry.total]));
  return keys.map((month) => ({ month, invoicedGrossCents: invoicedBy.get(month) ?? 0, paidGrossCents: paidBy.get(month) ?? 0 }));
}

async function upcomingShipments(): Promise<AdminDashboard["upcoming"]> {
  const { year, month } = berlinYearMonth();
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin" }).format(new Date());
  const start = berlinMidnight(year, month, Number(today.slice(8, 10)));
  const end = new Date(start.getTime() + 8 * 24 * 60 * 60 * 1000);
  const shipments = await Shipment.find({ status: { $in: ACTIVE_STATUSES }, plannedPickupAt: { $gte: start, $lt: end } })
    .sort({ plannedPickupAt: 1 })
    .limit(10)
    .select("shipmentNumber status service customerId driverId pickup.address.city delivery.address.city plannedPickupAt")
    .lean();
  const [customers, drivers] = await Promise.all([
    CustomerProfile.find({ _id: { $in: shipments.map((shipment) => shipment.customerId) } }).select("firstName lastName companyName").lean(),
    DriverProfile.find({ _id: { $in: shipments.flatMap((shipment) => (shipment.driverId ? [shipment.driverId] : [])) } }).select("firstName lastName").lean(),
  ]);
  const customerName = new Map(customers.map((customer) => [String(customer._id), customer.companyName || `${customer.firstName} ${customer.lastName}`]));
  const driverName = new Map(drivers.map((driver) => [String(driver._id), `${driver.firstName} ${driver.lastName}`]));
  return shipments.map((shipment) => ({
    id: String(shipment._id),
    shipmentNumber: shipment.shipmentNumber,
    status: shipment.status,
    service: shipment.service,
    customerName: customerName.get(String(shipment.customerId)) ?? "–",
    route: `${shipment.pickup.address.city} → ${shipment.delivery.address.city}`,
    plannedPickupAt: shipment.plannedPickupAt!.toISOString(),
    driverName: shipment.driverId ? driverName.get(String(shipment.driverId)) : undefined,
  }));
}

export async function buildDashboard(permissions: Permission[], isAdmin: boolean): Promise<AdminDashboard> {
  const has = (permission: Permission) => permissions.includes(permission);
  const online = onlineUserIds();
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);
  const seesOrders = has("can_manage_orders") || has("can_manage_drivers") || has("can_view_customers");
  const seesFinance = has("can_manage_invoices") || has("can_manage_accounting");

  const [customers, customersOnline, newCustomersThisMonth, activeShipments, unassignedShipments, openChats, unreadChats, newLeads, followUpsDue] = await Promise.all([
    CustomerProfile.countDocuments(),
    online.length ? User.countDocuments({ _id: { $in: online }, role: "CUSTOMER" }) : 0,
    CustomerProfile.countDocuments({ createdAt: { $gte: berlinMonthStart() } }),
    Shipment.countDocuments({ status: { $in: ACTIVE_STATUSES } }),
    Shipment.countDocuments({ status: "PLANNED", driverId: { $exists: false } }),
    ChatSession.countDocuments({ status: { $ne: "RESOLVED" } }),
    ChatSession.countDocuments({ status: { $ne: "RESOLVED" }, unreadByStaff: { $gt: 0 } }),
    has("can_manage_leads") ? Lead.countDocuments({ status: "NEW" }) : 0,
    has("can_manage_leads") ? Lead.countDocuments({ status: { $in: OPEN_LEAD_STATUSES }, followUpAt: { $lte: endOfToday } }) : 0,
  ]);

  const [stats, months, upcoming, recentLeads, activity] = await Promise.all([
    seesFinance ? invoiceStats() : null,
    seesFinance ? financeSeries() : null,
    seesOrders ? upcomingShipments() : [],
    has("can_manage_leads") ? Lead.find().sort({ createdAt: -1 }).limit(5).select("number name topic status createdAt").lean() : [],
    isAdmin ? AuditLog.find({ action: { $nin: ["admin.customer_viewed", "document.opened_by_staff", "auth.mfa_verified"] } }).sort({ createdAt: -1 }).limit(10).lean() : null,
  ]);

  return {
    stats: { customers, customersOnline, newCustomersThisMonth, activeShipments, unassignedShipments, openChats, unreadChats, newLeads, followUpsDue },
    finance:
      stats && months
        ? {
            paidThisMonthGrossCents: stats.paidThisMonthGrossCents,
            paidThisYearGrossCents: stats.paidThisYearGrossCents,
            paidTotalGrossCents: stats.paidTotalGrossCents,
            openGrossCents: stats.openGrossCents,
            overdueCount: stats.overdueCount,
            overdueGrossCents: stats.overdueGrossCents,
            months,
          }
        : undefined,
    upcoming,
    recentLeads: recentLeads.map((lead) => ({ id: String(lead._id), number: lead.number, name: lead.name, topic: lead.topic, status: lead.status, createdAt: lead.createdAt.toISOString() })),
    activity: activity ? await toActivityItems(activity) : undefined,
  };
}
