import type { MeResponse } from "@fa/shared";
import type { Types } from "mongoose";
import { AppError } from "../http/errors";
import { CustomerProfile, User } from "../models";
import { toCustomerSummary } from "./customers";

/** Antwort für GET /auth/me – nur Felder, die das Frontend wirklich braucht (DTO). */
export async function buildMeResponse(userId: Types.ObjectId): Promise<MeResponse> {
  const user = await User.findById(userId).select("+passwordHash").lean();
  if (!user) throw AppError.unauthenticated();

  const profile = user.role === "CUSTOMER" ? await CustomerProfile.findOne({ userId }).lean() : null;

  return {
    user: {
      id: String(user._id),
      email: user.email,
      name: user.name,
      role: user.role,
      emailVerified: Boolean(user.emailVerifiedAt),
      avatarUrl: user.avatarUrl,
      hasPassword: Boolean(user.passwordHash),
      createdAt: user.createdAt.toISOString(),
    },
    customer: profile ? toCustomerSummary(profile) : null,
  };
}
