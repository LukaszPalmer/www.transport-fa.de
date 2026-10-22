import type { Types } from "mongoose";
import { googleEnabled } from "../auth/google";
import { env } from "../config/env";
import { sendMail } from "../mail/mailer";
import { invitationMail } from "../mail/templates";
import type { ICustomerProfile, IUser } from "../models";
import { issueAuthToken } from "./auth-tokens";

/**
 * Zugangslink für Kunden, die das Büro angelegt hat: 7 Tage gültig, führt auf die Seite
 * „Passwort festlegen“. Ein neuer Link macht den vorherigen ungültig. Liefert false, wenn
 * der Versand fehlschlug.
 */
export async function sendCustomerInvitation(
  user: Pick<IUser, "_id" | "email">,
  profile: Pick<ICustomerProfile, "_id" | "firstName" | "customerNumber" | "locale">,
  sentById: Types.ObjectId,
): Promise<boolean> {
  const token = await issueAuthToken(user._id, "INVITATION");
  const mail = invitationMail({
    firstName: profile.firstName,
    email: user.email,
    customerNumber: profile.customerNumber,
    url: new URL(`/kundenportal/passwort-zuruecksetzen?token=${token}&willkommen=1`, env.FRONTEND_URL).toString(),
    googleSignIn: googleEnabled,
    locale: profile.locale,
  });
  return sendMail({ type: "INVITATION", to: user.email, userId: user._id, customerId: profile._id, sentById, ...mail });
}
