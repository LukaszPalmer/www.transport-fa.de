import { Schema, type ClientSession } from "mongoose";
import { defineModel } from "../db/schema-kit";

/** Fortlaufende Nummern. Schlüssel: "customer" → K-10001, "shipment:2026" → SN-2026-00001 */
export interface ICounter {
  _id: string;
  seq: number;
}

const CounterSchema = new Schema<ICounter>(
  { _id: { type: String, required: true }, seq: { type: Number, default: 0 } },
  { versionKey: false },
);

export const Counter = defineModel("Counter", CounterSchema);

/** Atomar – auch bei gleichzeitigen Anfragen keine doppelten Nummern. */
export async function nextSequence(key: string, session?: ClientSession): Promise<number> {
  const counter = await Counter.findOneAndUpdate(
    { _id: key },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after", session },
  ).lean();
  if (!counter) throw new Error(`Zähler "${key}" konnte nicht erhöht werden`);
  return counter.seq;
}
