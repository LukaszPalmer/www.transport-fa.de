import {
  COMPANY,
  defaultInvoiceClosing,
  defaultInvoiceIntro,
  DEFAULT_EXEMPTION_REASON,
  InvoiceDraftInput,
  type InvoiceAddress,
  type InvoiceDraftContent,
  type InvoiceEditorContext,
  type InvoiceLine,
  type InvoiceUnit,
  type ServiceSlug,
  type TaxTreatment,
  type VatRate,
} from "@fa/shared";
import { centsToInput, parseEuro, parseQuantity, quantityToInput } from "@/lib/money-input";

/** Formularzustand des Rechnungs-Editors – Zahlen als Text, damit Eingaben wie „2,“ stehen bleiben. */

export interface LineState {
  key: string;
  description: string;
  quantity: string;
  unit: InvoiceUnit;
  price: string;
  vatRate: VatRate;
}

export interface BuyerState {
  companyName: string;
  name: string;
  line1: string;
  line2: string;
  postalCode: string;
  city: string;
  countryCode: string;
  vatId: string;
}

export interface EditorState {
  customerId?: string;
  shipmentId: string;
  buyer: BuyerState;
  serviceFrom: string;
  serviceTo: string;
  paymentTermDays: number;
  buyerReference: string;
  taxTreatment: TaxTreatment;
  exemptionReason: string;
  lines: LineState[];
  introText: string;
  closingText: string;
}

let keyCounter = 0;
export const newLineKey = () => `line-${Date.now().toString(36)}-${(keyCounter++).toString(36)}`;

export const emptyLine = (description = ""): LineState => ({ key: newLineKey(), description, quantity: "1", unit: "LS", price: "", vatRate: 19 });

export const emptyBuyer = (): BuyerState => ({ companyName: "", name: "", line1: "", line2: "", postalCode: "", city: "", countryCode: "DE", vatId: "" });

export function emptyState(): EditorState {
  return {
    shipmentId: "",
    buyer: emptyBuyer(),
    serviceFrom: "",
    serviceTo: "",
    paymentTermDays: 14,
    buyerReference: "",
    taxTreatment: "STANDARD",
    exemptionReason: "",
    lines: [emptyLine()],
    introText: "",
    closingText: defaultInvoiceClosing(COMPANY.name),
  };
}

export function addressToBuyer(buyer: BuyerState, address: InvoiceAddress): BuyerState {
  return { ...buyer, line1: address.line1, line2: address.line2 ?? "", postalCode: address.postalCode, city: address.city, countryCode: address.countryCode };
}

/** Neuer Kunde gewählt: Empfänger, Anrede und Aufträge aus dem Kontext übernehmen. */
export function stateForCustomer(context: InvoiceEditorContext, previous: EditorState = emptyState()): EditorState {
  const { customer } = context;
  let buyer: BuyerState = {
    ...emptyBuyer(),
    companyName: customer.companyName ?? "",
    name: `${customer.firstName} ${customer.lastName}`.trim(),
    vatId: customer.vatId ?? "",
  };
  if (customer.billingAddress) buyer = addressToBuyer(buyer, customer.billingAddress);
  return {
    ...previous,
    customerId: customer.id,
    shipmentId: "",
    buyer,
    buyerReference: "",
    introText: defaultInvoiceIntro(customer),
  };
}

/** Bezeichnung der ersten Position je Leistung (Einzahl, wie auf einer Rechnung üblich). */
const SERVICE_LINE: Record<ServiceSlug, (from: string, to: string) => string> = {
  umzuege: (from, to) => (from === to ? `Umzug innerhalb ${from}` : `Umzug ${from} → ${to}`),
  entruempelungen: (from) => `Entrümpelung in ${from}`,
  haushaltsaufloesungen: (from) => `Haushaltsauflösung in ${from}`,
  transport: (from, to) => `Transport ${from} → ${to}`,
};

/** Auftrag gewählt: Leistungsdatum, Referenz und – bei leerer Rechnung – die erste Position vorbelegen. */
export function applyShipment(state: EditorState, context: InvoiceEditorContext, shipmentId: string): EditorState {
  const shipment = context.shipments.find((entry) => entry.id === shipmentId);
  if (!shipment) return { ...state, shipmentId: "" };
  const untouched = state.lines.every((line) => !line.description.trim() && !line.price.trim());
  const description = SERVICE_LINE[shipment.service](shipment.pickup.city, shipment.delivery.city);
  return {
    ...state,
    shipmentId,
    serviceFrom: state.serviceFrom || shipment.serviceDate || "",
    buyerReference: state.buyerReference || shipment.customerReference || "",
    lines: untouched ? [emptyLine(description)] : state.lines,
  };
}

/** Gespeicherter Entwurf → Formular. */
export function stateFromDraft(content: InvoiceDraftContent): EditorState {
  const { buyer } = content;
  return {
    customerId: content.customerId,
    shipmentId: content.shipmentId ?? "",
    buyer: {
      companyName: buyer.companyName ?? "",
      name: buyer.name ?? "",
      line1: buyer.line1 ?? "",
      line2: buyer.line2 ?? "",
      postalCode: buyer.postalCode ?? "",
      city: buyer.city ?? "",
      countryCode: buyer.countryCode,
      vatId: buyer.vatId ?? "",
    },
    serviceFrom: content.serviceFrom ?? "",
    serviceTo: content.serviceTo ?? "",
    paymentTermDays: content.paymentTermDays,
    buyerReference: content.buyerReference ?? "",
    taxTreatment: content.taxTreatment,
    exemptionReason: content.exemptionReason ?? "",
    lines: content.lines.map((line) => ({
      key: newLineKey(),
      description: line.description,
      quantity: quantityToInput(line.quantity),
      unit: line.unit,
      price: centsToInput(line.unitPriceCents),
      vatRate: line.vatRate,
    })),
    introText: content.introText ?? "",
    closingText: content.closingText ?? "",
  };
}

/** Formular → API. Nicht lesbare Zahlen werden 0 und als Eingabefehler gemeldet. */
export function toDraftInput(state: EditorState): { input: InvoiceDraftInput; lines: InvoiceLine[]; inputErrors: Record<string, string> } {
  const inputErrors: Record<string, string> = {};
  const lines = state.lines.map((line, index): InvoiceLine => {
    const quantity = parseQuantity(line.quantity);
    const unitPriceCents = parseEuro(line.price);
    if (quantity === undefined) inputErrors[`lines.${index}.quantity`] = "Menge, z. B. 1 oder 2,5";
    if (unitPriceCents === undefined && line.price.trim()) inputErrors[`lines.${index}.unitPriceCents`] = "Preis, z. B. 1.250,00";
    return { description: line.description, quantity: quantity ?? 0, unit: line.unit, unitPriceCents: unitPriceCents ?? 0, vatRate: line.vatRate };
  });
  return {
    inputErrors,
    lines,
    input: {
      customerId: state.customerId ?? "",
      shipmentId: state.shipmentId,
      buyer: { ...state.buyer },
      serviceFrom: state.serviceFrom,
      serviceTo: state.serviceTo,
      paymentTermDays: state.paymentTermDays,
      buyerReference: state.buyerReference,
      taxTreatment: state.taxTreatment,
      exemptionReason: state.taxTreatment === "EXEMPT" ? state.exemptionReason || DEFAULT_EXEMPTION_REASON : state.exemptionReason,
      lines,
      introText: state.introText,
      closingText: state.closingText,
    },
  };
}

/** Wie die API den Entwurf sieht (für Summen und die Vollständigkeitsprüfung im Browser). */
export function toContent(state: EditorState): { content?: InvoiceDraftContent; errors: Record<string, string> } {
  const { input, inputErrors } = toDraftInput(state);
  const parsed = InvoiceDraftInput.safeParse(input);
  if (parsed.success) return { content: parsed.data, errors: inputErrors };
  const errors = { ...inputErrors };
  for (const issue of parsed.error.issues) errors[issue.path.join(".")] ??= issue.message;
  return { errors };
}
