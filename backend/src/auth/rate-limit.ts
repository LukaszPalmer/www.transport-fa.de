import type { mongo } from "mongoose";
import { AppError } from "../http/errors";
import { sha256 } from "../lib/crypto";
import { RateLimit, type IRateLimit } from "../models";

const collection = () => RateLimit.collection as unknown as mongo.Collection<IRateLimit>;

/**
 * Feste Zeitfenster in MongoDB – funktioniert auch mit mehreren API-Instanzen.
 * Ein einziger atomarer Aufruf: zählt hoch oder startet ein neues Fenster.
 */
export async function consumeRateLimit(key: string, limit: number, windowSeconds: number): Promise<void> {
  const now = new Date();
  const windowEnd = new Date(now.getTime() + windowSeconds * 1000);
  const expired = { $or: [{ $eq: [{ $type: "$expiresAt" }, "missing"] }, { $lt: ["$expiresAt", now] }] };

  const entry = await collection().findOneAndUpdate(
    { _id: key },
    [
      {
        $set: {
          count: { $cond: [expired, 1, { $add: ["$count", 1] }] },
          expiresAt: { $cond: [expired, windowEnd, "$expiresAt"] },
        },
      },
    ],
    { upsert: true, returnDocument: "after" },
  );

  if (entry && entry.count > limit) {
    throw AppError.rateLimited("Zu viele Versuche. Bitte warten Sie einen Moment und versuchen Sie es erneut.");
  }
}

/** E-Mail-Adressen nur gehasht als Schlüssel ablegen. */
export function emailKey(prefix: string, email: string): string {
  return `${prefix}:email:${sha256(email)}`;
}
