/**
 * Administrator-Zugänge über die Kommandozeile – für den allerersten Admin und als
 * Notfall-Zugang (z. B. Handy mit Authenticator-App verloren).
 *
 *   npm run admin -w @fa/backend -- anlegen admin@transport-fa.de "Vorname Nachname"
 *   npm run admin -w @fa/backend -- zuruecksetzen admin@transport-fa.de
 *
 * Produktion (Railway-Shell): node dist/admin.js anlegen …
 *
 * Das Passwort wird zufällig erzeugt und einmalig angezeigt (landet so nicht in der
 * Shell-Historie). Alternativ per Umgebungsvariable ADMIN_PASSWORD vorgeben.
 * Die Zwei-Faktor-Authentifizierung richtet der Admin bei der ersten Anmeldung ein.
 */
import { randomBytes } from "node:crypto";
import { EmailSchema, NewPasswordSchema } from "@fa/shared";
import mongoose from "mongoose";
import { hashPassword } from "../src/auth/password";
import { revokeAllSessions } from "../src/auth/sessions";
import { connectDatabase, disconnectDatabase } from "../src/db/connection";
import { StaffProfile, User } from "../src/models";

const USAGE = `Verwendung:
  anlegen <email> "<Anzeigename>"   neuen Administrator anlegen
  zuruecksetzen <email>             Passwort + 2FA eines Mitarbeiters zurücksetzen`;

const [command, rawEmail, displayName] = process.argv.slice(2);

function generatePassword(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const raw = Array.from(randomBytes(20), (byte) => alphabet[byte % alphabet.length]).join("");
  return `${raw.slice(0, 5)}-${raw.slice(5, 10)}-${raw.slice(10, 15)}-${raw.slice(15)}`;
}

function resolvePassword(): { password: string; generated: boolean } {
  const fromEnv = process.env.ADMIN_PASSWORD;
  if (fromEnv) return { password: NewPasswordSchema.parse(fromEnv), generated: false };
  return { password: generatePassword(), generated: true };
}

function printCredentials(email: string, password: string, generated: boolean): void {
  console.log(`\n  E-Mail:    ${email}`);
  if (generated) console.log(`  Passwort:  ${password}   ← jetzt sicher notieren, wird nicht erneut angezeigt`);
  console.log("\n  Anmeldung unter /admin/login – dort wird die Zwei-Faktor-Authentifizierung eingerichtet.\n");
}

async function create(email: string, name: string): Promise<void> {
  if (await User.exists({ email })) throw new Error(`Unter ${email} gibt es bereits ein Konto. Für einen Notfall-Zugang: zuruecksetzen ${email}`);
  const { password, generated } = resolvePassword();
  const passwordHash = await hashPassword(password);

  await mongoose.connection.transaction(async (session) => {
    const [user] = await User.create(
      [{ email, name, role: "ADMIN", passwordHash, passwordChangedAt: new Date(), emailVerifiedAt: new Date() }],
      { session },
    );
    if (!user) throw new Error("Administrator konnte nicht angelegt werden");
    await StaffProfile.create([{ userId: user._id, displayName: name, jobTitle: "Geschäftsführung" }], { session });
  });

  console.log("\n✓ Administrator angelegt");
  printCredentials(email, password, generated);
}

async function reset(email: string): Promise<void> {
  const user = await User.findOne({ email }).select("role").lean();
  if (!user) throw new Error(`Kein Konto unter ${email}.`);
  if (user.role !== "ADMIN" && user.role !== "EMPLOYEE") throw new Error("Nur Mitarbeiterkonten lassen sich hier zurücksetzen.");

  const { password, generated } = resolvePassword();
  await User.updateOne(
    { _id: user._id },
    {
      passwordHash: await hashPassword(password),
      passwordChangedAt: new Date(),
      failedLoginCount: 0,
      state: "ACTIVE",
      $unset: { mfa: 1, mfaPendingSecret: 1, lockedUntil: 1 },
    },
  );
  const ended = await revokeAllSessions(user._id);

  console.log(`\n✓ Zugang zurückgesetzt (${ended} Sitzung(en) beendet, 2FA muss neu eingerichtet werden)`);
  printCredentials(email, password, generated);
}

async function main(): Promise<void> {
  if (!command || !rawEmail || (command === "anlegen" && !displayName)) {
    console.error(USAGE);
    process.exit(1);
  }
  const email = EmailSchema.parse(rawEmail);

  await connectDatabase();
  try {
    if (command === "anlegen") await create(email, displayName!.trim());
    else if (command === "zuruecksetzen") await reset(email);
    else {
      console.error(USAGE);
      process.exitCode = 1;
    }
  } finally {
    await disconnectDatabase();
  }
}

main().catch((error: unknown) => {
  console.error(`\n✗ ${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});
