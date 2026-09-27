import {
  UpdateCustomerCrmInput,
  UpdateCustomerProfileInput,
  type AdminCustomerDetail,
  type AdminCustomerList,
  type AdminCustomerRow,
  type AdminDocumentItem,
  type ShipmentStatus,
} from "@fa/shared";
import { Router } from "express";
import { Types } from "mongoose";
import { z } from "zod";
import { requirePermission } from "../../auth/middleware";
import { AppError } from "../../http/errors";
import { audit } from "../../lib/audit";
import { ChatSession, CustomerProfile, DocumentModel, Invoice, Lead, Shipment, StaffProfile, User } from "../../models";
import { isOnline, onlineUserIds } from "../../realtime/presence";
import { toAdminShipmentRows } from "../../services/admin-shipments";
import { buildSearchText, toPostalAddress } from "../../services/customers";
import { toAdminInvoiceRows } from "../../services/invoices";

/** /api/v1/admin/customers – Kundenliste mit Online-Status und 360°-Akte. */
export const adminCustomersRouter = Router();

adminCustomersRouter.use(requirePermission("can_view_customers"));

const ACTIVE_STATUSES: ShipmentStatus[] = ["PLANNED", "ASSIGNED", "EN_ROUTE_TO_PICKUP", "IN_TRANSIT"];

const ListQuery = z.object({
  q: z.string().trim().max(100).optional(),
  online: z.enum(["1"]).optional(),
  page: z.coerce.number().int().min(1).max(1000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

adminCustomersRouter.get("/", async (req, res) => {
  const query = ListQuery.parse(req.query);
  const filter: Record<string, unknown> = {};
  if (query.q) filter.searchText = { $regex: escapeRegex(query.q.toLowerCase()) };
  if (query.online) filter.userId = { $in: onlineUserIds().map((id) => new Types.ObjectId(id)) };

  const [profiles, total] = await Promise.all([
    CustomerProfile.find(filter)
      .sort({ createdAt: -1 })
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .select("userId customerNumber firstName lastName companyName billingAddress createdAt")
      .lean(),
    CustomerProfile.countDocuments(filter),
  ]);

  const customerIds = profiles.map((profile) => profile._id);
  const [users, activeCounts, lastChats] = await Promise.all([
    User.find({ _id: { $in: profiles.map((profile) => profile.userId) } }).select("email emailVerifiedAt lastSeenAt").lean(),
    Shipment.aggregate<{ _id: Types.ObjectId; count: number }>([
      { $match: { customerId: { $in: customerIds }, status: { $in: ACTIVE_STATUSES } } },
      { $group: { _id: "$customerId", count: { $sum: 1 } } },
    ]),
    ChatSession.aggregate<{ _id: Types.ObjectId; at: Date; preview: string; status: string }>([
      { $match: { customerId: { $in: customerIds } } },
      { $sort: { lastMessageAt: -1 } },
      { $group: { _id: "$customerId", at: { $first: "$lastMessageAt" }, preview: { $first: "$lastMessagePreview" }, status: { $first: "$status" } } },
    ]),
  ]);
  const userById = new Map(users.map((user) => [String(user._id), user]));
  const activeById = new Map(activeCounts.map((entry) => [String(entry._id), entry.count]));
  const chatById = new Map(lastChats.map((entry) => [String(entry._id), entry]));

  const customers: AdminCustomerRow[] = profiles.map((profile) => {
    const user = userById.get(String(profile.userId));
    const chat = chatById.get(String(profile._id));
    return {
      id: String(profile._id),
      userId: String(profile.userId),
      customerNumber: profile.customerNumber,
      name: `${profile.firstName} ${profile.lastName}`,
      companyName: profile.companyName,
      billingAddress: profile.billingAddress ? toPostalAddress(profile.billingAddress) : undefined,
      email: user?.email ?? "",
      emailVerified: Boolean(user?.emailVerifiedAt),
      online: isOnline(profile.userId),
      lastSeenAt: user?.lastSeenAt?.toISOString(),
      createdAt: profile.createdAt.toISOString(),
      activeShipments: activeById.get(String(profile._id)) ?? 0,
      lastConversation: chat ? { at: chat.at.toISOString(), preview: chat.preview, open: chat.status !== "RESOLVED" } : undefined,
    };
  });

  const body: AdminCustomerList = { customers, total };
  res.json(body);
});

/** 360°-Akte: Stammdaten, Konto, alle Aufträge, Dokumente (auch interne), Belege und Chats. */
adminCustomersRouter.get("/:id", async (req, res) => {
  if (!Types.ObjectId.isValid(String(req.params.id))) throw AppError.notFound("Kunde nicht gefunden.");
  const profile = await CustomerProfile.findById(req.params.id).select("+internalNotes").lean();
  if (!profile) throw AppError.notFound("Kunde nicht gefunden.");

  const canSeeInvoices = req.staff!.permissions.includes("can_manage_invoices");
  const [user, shipments, documents, invoices, chats, leads] = await Promise.all([
    User.findById(profile.userId).select("+passwordHash").lean(),
    Shipment.find({ customerId: profile._id }).sort({ createdAt: -1 }).limit(200).lean(),
    DocumentModel.find({ customerId: profile._id, status: "READY" }).sort({ createdAt: -1 }).limit(500).lean(),
    canSeeInvoices ? Invoice.find({ customerId: profile._id }).sort({ issueDate: -1, createdAt: -1 }).limit(200).lean() : [],
    ChatSession.find({ customerId: profile._id }).sort({ lastMessageAt: -1 }).limit(50).lean(),
    Lead.find({ customerId: profile._id }).sort({ createdAt: -1 }).limit(20).select("number status topic createdAt").lean(),
  ]);
  if (!user) throw AppError.notFound("Kunde nicht gefunden.");

  const shipmentNumbers = new Map(shipments.map((shipment) => [String(shipment._id), shipment.shipmentNumber]));
  const canSeeDocuments = req.staff!.permissions.includes("can_view_documents");
  const documentItems: AdminDocumentItem[] = canSeeDocuments
    ? documents.map((document) => ({
        id: String(document._id),
        title: document.title,
        category: document.category,
        mimeType: document.storage.mimeType,
        sizeBytes: document.storage.sizeBytes,
        createdAt: document.createdAt.toISOString(),
        source: document.uploadedByRole === "CUSTOMER" ? "CUSTOMER" : "OFFICE",
        visibility: document.visibility,
        handToDriver: document.handToDriver ?? false,
        shipmentNumber: document.shipmentId ? shipmentNumbers.get(String(document.shipmentId)) : undefined,
      }))
    : [];

  const body: AdminCustomerDetail = {
    customer: {
      id: String(profile._id),
      customerNumber: profile.customerNumber,
      firstName: profile.firstName,
      lastName: profile.lastName,
      companyName: profile.companyName,
      phone: profile.phone,
      type: profile.type,
      vatId: profile.vatId,
      billingAddress: profile.billingAddress ? toPostalAddress(profile.billingAddress) : undefined,
      locale: profile.locale ?? "de",
      createdAt: profile.createdAt.toISOString(),
    },
    user: {
      id: String(user._id),
      email: user.email,
      emailVerified: Boolean(user.emailVerifiedAt),
      hasPassword: Boolean(user.passwordHash),
      googleLinked: Boolean(user.googleSub),
      state: user.state,
      lastLoginAt: user.lastLoginAt?.toISOString(),
      lastSeenAt: user.lastSeenAt?.toISOString(),
      createdAt: user.createdAt.toISOString(),
    },
    online: isOnline(user._id),
    shipments: await toAdminShipmentRows(shipments, { withInvoices: canSeeInvoices }),
    documents: documentItems,
    invoices: await toAdminInvoiceRows(invoices),
    chats: chats.map((chat) => ({
      id: String(chat._id),
      status: chat.status,
      lastMessageAt: chat.lastMessageAt.toISOString(),
      preview: chat.lastMessagePreview,
      unreadByStaff: chat.unreadByStaff,
    })),
    crm: {
      internalNotes: profile.internalNotes ?? "",
      accountManagerId: profile.accountManagerId ? String(profile.accountManagerId) : undefined,
      leads: leads.map((lead) => ({ id: String(lead._id), number: lead.number, status: lead.status, topic: lead.topic, createdAt: lead.createdAt.toISOString() })),
    },
  };
  audit(req, "admin.customer_viewed", { targetType: "CustomerProfile", targetId: profile._id, customerId: profile._id });
  res.json(body);
});

/** CRM-Felder der Kundenakte: interne Notizen und zuständiger Betreuer. */
adminCustomersRouter.patch("/:id/crm", async (req, res) => {
  if (!Types.ObjectId.isValid(String(req.params.id))) throw AppError.notFound("Kunde nicht gefunden.");
  const input = UpdateCustomerCrmInput.parse(req.body);
  const set: Record<string, unknown> = {};
  const unset: Record<string, 1> = {};
  if (input.internalNotes !== undefined) {
    if (input.internalNotes.trim()) set.internalNotes = input.internalNotes.trim();
    else unset.internalNotes = 1;
  }
  if (input.accountManagerId !== undefined) {
    if (input.accountManagerId) {
      if (!(await StaffProfile.exists({ userId: input.accountManagerId }))) throw AppError.validation({ accountManagerId: "Mitarbeiter nicht gefunden." });
      set.accountManagerId = new Types.ObjectId(input.accountManagerId);
    } else unset.accountManagerId = 1;
  }
  const result = await CustomerProfile.updateOne({ _id: req.params.id }, { ...(Object.keys(set).length ? { $set: set } : {}), ...(Object.keys(unset).length ? { $unset: unset } : {}) });
  if (result.matchedCount === 0) throw AppError.notFound("Kunde nicht gefunden.");
  audit(req, "admin.customer_updated", { targetType: "CustomerProfile", targetId: new Types.ObjectId(String(req.params.id)), customerId: new Types.ObjectId(String(req.params.id)), meta: { fields: Object.keys({ ...set, ...unset }) } });
  res.status(204).end();
});

/** Stammdaten durch das Büro: Name, Firma, Kundentyp, USt-IdNr., Telefon und Rechnungsadresse. */
adminCustomersRouter.patch("/:id/profile", requirePermission("can_edit_customers"), async (req, res) => {
  if (!Types.ObjectId.isValid(String(req.params.id))) throw AppError.notFound("Kunde nicht gefunden.");
  const input = UpdateCustomerProfileInput.parse(req.body);
  const profile = await CustomerProfile.findById(req.params.id).lean();
  if (!profile) throw AppError.notFound("Kunde nicht gefunden.");
  const user = await User.findById(profile.userId).select("email").lean();

  const set: Record<string, unknown> = {
    type: input.type,
    firstName: input.firstName,
    lastName: input.lastName,
    billingAddress: input.billingAddress,
    searchText: buildSearchText({ ...profile, ...input }, user?.email ?? ""),
  };
  const unset: Record<string, 1> = {};
  for (const field of ["companyName", "vatId", "phone"] as const) {
    if (input[field]) set[field] = input[field];
    else unset[field] = 1;
  }
  await CustomerProfile.updateOne({ _id: profile._id }, { $set: set, ...(Object.keys(unset).length ? { $unset: unset } : {}) }, { runValidators: true });
  await User.updateOne({ _id: profile.userId }, { name: `${input.firstName} ${input.lastName}` });
  audit(req, "admin.customer_updated", { targetType: "CustomerProfile", targetId: profile._id, customerId: profile._id, meta: { fields: ["stammdaten"] } });
  res.status(204).end();
});
