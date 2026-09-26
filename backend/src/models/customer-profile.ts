import {
  ACCOUNT_STATES,
  CUSTOMER_TYPES,
  DEFAULT_NOTIFICATION_PREFERENCES,
  LOCALES,
  type AccountState,
  type CustomerType,
  type Locale,
  type NotificationPreferences,
} from "@fa/shared";
import { Schema } from "mongoose";
import { AddressSchema, defineModel, E164, ObjectId, type Address, type Id } from "../db/schema-kit";

export interface ICustomerProfile {
  _id: Id;
  userId: Id; // → User (1:1)
  customerNumber: string; // "K-10042"
  type: CustomerType;
  firstName: string;
  lastName: string;
  companyName?: string;
  vatId?: string; // USt-IdNr.
  eoriNumber?: string; // Zollabwicklung
  phone?: string; // E.164
  billingAddress?: Address;
  locale: Locale;
  accountManagerId?: Id; // → User (ADMIN)
  internalNotes?: string; // nur für Mitarbeiter
  state: AccountState;
  notifications: NotificationPreferences; // E-Mail-Benachrichtigungen (Einstellungen)
  searchText: string; // Nummer, Name, Firma, E-Mail – kleingeschrieben, vom Service gepflegt
  createdAt: Date;
  updatedAt: Date;
}

const NotificationsSchema = new Schema<NotificationPreferences>(
  {
    shipmentUpdates: { type: Boolean, default: DEFAULT_NOTIFICATION_PREFERENCES.shipmentUpdates },
    documents: { type: Boolean, default: DEFAULT_NOTIFICATION_PREFERENCES.documents },
    invoices: { type: Boolean, default: DEFAULT_NOTIFICATION_PREFERENCES.invoices },
    chatReplies: { type: Boolean, default: DEFAULT_NOTIFICATION_PREFERENCES.chatReplies },
  },
  { _id: false },
);

const CustomerProfileSchema = new Schema<ICustomerProfile>(
  {
    userId: { type: ObjectId, ref: "User", required: true },
    customerNumber: { type: String, required: true },
    type: { type: String, enum: CUSTOMER_TYPES, default: "PRIVATE" },
    firstName: { type: String, required: true, trim: true, maxlength: 100 },
    lastName: { type: String, required: true, trim: true, maxlength: 100 },
    companyName: { type: String, trim: true, maxlength: 200 },
    vatId: { type: String, trim: true, uppercase: true, maxlength: 20 },
    eoriNumber: { type: String, trim: true, uppercase: true, maxlength: 17 },
    phone: { type: String, match: E164 },
    billingAddress: AddressSchema,
    locale: { type: String, enum: LOCALES, default: "de" },
    accountManagerId: { type: ObjectId, ref: "User" },
    internalNotes: { type: String, maxlength: 5000, select: false },
    state: { type: String, enum: ACCOUNT_STATES, default: "ACTIVE" },
    notifications: { type: NotificationsSchema, default: () => ({}) },
    // Admin-Suche per Regex – für diese Größenordnung ausreichend, später ggf. Atlas Search.
    searchText: { type: String, default: "" },
  },
  { timestamps: true },
);

CustomerProfileSchema.index({ userId: 1 }, { unique: true });
CustomerProfileSchema.index({ customerNumber: 1 }, { unique: true });
CustomerProfileSchema.index({ state: 1, createdAt: -1 });

export const CustomerProfile = defineModel("CustomerProfile", CustomerProfileSchema);
