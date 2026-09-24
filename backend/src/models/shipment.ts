import { SERVICE_SLUGS, SHIPMENT_STATUSES, type ServiceSlug, type ShipmentStatus } from "@fa/shared";
import { Schema } from "mongoose";
import {
  AddressSchema,
  defineModel,
  E164,
  GeoPointSchema,
  ObjectId,
  type Address,
  type GeoPoint,
  type Id,
} from "../db/schema-kit";

export interface Stop {
  address: Address;
  location?: GeoPoint; // geokodiert
  contactName?: string;
  contactPhone?: string;
  notes?: string;
}

export interface ShipmentRoute {
  polyline: string; // Encoded Polyline der geplanten Route
  distanceMeters: number;
  durationSeconds: number;
}

export interface ShipmentTracking {
  lastLocation?: GeoPoint;
  lastLocationAt?: Date;
  distanceCoveredMeters: number;
  etaAt?: Date;
}

export interface StatusChange {
  status: ShipmentStatus;
  at: Date;
  byUserId?: Id;
}

export interface IShipment {
  _id: Id;
  shipmentNumber: string; // "SN-2026-00123"
  customerId: Id; // → CustomerProfile
  driverId?: Id; // → DriverProfile
  service: ServiceSlug;
  status: ShipmentStatus;
  cargoDescription?: string;
  customerReference?: string;
  pickup: Stop;
  delivery: Stop;
  plannedPickupAt?: Date;
  plannedDeliveryAt?: Date;
  pickedUpAt?: Date;
  deliveredAt?: Date;
  route?: ShipmentRoute;
  tracking?: ShipmentTracking; // Live-Snapshot: Karte lädt mit einer Abfrage
  statusHistory: StatusChange[];
  internalNotes?: string; // nur für Mitarbeiter
  createdAt: Date;
  updatedAt: Date;
}

const StopSchema = new Schema<Stop>(
  {
    address: { type: AddressSchema, required: true },
    location: GeoPointSchema,
    contactName: { type: String, trim: true, maxlength: 120 },
    contactPhone: { type: String, match: E164 },
    notes: { type: String, maxlength: 1000 },
  },
  { _id: false },
);

const ShipmentSchema = new Schema<IShipment>(
  {
    shipmentNumber: { type: String, required: true },
    customerId: { type: ObjectId, ref: "CustomerProfile", required: true },
    driverId: { type: ObjectId, ref: "DriverProfile" },
    service: { type: String, enum: SERVICE_SLUGS, required: true },
    status: { type: String, enum: SHIPMENT_STATUSES, default: "PLANNED" },
    cargoDescription: { type: String, maxlength: 2000 },
    customerReference: { type: String, trim: true, maxlength: 100 },
    pickup: { type: StopSchema, required: true },
    delivery: { type: StopSchema, required: true },
    plannedPickupAt: Date,
    plannedDeliveryAt: Date,
    pickedUpAt: Date,
    deliveredAt: Date,
    route: new Schema<ShipmentRoute>(
      {
        polyline: { type: String, required: true },
        distanceMeters: { type: Number, required: true, min: 0 },
        durationSeconds: { type: Number, required: true, min: 0 },
      },
      { _id: false },
    ),
    tracking: new Schema<ShipmentTracking>(
      {
        lastLocation: GeoPointSchema,
        lastLocationAt: Date,
        distanceCoveredMeters: { type: Number, default: 0, min: 0 },
        etaAt: Date,
      },
      { _id: false },
    ),
    statusHistory: {
      type: [
        new Schema<StatusChange>(
          {
            status: { type: String, enum: SHIPMENT_STATUSES, required: true },
            at: { type: Date, default: Date.now },
            byUserId: { type: ObjectId, ref: "User" },
          },
          { _id: false },
        ),
      ],
      default: [],
    },
    internalNotes: { type: String, maxlength: 5000, select: false },
  },
  { timestamps: true },
);

ShipmentSchema.index({ shipmentNumber: 1 }, { unique: true });
ShipmentSchema.index({ customerId: 1, createdAt: -1 });
ShipmentSchema.index({ driverId: 1, status: 1 });
ShipmentSchema.index({ status: 1, plannedPickupAt: 1 }); // Disposition

export const Shipment = defineModel("Shipment", ShipmentSchema);
