import { LOCATION_HISTORY_DAYS } from "@fa/shared";
import { Schema } from "mongoose";
import { defineModel, GeoPointSchema, ObjectId, type GeoPoint, type Id } from "../db/schema-kit";

/**
 * GPS-Punkte der Fahrer-App als MongoDB-Time-Series (kompakte Bucket-Speicherung).
 * Automatische Löschung nach LOCATION_HISTORY_DAYS. Abfragen filtern zusätzlich auf
 * recordedAt ≥ jetzt − 30 Tage, da Buckets erst als Ganzes ablaufen.
 */
export interface LocationMeta {
  driverId: Id; // → DriverProfile
  shipmentId?: Id; // → Shipment (wird bei Kontolöschung des Kunden entfernt)
}

export interface ILocationLog {
  _id: Id;
  recordedAt: Date; // Gerätezeit (timeField)
  meta: LocationMeta; // metaField → Bucketing je Fahrer/Sendung
  location: GeoPoint;
  accuracyM?: number;
  speedKmh?: number;
  headingDeg?: number;
  receivedAt: Date;
}

const LocationLogSchema = new Schema<ILocationLog>(
  {
    recordedAt: { type: Date, required: true },
    meta: {
      type: new Schema<LocationMeta>(
        {
          driverId: { type: ObjectId, ref: "DriverProfile", required: true },
          shipmentId: { type: ObjectId, ref: "Shipment" },
        },
        { _id: false },
      ),
      required: true,
    },
    location: { type: GeoPointSchema, required: true },
    accuracyM: { type: Number, min: 0 },
    speedKmh: { type: Number, min: 0, max: 250 },
    headingDeg: { type: Number, min: 0, max: 360 },
    receivedAt: { type: Date, default: Date.now },
  },
  {
    timeseries: { timeField: "recordedAt", metaField: "meta", granularity: "seconds" },
    expireAfterSeconds: 60 * 60 * 24 * LOCATION_HISTORY_DAYS,
    versionKey: false,
  },
);

LocationLogSchema.index({ "meta.driverId": 1, recordedAt: -1 }); // Fahrtenverlauf
LocationLogSchema.index({ "meta.shipmentId": 1, recordedAt: 1 }); // Routenverlauf einer Sendung
LocationLogSchema.index({ location: "2dsphere" });

export const LocationLog = defineModel("LocationLog", LocationLogSchema);
