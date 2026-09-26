/**
 * Demo-Daten für die Entwicklung: ein Fahrer und zwei Aufträge für ein Kundenkonto,
 * damit Übersicht und Tracking gefüllt sind (bis das Büro echte Aufträge anlegt).
 *
 *   npm run db:seed-demo -w @fa/backend -- kunde@example.com
 *   npm run db:seed-demo -w @fa/backend -- kunde@example.com --entfernen
 *
 * Alle Demo-Datensätze tragen die Kundenreferenz „DEMO-DATEN" bzw. das Fahrzeug „DEMO".
 */
import { connectDatabase, disconnectDatabase } from "../src/db/connection";
import { CustomerProfile, DriverProfile, nextSequence, Shipment, User } from "../src/models";

const [email, flag] = process.argv.slice(2);
if (!email) {
  console.error("Bitte die E-Mail-Adresse des Kundenkontos angeben.");
  process.exit(1);
}

/** Google Encoded Polyline (Präzision 5) – so speichern wir geplante Routen. */
function encodePolyline(points: Array<[lng: number, lat: number]>): string {
  let lastLat = 0;
  let lastLng = 0;
  let result = "";
  const encode = (value: number) => {
    let v = value < 0 ? ~(value << 1) : value << 1;
    while (v >= 0x20) {
      result += String.fromCharCode((0x20 | (v & 0x1f)) + 63);
      v >>= 5;
    }
    result += String.fromCharCode(v + 63);
  };
  for (const [lng, lat] of points) {
    const latE5 = Math.round(lat * 1e5);
    const lngE5 = Math.round(lng * 1e5);
    encode(latE5 - lastLat);
    encode(lngE5 - lastLng);
    lastLat = latE5;
    lastLng = lngE5;
  }
  return result;
}

const HOUR = 60 * 60 * 1000;
const point = (lng: number, lat: number) => ({ type: "Point" as const, coordinates: [lng, lat] as [number, number] });

await connectDatabase();
const user = await User.findOne({ email: email.toLowerCase() }).lean();
const customer = user && (await CustomerProfile.findOne({ userId: user._id }).lean());
if (!user || !customer) {
  console.error(`Kein Kundenkonto für ${email} gefunden.`);
  await disconnectDatabase();
  process.exit(1);
}

const removed = await Shipment.deleteMany({ customerId: customer._id, customerReference: "DEMO-DATEN" });
if (flag === "--entfernen") {
  const drivers = await DriverProfile.deleteMany({ "vehicle.label": "DEMO" });
  console.log(`Demo-Daten entfernt: ${removed.deletedCount} Aufträge, ${drivers.deletedCount} Fahrer.`);
  await disconnectDatabase();
  process.exit(0);
}

const truckPosition = point(9.4797, 51.3127); // Kassel
const driver =
  (await DriverProfile.findOne({ "vehicle.label": "DEMO" })) ??
  (await DriverProfile.create({
    firstName: "Max",
    lastName: "Mustermann",
    phone: "+4915112345678",
    vehicle: { plate: "HH-FA 1234", label: "DEMO" },
    lastLocation: truckPosition,
    lastLocationAt: new Date(),
  }));

const year = new Date().getFullYear();
const shipmentNumber = async () => `SN-${year}-${String(await nextSequence(`shipment:${year}`)).padStart(5, "0")}`;
const now = Date.now();

// Hamburg → München über Hannover, Kassel, Würzburg, Nürnberg
const route: Array<[number, number]> = [
  [9.9937, 53.5511],
  [9.732, 52.3759],
  [9.4797, 51.3127],
  [9.9534, 49.7913],
  [11.0767, 49.4521],
  [11.582, 48.1351],
];

await Shipment.create([
  {
    shipmentNumber: await shipmentNumber(),
    customerId: customer._id,
    driverId: driver._id,
    service: "transport-logistik",
    status: "IN_TRANSIT",
    customerReference: "DEMO-DATEN",
    cargoDescription: "12 Europaletten Maschinenteile, 8,4 t",
    pickup: {
      address: { line1: "Am Sandtorkai 1", postalCode: "20457", city: "Hamburg", countryCode: "DE" },
      location: point(9.9937, 53.5511),
      contactName: "Lager Nord",
    },
    delivery: {
      address: { line1: "Leopoldstraße 50", postalCode: "80802", city: "München", countryCode: "DE" },
      location: point(11.582, 48.1351),
      contactName: "Warenannahme",
    },
    plannedPickupAt: new Date(now - 4 * HOUR),
    plannedDeliveryAt: new Date(now + 5 * HOUR),
    pickedUpAt: new Date(now - 3.5 * HOUR),
    route: { polyline: encodePolyline(route), distanceMeters: 791_000, durationSeconds: 8 * 3600 },
    tracking: { lastLocation: truckPosition, lastLocationAt: new Date(now - 2 * 60 * 1000), distanceCoveredMeters: 305_000, etaAt: new Date(now + 4.5 * HOUR) },
    statusHistory: [
      { status: "PLANNED", at: new Date(now - 48 * HOUR) },
      { status: "ASSIGNED", at: new Date(now - 20 * HOUR) },
      { status: "EN_ROUTE_TO_PICKUP", at: new Date(now - 5 * HOUR) },
      { status: "IN_TRANSIT", at: new Date(now - 3.5 * HOUR) },
    ],
  },
  {
    shipmentNumber: await shipmentNumber(),
    customerId: customer._id,
    service: "umzuege",
    status: "PLANNED",
    customerReference: "DEMO-DATEN",
    cargoDescription: "3-Zimmer-Wohnung, ca. 35 m³",
    pickup: { address: { line1: "Karl-Marx-Allee 90", postalCode: "10243", city: "Berlin", countryCode: "DE" }, location: point(13.4326, 52.5174) },
    delivery: { address: { line1: "Augustusplatz 9", postalCode: "04109", city: "Leipzig", countryCode: "DE" }, location: point(12.381, 51.3397) },
    plannedPickupAt: new Date(now + 6 * 24 * HOUR),
    plannedDeliveryAt: new Date(now + 6 * 24 * HOUR + 7 * HOUR),
    statusHistory: [{ status: "PLANNED", at: new Date(now - 2 * HOUR) }],
  },
]);

console.log(`Demo-Daten für ${customer.firstName} ${customer.lastName} (${customer.customerNumber}) angelegt: 2 Aufträge, Fahrer ${driver.firstName} ${driver.lastName}.`);
await disconnectDatabase();
