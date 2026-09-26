/**
 * Rendert Beispielrechnungen (ZUGFeRD-PDF + XRechnung-XML) nach backend/.invoice-preview/ –
 * zum Prüfen von Layout und Firmendaten, ohne Datenbank und ohne etwas zu versenden.
 * npm run invoice:preview -w @fa/backend
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { COMPANY, defaultInvoiceClosing, defaultInvoiceIntro, InvoiceDraftInput } from "@fa/shared";
import { buildInvoiceData, berlinToday } from "../src/invoicing/build";
import { buildCiiXml } from "../src/invoicing/cii";
import { renderInvoicePdf } from "../src/invoicing/pdf";

const dir = path.resolve(".invoice-preview");
mkdirSync(dir, { recursive: true });

const privateCustomer = { type: "PRIVATE" as const, firstName: "Anna", lastName: "Beispiel" };
const today = berlinToday();

const samples = {
  "umzug-privat": {
    draft: InvoiceDraftInput.parse({
      customerId: "000000000000000000000001",
      buyer: { name: "Anna Beispiel", line1: "Lindenallee 12", postalCode: "10115", city: "Berlin" },
      serviceFrom: today,
      paymentTermDays: 14,
      lines: [
        { description: "Umzug Berlin → Hamburg\nBeladung, Transport und Entladung inkl. Möbelmontage", quantity: 1, unit: "LS", unitPriceCents: 189_000, vatRate: 19 },
        { description: "Umzugshelfer (3 Personen)", quantity: 7.5, unit: "HUR", unitPriceCents: 4_500, vatRate: 19 },
        { description: "Verpackungsmaterial\nUmzugskartons, Luftpolsterfolie, Klebeband", quantity: 40, unit: "C62", unitPriceCents: 250, vatRate: 19 },
        { description: "Halteverbotszone", quantity: 2, unit: "C62", unitPriceCents: 8_900, vatRate: 19 },
      ],
      introText: defaultInvoiceIntro(privateCustomer),
      closingText: defaultInvoiceClosing(COMPANY.name),
    }),
    paidWith: undefined,
  },
  "bar-bezahlt": {
    draft: InvoiceDraftInput.parse({
      customerId: "000000000000000000000001",
      buyer: { name: "Anna Beispiel", line1: "Lindenallee 12", postalCode: "10115", city: "Berlin" },
      serviceFrom: today,
      paymentTermDays: 0,
      lines: [{ description: "Entrümpelung Kellerabteil inkl. fachgerechter Entsorgung", quantity: 1, unit: "LS", unitPriceCents: 45_000, vatRate: 19 }],
      introText: defaultInvoiceIntro(privateCustomer),
      closingText: defaultInvoiceClosing(COMPANY.name),
    }),
    paidWith: "CASH" as const,
  },
  "reverse-charge-eu": {
    draft: InvoiceDraftInput.parse({
      customerId: "000000000000000000000001",
      buyer: { companyName: "Alpen Logistik GmbH", name: "Markus Huber", line1: "Industriestraße 4", postalCode: "5020", city: "Salzburg", countryCode: "AT", vatId: "ATU12345678" },
      serviceFrom: today,
      serviceTo: today,
      buyerReference: "PO-2026-118",
      paymentTermDays: 30,
      taxTreatment: "REVERSE_CHARGE",
      lines: Array.from({ length: 22 }, (_, index) => ({
        description: `Teilladung ${index + 1}: München → Salzburg\nLadung auf Paletten, Abholung bis 10 Uhr`,
        quantity: 1,
        unit: "LS" as const,
        unitPriceCents: 38_500 + index * 1_000,
        vatRate: 19 as const,
      })),
      introText: defaultInvoiceIntro({ type: "BUSINESS", firstName: "Markus", lastName: "Huber" }),
      closingText: defaultInvoiceClosing(COMPANY.name),
    }),
    paidWith: undefined,
  },
};

for (const [name, sample] of Object.entries(samples)) {
  const data = buildInvoiceData({
    content: sample.draft,
    number: "RE-2026-00042",
    issueDate: today,
    customerNumber: "K-10001",
    email: "anna.beispiel@example.com",
    shipmentNumber: "SN-2026-00123",
    paidWith: sample.paidWith,
  });
  const xml = buildCiiXml(data, "EN16931");
  writeFileSync(path.join(dir, `${name}.pdf`), await renderInvoicePdf(data, { xml }));
  writeFileSync(path.join(dir, `${name}-xrechnung.xml`), buildCiiXml(data, "XRECHNUNG"));
  writeFileSync(path.join(dir, `${name}-entwurf.pdf`), await renderInvoicePdf(data, { draft: true }));
  console.log(`${name}: ${(data.grossCents / 100).toFixed(2)} € → ${path.join(dir, `${name}.pdf`)}`);
}
