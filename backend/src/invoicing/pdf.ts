import { INVOICE_UNIT_INFO, REVERSE_CHARGE_NOTE } from "@fa/shared";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import { fontPath, INVOICE_FONTS, type InvoiceFont } from "./fonts";
import { amountDueCents, type EInvoiceData } from "./types";

/**
 * Rechnungs-PDF im Stil der Website: DIN 5008 Form B (Anschrift passt ins DL-Fensterkuvert),
 * Positionstabelle mit Seitenumbruch, GiroCode und Pflichtangaben im Fuß jeder Seite.
 * Mit `xml` entsteht eine ZUGFeRD-/Factur-X-Rechnung: PDF/A-3b mit eingebetteter factur-x.xml.
 */

export const FACTUR_X_FILENAME = "factur-x.xml";

const MM = 72 / 25.4;
const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const LEFT = 25 * MM;
const RIGHT = PAGE_WIDTH - 20 * MM;
const WIDTH = RIGHT - LEFT;
const FOOTER_TOP = PAGE_HEIGHT - 25 * MM;
const CONTENT_BOTTOM = FOOTER_TOP - 16;

const COLOR = {
  ink: "#0b132b",
  body: "#334155",
  muted: "#64748b",
  faint: "#94a3b8",
  line: "#e2e8f0",
  accent: "#38bdf8",
  surface: "#f1f5f9",
  success: "#ecfdf5",
  successInk: "#065f46",
};

const euroFormat = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });
const quantityFormat = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 3 });
const countryNames = new Intl.DisplayNames(["de"], { type: "region" });

const euro = (cents: number) => euroFormat.format(cents / 100);
const day = (isoDay: string) => (isoDay ? isoDay.split("-").reverse().join(".") : "–");
const groupedIban = (iban: string) => iban.replace(/(.{4})(?=.)/g, "$1 ");

function serviceDate(data: Pick<EInvoiceData, "serviceFrom" | "serviceTo">): { label: string; value: string } {
  if (!data.serviceTo || data.serviceTo === data.serviceFrom) return { label: "Leistungsdatum", value: day(data.serviceFrom) };
  return { label: "Leistungszeitraum", value: `${day(data.serviceFrom)} – ${day(data.serviceTo)}` };
}

/** GiroCode (EPC-QR, Version 002): Banking-Apps übernehmen Empfänger, IBAN, Betrag und Verwendungszweck. */
function giroCodePayload(data: EInvoiceData, dueCents: number): string {
  const { bank } = data.seller;
  return [
    "BCD",
    "002",
    "1",
    "SCT",
    bank.bic ?? "",
    data.seller.name.slice(0, 70),
    bank.iban,
    `EUR${(dueCents / 100).toFixed(2)}`,
    "",
    "",
    `${data.number} ${data.buyer.customerNumber}`.slice(0, 140),
  ].join("\n");
}

/** XMP-Metadaten, an denen Rechnungsprogramme eine Factur-X-/ZUGFeRD-PDF erkennen. */
const FACTUR_X_XMP = `
<rdf:Description rdf:about="" xmlns:pdfaExtension="http://www.aiim.org/pdfa/ns/extension/" xmlns:pdfaSchema="http://www.aiim.org/pdfa/ns/schema#" xmlns:pdfaProperty="http://www.aiim.org/pdfa/ns/property#">
  <pdfaExtension:schemas>
    <rdf:Bag>
      <rdf:li rdf:parseType="Resource">
        <pdfaSchema:schema>Factur-X PDFA Extension Schema</pdfaSchema:schema>
        <pdfaSchema:namespaceURI>urn:factur-x:pdfa:CrossIndustryDocument:invoice:1p0#</pdfaSchema:namespaceURI>
        <pdfaSchema:prefix>fx</pdfaSchema:prefix>
        <pdfaSchema:property>
          <rdf:Seq>
            ${[
              ["DocumentFileName", "The name of the embedded XML document"],
              ["DocumentType", "The type of the hybrid document in capital letters, e.g. INVOICE or ORDER"],
              ["Version", "The actual version of the standard applying to the embedded XML document"],
              ["ConformanceLevel", "The conformance level of the embedded XML document"],
            ]
              .map(
                ([name, description]) => `<rdf:li rdf:parseType="Resource">
              <pdfaProperty:name>${name}</pdfaProperty:name>
              <pdfaProperty:valueType>Text</pdfaProperty:valueType>
              <pdfaProperty:category>external</pdfaProperty:category>
              <pdfaProperty:description>${description}</pdfaProperty:description>
            </rdf:li>`,
              )
              .join("\n            ")}
          </rdf:Seq>
        </pdfaSchema:property>
      </rdf:li>
    </rdf:Bag>
  </pdfaExtension:schemas>
</rdf:Description>
<rdf:Description rdf:about="" xmlns:fx="urn:factur-x:pdfa:CrossIndustryDocument:invoice:1p0#">
  <fx:DocumentType>INVOICE</fx:DocumentType>
  <fx:DocumentFileName>${FACTUR_X_FILENAME}</fx:DocumentFileName>
  <fx:Version>1.0</fx:Version>
  <fx:ConformanceLevel>EN 16931</fx:ConformanceLevel>
</rdf:Description>`;

export interface RenderOptions {
  /** Vorschau eines Entwurfs: Wasserzeichen, noch ohne Rechnungsnummer und GiroCode. */
  draft?: boolean;
  /** CII-XML (EN 16931) – wird als factur-x.xml eingebettet. */
  xml?: string;
}

export function renderInvoicePdf(data: EInvoiceData, options: RenderOptions = {}): Promise<Buffer> {
  const draft = options.draft ?? false;
  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 0, bottom: 0, left: LEFT, right: PAGE_WIDTH - RIGHT },
    bufferPages: true,
    pdfVersion: "1.7",
    subset: "PDF/A-3b",
    font: fontPath("regular"),
    lang: "de-DE",
    displayTitle: true,
    // Keine Kundendaten in den Metadaten: pdfkit schreibt sie ungefiltert ins XMP.
    info: {
      Title: draft ? "Rechnungsentwurf" : `Rechnung ${data.number}`,
      Author: data.seller.name.replace(/[&<>]/g, ""),
      Creator: "FA Transport Kundenportal",
      Keywords: "Rechnung, E-Rechnung, ZUGFeRD, Factur-X, EN 16931",
    },
  });
  for (const font of INVOICE_FONTS) doc.registerFont(font, fontPath(font));

  const chunks: Buffer[] = [];
  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  new InvoiceLayout(doc, data, draft).render();

  if (options.xml) {
    const now = new Date();
    doc.file(Buffer.from(options.xml, "utf8"), {
      name: FACTUR_X_FILENAME,
      type: "text/xml",
      description: "Factur-X/ZUGFeRD-Rechnungsdaten (EN 16931)",
      creationDate: now,
      modifiedDate: now,
      relationship: "Alternative", // PDF/A-3: die XML ist eine gleichwertige Darstellung der Rechnung
    } as PDFKit.Mixins.PDFAttachmentOptions);
    doc.appendXML(FACTUR_X_XMP);
  }
  doc.end();
  return done;
}

class InvoiceLayout {
  private y = 0;
  private readonly dueCents: number;
  private readonly showVatColumn: boolean;
  private readonly columns: { pos: number; description: number; quantity: number; price: number; vat: number; total: number };

  constructor(
    private readonly doc: PDFKit.PDFDocument,
    private readonly data: EInvoiceData,
    private readonly draft: boolean,
  ) {
    this.dueCents = amountDueCents(data);
    this.showVatColumn = new Set(data.lines.map((line) => line.vatRate)).size > 1;
    const fixed = { pos: 26, quantity: 66, price: 76, vat: this.showVatColumn ? 40 : 0, total: 80 };
    this.columns = { ...fixed, description: WIDTH - fixed.pos - fixed.quantity - fixed.price - fixed.vat - fixed.total };
  }

  render(): void {
    this.letterhead();
    this.addressBlock();
    this.infoBlock();
    this.title();
    this.paragraph(this.data.introText, 10);
    this.table();
    this.totals();
    this.taxNote();
    this.payment();
    this.paragraph(this.data.closingText, 12);
    this.decoratePages();
  }

  // --- Bausteine ------------------------------------------------------------------------------

  private write(text: string, x: number, y: number, style: { font?: InvoiceFont; size?: number; color?: string } & PDFKit.Mixins.TextOptions = {}): void {
    const { font = "regular", size = 9, color = COLOR.body, ...options } = style;
    this.doc.font(font).fontSize(size).fillColor(color).text(text, x, y, { lineGap: 1.5, ...options });
  }

  private measure(text: string, width: number, font: InvoiceFont = "regular", size = 9): number {
    return this.doc.font(font).fontSize(size).heightOfString(text, { width, lineGap: 1.5 });
  }

  private rule(y: number, color = COLOR.line, width = 0.5, from = LEFT, to = RIGHT): void {
    this.doc.save().moveTo(from, y).lineTo(to, y).lineWidth(width).strokeColor(color).stroke().restore();
  }

  /** Neue Seite, falls `height` nicht mehr passt. Liefert true bei Umbruch. */
  private ensureSpace(height: number): boolean {
    if (this.y + height <= CONTENT_BOTTOM) return false;
    this.doc.addPage();
    this.continuationHeader();
    return true;
  }

  private logoMark(x: number, y: number, size: number): void {
    const scale = size / 36;
    const { doc } = this;
    doc.save().translate(x, y).scale(scale);
    doc.roundedRect(0, 0, 36, 36, 9).fill(COLOR.accent);
    doc.path("M8.5 26 15 10h5.5L14 26z M17.5 26 24 10h5.5L23 26z").fill(COLOR.ink);
    doc.restore();
  }

  // --- Seite 1: Briefkopf, Anschrift, Infoblock --------------------------------------------------

  private letterhead(): void {
    const { seller } = this.data;
    const top = 14 * MM;
    this.logoMark(LEFT, top, 30);
    this.doc.font("displayHeavy").fontSize(17).fillColor(COLOR.ink).text("FA ", LEFT + 40, top + 4, { continued: true, lineBreak: false });
    this.doc.font("displayMedium").text("Transport", { lineBreak: false });
    this.write("Umzüge · Entrümpelungen · Transport & Logistik", LEFT + 40, top + 24, { size: 7, color: COLOR.muted, lineBreak: false });

    const lines = [seller.street, `${seller.postalCode} ${seller.city}`, seller.phone, seller.email, seller.website.replace(/^https?:\/\//, "")];
    this.write(seller.name, RIGHT - 200, top, { font: "semibold", size: 8.5, color: COLOR.ink, width: 200, align: "right" });
    this.write(lines.join("\n"), RIGHT - 200, top + 13, { size: 8, color: COLOR.muted, width: 200, align: "right" });
  }

  private addressBlock(): void {
    const { seller, buyer } = this.data;
    const senderLine = `${seller.name} · ${seller.street} · ${seller.postalCode} ${seller.city}`;
    const senderTop = 56 * MM;
    this.write(senderLine, LEFT, senderTop, { size: 6.5, color: COLOR.muted, width: 85 * MM, lineBreak: false, ellipsis: true });
    this.rule(senderTop + 9, COLOR.faint, 0.3, LEFT, LEFT + Math.min(85 * MM, this.doc.font("regular").fontSize(6.5).widthOfString(senderLine)));

    const lines: Array<{ text: string; strong?: boolean }> = [];
    if (buyer.companyName) lines.push({ text: buyer.companyName, strong: true });
    if (buyer.name) lines.push({ text: buyer.name, strong: !buyer.companyName });
    lines.push({ text: buyer.line1 });
    if (buyer.line2) lines.push({ text: buyer.line2 });
    lines.push({ text: `${buyer.postalCode} ${buyer.city}` });
    if (buyer.countryCode !== "DE") lines.push({ text: (countryNames.of(buyer.countryCode) ?? buyer.countryCode).toUpperCase() });

    let y = 63 * MM;
    for (const line of lines) {
      this.write(line.text, LEFT, y, { font: line.strong ? "semibold" : "regular", size: 10, color: COLOR.ink, width: 85 * MM, height: 13, ellipsis: true });
      y += 13.5;
    }
  }

  private infoBlock(): void {
    const { data } = this;
    const rows: Array<[string, string]> = [
      ["Rechnungsnummer", this.draft ? "folgt beim Versand" : data.number],
      ["Rechnungsdatum", day(data.issueDate)],
      [serviceDate(data).label, serviceDate(data).value],
      ["Kundennummer", data.buyer.customerNumber],
    ];
    if (data.shipmentNumber) rows.push(["Auftrag", data.shipmentNumber]);
    if (data.buyerReference) rows.push(["Ihre Referenz", data.buyerReference]);
    if (data.buyer.vatId) rows.push(["Ihre USt-IdNr.", data.buyer.vatId]);

    const x = 125 * MM;
    const valueX = x + 82;
    let y = 50 * MM;
    for (const [label, value] of rows) {
      this.write(label, x, y, { size: 8, color: COLOR.muted, lineBreak: false });
      this.write(value, valueX, y - 0.5, { font: "semibold", size: 8.5, color: COLOR.ink, width: RIGHT - valueX, height: 12, ellipsis: true });
      y += 13;
    }
  }

  private title(): void {
    const top = 92 * MM;
    this.doc.save().rect(LEFT, top, 28, 2.5).fill(COLOR.accent).restore();
    const heading = this.draft ? "Rechnung – Entwurf" : `Rechnung ${this.data.number}`;
    this.write(heading, LEFT, top + 9, { font: "bold", size: 17, color: COLOR.ink, lineBreak: false });
    this.y = top + 36;
  }

  private paragraph(text: string | undefined, spaceBefore: number): void {
    if (!text) return;
    const height = this.measure(text, WIDTH, "regular", 9.5);
    this.y += spaceBefore;
    this.ensureSpace(Math.min(height, 60));
    this.write(text, LEFT, this.y, { size: 9.5, width: WIDTH });
    this.y = this.doc.y;
  }

  // --- Positionen ---------------------------------------------------------------------------------

  private columnX(): { pos: number; description: number; quantity: number; price: number; vat: number; total: number } {
    const { pos, description, quantity, price, vat } = this.columns;
    return {
      pos: LEFT,
      description: LEFT + pos,
      quantity: LEFT + pos + description,
      price: LEFT + pos + description + quantity,
      vat: LEFT + pos + description + quantity + price,
      total: LEFT + pos + description + quantity + price + vat,
    };
  }

  private tableHeader(): void {
    const x = this.columnX();
    const { columns } = this;
    const style = { font: "semibold" as const, size: 7, color: COLOR.muted, characterSpacing: 0.4, lineBreak: false };
    this.write("POS.", x.pos, this.y, style);
    this.write("LEISTUNG", x.description, this.y, style);
    this.write("MENGE", x.quantity, this.y, { ...style, width: columns.quantity - 8, align: "right" });
    this.write("EINZELPREIS", x.price, this.y, { ...style, width: columns.price, align: "right" });
    if (this.showVatColumn) this.write("UST.", x.vat, this.y, { ...style, width: columns.vat, align: "right" });
    this.write("BETRAG", x.total, this.y, { ...style, width: columns.total, align: "right" });
    this.y += 13;
    this.rule(this.y, COLOR.ink, 0.9);
    this.y += 7;
  }

  private table(): void {
    this.y += 12;
    this.ensureSpace(60);
    this.tableHeader();
    const x = this.columnX();
    const { columns } = this;
    const textWidth = columns.description - 10;

    this.data.lines.forEach((line, index) => {
      const [first = "", ...rest] = line.description.split("\n");
      const detail = rest.join("\n").trim();
      const height = this.measure(first, textWidth, "semibold", 9) + (detail ? this.measure(detail, textWidth, "regular", 8.5) + 2 : 0);

      if (this.ensureSpace(height + 14)) this.tableHeader();
      const top = this.y;
      const unit = INVOICE_UNIT_INFO[line.unit].short;
      this.write(String(index + 1), x.pos, top, { size: 9, color: COLOR.muted, lineBreak: false });
      this.write(first, x.description, top, { font: "semibold", size: 9, color: COLOR.ink, width: textWidth });
      if (detail) this.write(detail, x.description, this.doc.y + 2, { size: 8.5, color: COLOR.body, width: textWidth });
      this.write(`${quantityFormat.format(line.quantity)} ${unit}`, x.quantity, top, { size: 9, width: columns.quantity - 8, align: "right", lineBreak: false });
      this.write(euro(line.unitPriceCents), x.price, top, { size: 9, width: columns.price, align: "right", lineBreak: false });
      if (this.showVatColumn) this.write(`${line.vatRate} %`, x.vat, top, { size: 9, width: columns.vat, align: "right", lineBreak: false });
      this.write(euro(line.netCents), x.total, top, { font: "semibold", size: 9, color: COLOR.ink, width: columns.total, align: "right", lineBreak: false });

      this.y = top + height + 5.5;
      this.rule(this.y);
      this.y += 5.5;
    });
  }

  // --- Summen, Steuerhinweis, Zahlung ---------------------------------------------------------------

  private totals(): void {
    const { data } = this;
    const rows: Array<[string, string]> = [["Summe netto", euro(data.netCents)]];
    for (const entry of data.breakdown) {
      if (entry.category === "S") {
        const basis = data.breakdown.length > 1 ? ` auf ${euro(entry.basisCents)}` : "";
        rows.push([`zzgl. ${entry.rate} % Umsatzsteuer${basis}`, euro(entry.taxCents)]);
      } else {
        rows.push([`Umsatzsteuer 0 % (${entry.category === "AE" ? "Reverse Charge" : "steuerfrei"})`, euro(0)]);
      }
    }
    const paidRows: Array<[string, string]> = data.prepaid
      ? [
          [`Bereits bezahlt (${data.prepaid.method === "CASH" ? "bar" : "Überweisung"})`, `– ${euro(data.prepaid.cents)}`],
          ["Offener Betrag", euro(this.dueCents)],
        ]
      : [];

    const width = 250;
    const x = RIGHT - width;
    const height = rows.length * 14 + 30 + paidRows.length * 14 + 6;
    this.y += 4;
    this.ensureSpace(height);

    for (const [label, value] of rows) {
      this.write(label, x, this.y, { size: 9, color: COLOR.body, lineBreak: false });
      this.write(value, x, this.y, { size: 9, color: COLOR.ink, width, align: "right", lineBreak: false });
      this.y += 14;
    }
    this.y += 2;
    this.doc.save().roundedRect(x - 10, this.y, width + 10, 26, 5).fill(COLOR.ink).restore();
    this.write("Rechnungsbetrag", x, this.y + 7.5, { font: "display", size: 10.5, color: "#ffffff", lineBreak: false });
    this.write(euro(data.grossCents), x, this.y + 7, { font: "display", size: 11.5, color: "#ffffff", width: width - 8, align: "right", lineBreak: false });
    this.y += 32;
    for (const [label, value] of paidRows) {
      this.write(label, x, this.y, { size: 9, color: COLOR.body, lineBreak: false });
      this.write(value, x, this.y, { font: "semibold", size: 9, color: COLOR.ink, width: width - 8, align: "right", lineBreak: false });
      this.y += 14;
    }
  }

  private taxNote(): void {
    const { data } = this;
    const note =
      data.taxTreatment === "REVERSE_CHARGE"
        ? `${REVERSE_CHARGE_NOTE} Die Umsatzsteuer schuldet der Leistungsempfänger${data.buyer.vatId ? ` (USt-IdNr. ${data.buyer.vatId})` : ""}.`
        : data.taxTreatment === "EXEMPT"
          ? data.exemptionReason
          : undefined;
    if (!note) return;
    this.y += 6;
    this.ensureSpace(this.measure(note, WIDTH, "semibold", 8.5));
    this.write(note, LEFT, this.y, { font: "semibold", size: 8.5, color: COLOR.ink, width: WIDTH });
    this.y = this.doc.y;
  }

  private payment(): void {
    const { data, doc } = this;
    this.y += 12;

    if (this.dueCents <= 0) {
      const method = data.prepaid?.method === "CASH" ? "bar" : "per Überweisung";
      const message = `Den Rechnungsbetrag haben wir dankend ${method} erhalten – es ist keine Zahlung mehr offen.`;
      this.ensureSpace(34);
      doc.save().roundedRect(LEFT, this.y, WIDTH, 30, 6).fill(COLOR.success).restore();
      this.write(message, LEFT + 14, this.y + 10, { font: "semibold", size: 9, color: COLOR.successInk, width: WIDTH - 28, lineBreak: false });
      this.y += 30;
      return;
    }

    const { bank } = data.seller;
    const boxHeight = 100;
    this.ensureSpace(boxHeight);
    const top = this.y;
    doc.save().roundedRect(LEFT, top, WIDTH, boxHeight, 6).fill(COLOR.surface).restore();

    const qrSize = 70;
    const textWidth = WIDTH - qrSize - 50;
    const deadline = data.paymentTermDays === 0 ? "sofort nach Erhalt" : `bis zum ${day(data.dueDate)}`;
    this.write("Zahlungsinformationen", LEFT + 14, top + 13, { font: "semibold", size: 9.5, color: COLOR.ink, lineBreak: false });
    this.write(`Bitte überweisen Sie ${euro(this.dueCents)} ${deadline} ohne Abzug.`, LEFT + 14, top + 29, { size: 8.5, width: textWidth, lineBreak: false });

    const details: Array<[string, string]> = [
      ["Kontoinhaber", data.seller.name],
      ["IBAN", groupedIban(bank.iban)],
      ["BIC · Bank", [bank.bic, bank.name].filter(Boolean).join(" · ")],
      ["Verwendungszweck", this.draft ? "Rechnungsnummer (folgt beim Versand)" : data.number],
    ];
    let y = top + 46;
    for (const [label, value] of details) {
      this.write(label, LEFT + 14, y, { size: 8, color: COLOR.muted, lineBreak: false });
      this.write(value, LEFT + 104, y - 0.5, { font: "semibold", size: 8.5, color: COLOR.ink, width: textWidth - 90, height: 11, ellipsis: true });
      y += 13;
    }

    const qrX = RIGHT - 14 - qrSize;
    const qrY = top + 12;
    if (this.draft) {
      doc.save().roundedRect(qrX, qrY, qrSize, qrSize, 4).lineWidth(0.6).dash(3, { space: 2 }).strokeColor(COLOR.faint).stroke().restore();
      this.write("GiroCode folgt beim Versand", qrX + 8, qrY + 28, { size: 7, color: COLOR.muted, width: qrSize - 16, align: "center" });
    } else {
      this.qrCode(giroCodePayload(data, this.dueCents), qrX, qrY, qrSize);
    }
    this.write("Mit der Banking-App scannen", qrX - 15, qrY + qrSize + 5, { size: 6.5, color: COLOR.muted, width: qrSize + 30, align: "center", lineBreak: false });
    this.y = top + boxHeight;
  }

  /** QR-Code als Vektorgrafik – gestochen scharf im Druck, ohne Rasterbild. */
  private qrCode(payload: string, x: number, y: number, size: number): void {
    const { modules } = QRCode.create(payload, { errorCorrectionLevel: "M" });
    const quiet = 2;
    const cell = size / (modules.size + quiet * 2);
    const { doc } = this;
    doc.save().rect(x, y, size, size).fill("#ffffff");
    for (let row = 0; row < modules.size; row++) {
      for (let col = 0; col < modules.size; col++) {
        if (modules.get(row, col)) doc.rect(x + (col + quiet) * cell, y + (row + quiet) * cell, cell + 0.02, cell + 0.02);
      }
    }
    doc.fill(COLOR.ink).restore();
  }

  // --- Folgeseiten, Fußzeile, Falzmarken --------------------------------------------------------------

  private continuationHeader(): void {
    const top = 14 * MM;
    this.logoMark(LEFT, top, 18);
    const heading = this.draft ? "Rechnungsentwurf" : `Rechnung ${this.data.number}`;
    this.write(heading, LEFT + 26, top + 4, { font: "semibold", size: 9, color: COLOR.ink, lineBreak: false });
    this.write(`Kundennummer ${this.data.buyer.customerNumber}`, RIGHT - 200, top + 4, { size: 8, color: COLOR.muted, width: 200, align: "right", lineBreak: false });
    this.rule(top + 26);
    this.y = top + 42;
  }

  private decoratePages(): void {
    const { doc, data } = this;
    const { seller } = data;
    const range = doc.bufferedPageRange();
    // Spaltenbreiten so, dass IBAN und Registerangaben nicht umbrechen.
    const widths = [100, 104, 136, WIDTH - 340];
    const columns = [
      [seller.name, seller.street, `${seller.postalCode} ${seller.city}`],
      [`Tel. ${seller.phone}`, seller.email, seller.website.replace(/^https?:\/\//, "")],
      [
        seller.managingDirectors ? `Geschäftsführer: ${seller.managingDirectors}` : "",
        [seller.registerCourt, seller.registerNumber].filter(Boolean).join(", "),
        seller.vatId ? `USt-IdNr. ${seller.vatId}` : "",
        seller.taxNumber ? `Steuernummer ${seller.taxNumber}` : "",
      ],
      [seller.bank.name, `IBAN ${groupedIban(seller.bank.iban)}`, seller.bank.bic ? `BIC ${seller.bank.bic}` : ""],
    ];

    for (let index = range.start; index < range.start + range.count; index++) {
      doc.switchToPage(index);
      const pageNumber = index - range.start + 1;

      // Falzmarken (DIN 5008 Form B) und Lochmarke
      for (const [y, length] of [
        [105 * MM, 12],
        [148.5 * MM, 18],
        [210 * MM, 12],
      ] as const) {
        doc.save().moveTo(10, y).lineTo(10 + length, y).lineWidth(0.4).strokeColor(COLOR.faint).stroke().restore();
      }

      if (this.draft) {
        doc.save();
        doc.rotate(-35, { origin: [PAGE_WIDTH / 2, PAGE_HEIGHT / 2] });
        doc.font("displayHeavy").fontSize(120).fillColor(COLOR.ink).fillOpacity(0.05);
        doc.text("ENTWURF", 0, PAGE_HEIGHT / 2 - 70, { width: PAGE_WIDTH, align: "center", lineBreak: false });
        doc.restore();
      }

      const hint = this.draft ? "Vorschau – keine gültige Rechnung" : "E-Rechnung nach EN 16931 (ZUGFeRD) – die Rechnungsdaten sind maschinenlesbar in dieser PDF enthalten.";
      this.write(hint, LEFT, FOOTER_TOP - 12, { size: 6.5, color: COLOR.faint, lineBreak: false });
      this.write(`Seite ${pageNumber} von ${range.count}`, RIGHT - 100, FOOTER_TOP - 12, { size: 6.5, color: COLOR.muted, width: 100, align: "right", lineBreak: false });
      this.rule(FOOTER_TOP);
      columns.forEach((lines, column) => {
        const x = LEFT + widths.slice(0, column).reduce((sum, width) => sum + width, 0);
        this.write(lines.filter(Boolean).join("\n"), x, FOOTER_TOP + 7, {
          size: 6.5,
          color: COLOR.muted,
          width: widths[column]! - 6,
          lineGap: 1.2,
        });
      });
    }
  }
}
