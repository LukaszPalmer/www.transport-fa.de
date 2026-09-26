import { INVOICE_UNIT_INFO, REVERSE_CHARGE_NOTE } from "@fa/shared";
import { amountDueCents, type EInvoiceData } from "./types";

/**
 * E-Rechnung als UN/CEFACT Cross Industry Invoice (CII D16B) nach EN 16931.
 * - "EN16931": eingebettet in die PDF (ZUGFeRD 2 / Factur-X, Profil EN 16931)
 * - "XRECHNUNG": dieselben Daten mit der Kennung der deutschen CIUS XRechnung 3.0
 * Reihenfolge der Elemente folgt dem XML-Schema – nicht umsortieren.
 */
export type CiiProfile = "EN16931" | "XRECHNUNG";

const GUIDELINE: Record<CiiProfile, string> = {
  EN16931: "urn:cen.eu:en16931:2017",
  XRECHNUNG: "urn:cen.eu:en16931:2017#compliant#urn:xeinkauf.de:kosit:xrechnung_3.0",
};
const BUSINESS_PROCESS = "urn:fdc:peppol.eu:2017:poacc:billing:01.0";

function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[char]!);
}

/** Cent → „1234.56“ (ohne Fließkomma-Rundung). */
function amount(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  return `${sign}${Math.trunc(abs / 100)}.${String(abs % 100).padStart(2, "0")}`;
}

const quantity = (value: number) => String(Number(value.toFixed(3)));
const day = (isoDay: string) => `<udt:DateTimeString format="102">${isoDay.replaceAll("-", "")}</udt:DateTimeString>`;

/** Einfacher XML-Baukasten: tag("ram:ID", "x") → <ram:ID>x</ram:ID>, leere/undefined Kinder entfallen. */
function tag(name: string, content: string | undefined | Array<string | undefined>, attributes?: Record<string, string>): string {
  const inner = Array.isArray(content) ? content.filter(Boolean).join("") : content;
  if (inner === undefined || inner === "") return "";
  const attrs = attributes ? Object.entries(attributes).map(([key, value]) => ` ${key}="${escapeXml(value)}"`).join("") : "";
  return `<${name}${attrs}>${inner}</${name}>`;
}
const text = (name: string, value: string | undefined, attributes?: Record<string, string>) => (value ? tag(name, escapeXml(value), attributes) : "");

function exemption(data: EInvoiceData): { reason?: string; code?: string } {
  if (data.taxTreatment === "REVERSE_CHARGE") return { reason: REVERSE_CHARGE_NOTE, code: "VATEX-EU-AE" };
  if (data.taxTreatment === "EXEMPT") return { reason: data.exemptionReason };
  return {};
}

function address(parts: { line1: string; line2?: string; postalCode: string; city: string; countryCode: string }): string {
  return tag("ram:PostalTradeAddress", [
    text("ram:PostcodeCode", parts.postalCode),
    text("ram:LineOne", parts.line1),
    text("ram:LineTwo", parts.line2),
    text("ram:CityName", parts.city),
    text("ram:CountryID", parts.countryCode),
  ]);
}

export function buildCiiXml(data: EInvoiceData, profile: CiiProfile = "EN16931"): string {
  const { seller, buyer } = data;
  const dueCents = amountDueCents(data);
  const paidCash = data.prepaid?.method === "CASH" && dueCents === 0;
  const { reason, code } = exemption(data);
  const buyerName = buyer.companyName ?? buyer.name ?? "";
  const legalNote = [
    seller.name,
    seller.managingDirectors && `Geschäftsführer: ${seller.managingDirectors}`,
    seller.registerCourt && seller.registerNumber && `${seller.registerCourt}, ${seller.registerNumber}`,
  ]
    .filter(Boolean)
    .join(" · ");

  const lines = data.lines.map((line, index) => {
    const [name = "", ...rest] = line.description.split("\n");
    return tag("ram:IncludedSupplyChainTradeLineItem", [
      tag("ram:AssociatedDocumentLineDocument", text("ram:LineID", String(index + 1))),
      tag("ram:SpecifiedTradeProduct", [text("ram:Name", name.trim() || INVOICE_UNIT_INFO[line.unit].label), text("ram:Description", rest.join("\n").trim())]),
      tag("ram:SpecifiedLineTradeAgreement", tag("ram:NetPriceProductTradePrice", text("ram:ChargeAmount", amount(line.unitPriceCents)))),
      tag("ram:SpecifiedLineTradeDelivery", text("ram:BilledQuantity", quantity(line.quantity), { unitCode: line.unit })),
      tag("ram:SpecifiedLineTradeSettlement", [
        tag("ram:ApplicableTradeTax", [
          text("ram:TypeCode", "VAT"),
          text("ram:CategoryCode", data.breakdown[0]?.category ?? "S"),
          text("ram:RateApplicablePercent", String(line.vatRate)),
        ]),
        tag("ram:SpecifiedTradeSettlementLineMonetarySummation", text("ram:LineTotalAmount", amount(line.netCents))),
      ]),
    ]);
  });

  const period = data.serviceTo && data.serviceTo !== data.serviceFrom;
  const paymentTerms = paidCash
    ? "Der Rechnungsbetrag wurde bar bezahlt."
    : dueCents === 0
      ? "Der Rechnungsbetrag wurde bereits bezahlt."
      : data.paymentTermDays === 0
        ? "Zahlbar sofort ohne Abzug."
        : `Zahlbar innerhalb von ${data.paymentTermDays} Tagen ohne Abzug.`;

  const xml = tag(
    "rsm:CrossIndustryInvoice",
    [
      tag("rsm:ExchangedDocumentContext", [
        tag("ram:BusinessProcessSpecifiedDocumentContextParameter", text("ram:ID", BUSINESS_PROCESS)),
        tag("ram:GuidelineSpecifiedDocumentContextParameter", text("ram:ID", GUIDELINE[profile])),
      ]),
      tag("rsm:ExchangedDocument", [
        text("ram:ID", data.number),
        text("ram:TypeCode", "380"),
        tag("ram:IssueDateTime", day(data.issueDate)),
        legalNote ? tag("ram:IncludedNote", [text("ram:Content", legalNote), text("ram:SubjectCode", "REG")]) : undefined,
      ]),
      tag("rsm:SupplyChainTradeTransaction", [
        ...lines,
        tag("ram:ApplicableHeaderTradeAgreement", [
          // Bei Behörden die Leitweg-ID; XRechnung verlangt das Feld immer.
          text("ram:BuyerReference", data.buyerReference ?? buyer.customerNumber),
          tag("ram:SellerTradeParty", [
            text("ram:Name", seller.name),
            tag("ram:DefinedTradeContact", [
              text("ram:PersonName", `${seller.tradeName} Kundenservice`),
              tag("ram:TelephoneUniversalCommunication", text("ram:CompleteNumber", seller.phone)),
              tag("ram:EmailURIUniversalCommunication", text("ram:URIID", seller.email)),
            ]),
            address({ line1: seller.street, postalCode: seller.postalCode, city: seller.city, countryCode: seller.countryCode }),
            tag("ram:URIUniversalCommunication", text("ram:URIID", seller.email, { schemeID: "EM" })),
            seller.vatId ? tag("ram:SpecifiedTaxRegistration", text("ram:ID", seller.vatId, { schemeID: "VA" })) : undefined,
            seller.taxNumber ? tag("ram:SpecifiedTaxRegistration", text("ram:ID", seller.taxNumber, { schemeID: "FC" })) : undefined,
          ]),
          tag("ram:BuyerTradeParty", [
            text("ram:ID", buyer.customerNumber),
            text("ram:Name", buyerName),
            buyer.companyName && buyer.name ? tag("ram:DefinedTradeContact", text("ram:PersonName", buyer.name)) : undefined,
            address(buyer),
            tag("ram:URIUniversalCommunication", text("ram:URIID", buyer.email, { schemeID: "EM" })),
            buyer.vatId ? tag("ram:SpecifiedTaxRegistration", text("ram:ID", buyer.vatId, { schemeID: "VA" })) : undefined,
          ]),
        ]),
        // Pflichtelement, auch wenn nur das Leistungsdatum drinsteht.
        `<ram:ApplicableHeaderTradeDelivery>${
          period ? "" : tag("ram:ActualDeliverySupplyChainEvent", tag("ram:OccurrenceDateTime", day(data.serviceFrom)))
        }</ram:ApplicableHeaderTradeDelivery>`,
        tag("ram:ApplicableHeaderTradeSettlement", [
          text("ram:PaymentReference", data.number),
          text("ram:InvoiceCurrencyCode", "EUR"),
          paidCash
            ? tag("ram:SpecifiedTradeSettlementPaymentMeans", [text("ram:TypeCode", "10"), text("ram:Information", "Barzahlung")])
            : tag("ram:SpecifiedTradeSettlementPaymentMeans", [
                text("ram:TypeCode", "58"),
                text("ram:Information", "SEPA-Überweisung"),
                tag("ram:PayeePartyCreditorFinancialAccount", [text("ram:IBANID", seller.bank.iban), text("ram:AccountName", seller.name)]),
                seller.bank.bic ? tag("ram:PayeeSpecifiedCreditorFinancialInstitution", text("ram:BICID", seller.bank.bic)) : undefined,
              ]),
          ...data.breakdown.map((entry) =>
            tag("ram:ApplicableTradeTax", [
              text("ram:CalculatedAmount", amount(entry.taxCents)),
              text("ram:TypeCode", "VAT"),
              text("ram:ExemptionReason", reason),
              text("ram:BasisAmount", amount(entry.basisCents)),
              text("ram:CategoryCode", entry.category),
              text("ram:ExemptionReasonCode", code),
              text("ram:RateApplicablePercent", String(entry.rate)),
            ]),
          ),
          period
            ? tag("ram:BillingSpecifiedPeriod", [tag("ram:StartDateTime", day(data.serviceFrom)), tag("ram:EndDateTime", day(data.serviceTo!))])
            : undefined,
          tag("ram:SpecifiedTradePaymentTerms", [
            text("ram:Description", paymentTerms),
            dueCents > 0 ? tag("ram:DueDateDateTime", day(data.dueDate)) : undefined,
          ]),
          tag("ram:SpecifiedTradeSettlementHeaderMonetarySummation", [
            text("ram:LineTotalAmount", amount(data.netCents)),
            text("ram:TaxBasisTotalAmount", amount(data.netCents)),
            text("ram:TaxTotalAmount", amount(data.vatCents), { currencyID: "EUR" }),
            text("ram:GrandTotalAmount", amount(data.grossCents)),
            data.prepaid ? text("ram:TotalPrepaidAmount", amount(data.prepaid.cents)) : undefined,
            text("ram:DuePayableAmount", amount(dueCents)),
          ]),
        ]),
      ]),
    ],
    {
      "xmlns:rsm": "urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100",
      "xmlns:qdt": "urn:un:unece:uncefact:data:standard:QualifiedDataType:100",
      "xmlns:ram": "urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100",
      "xmlns:udt": "urn:un:unece:uncefact:data:standard:UnqualifiedDataType:100",
    },
  );
  return `<?xml version="1.0" encoding="UTF-8"?>\n${xml}\n`;
}
