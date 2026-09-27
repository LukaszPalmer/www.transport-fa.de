import { COMPANY, type Locale } from "@fa/shared";
import { button, checklist, escapeHtml, heading, infoCard, legalFooterLine, linkFallback, note, paragraph, renderLayout, signature, smallText } from "./layout";
import {
  accountDeletedMailEn,
  chatReplyMailEn,
  invoiceDeliveryMailEn,
  invoiceIssuedMailEn,
  passwordResetMailEn,
  paymentReminderMailEn,
  securityNoticeMailEn,
  shipmentUpdateMailEn,
  verificationMailEn,
  welcomeMailEn,
} from "./templates-en";

/**
 * E-Mail-Vorlagen: HTML im Website-Design plus Klartext (Pflicht für gute
 * Zustellbarkeit und Barrierefreiheit). Alle Nutzereingaben werden escaped.
 * Kunden-Mails gibt es auch auf Englisch (templates-en.ts) – gewählt über `locale` (Profilsprache).
 */

export interface RenderedMail {
  subject: string;
  text: string;
  html: string;
}

const PORTAL_FEATURES = [
  "Aufträge, Termine und Status jederzeit im Blick",
  "Angebote, Rechnungen und Dokumente zum Download",
  "Sendungen live verfolgen – inklusive Fahrer und Ankunftszeit",
  "Direkter Draht zu Ihrem Ansprechpartner",
];

function textFooter(): string {
  return `\n\nHerzliche Grüße\nIhr Team von ${COMPANY.name}\n\n—\n${COMPANY.legalName} · ${COMPANY.address.street} · ${COMPANY.address.postalCode} ${COMPANY.address.city}\n${COMPANY.contact.phone} · ${COMPANY.contact.email} · ${COMPANY.websiteUrl}\n${legalFooterLine()}`;
}

// --- Willkommen (nach Google-Registrierung bzw. nach E-Mail-Bestätigung) -----------

export interface WelcomeMailInput {
  firstName: string;
  email: string;
  customerNumber: string;
  signInMethod: "google" | "password";
  portalUrl: string;
  locale?: Locale;
}

export function welcomeMail(input: WelcomeMailInput): RenderedMail {
  if (input.locale === "en") return welcomeMailEn(input);
  const { firstName, email, customerNumber, signInMethod, portalUrl } = input;
  const method = signInMethod === "google" ? "Mit Ihrem Google-Konto" : "Mit E-Mail und Passwort";
  const contactLine = `Fragen? Antworten Sie einfach auf diese E-Mail oder rufen Sie uns an: ${COMPANY.contact.phone} (${COMPANY.contact.hours}).`;

  return {
    subject: `Willkommen bei ${COMPANY.name}, ${firstName}!`,
    text:
      `Hallo ${firstName},\n\nschön, dass Sie da sind! Ihr Kundenkonto bei ${COMPANY.name} ist eingerichtet.\n\n` +
      `Kundennummer: ${customerNumber}\nE-Mail: ${email}\nAnmeldung: ${method}\n\n` +
      `Im Kundenportal finden Sie:\n${PORTAL_FEATURES.map((feature) => `• ${feature}`).join("\n")}\n\n` +
      `Zum Kundenportal: ${portalUrl}\n\n${contactLine}` +
      textFooter(),
    html: renderLayout({
      preheader: `Ihr Kundenkonto ist eingerichtet – Kundennummer ${customerNumber}.`,
      eyebrow: "Willkommen an Bord",
      title: `Schön, dass Sie da sind, ${firstName}!`,
      intro: "Ihr Kundenkonto ist eingerichtet. Ab sofort haben Sie alle Aufträge, Termine und Dokumente an einem Ort.",
      body: [
        paragraph(`Hallo ${firstName},`),
        paragraph(
          `vielen Dank für Ihre Registrierung bei ${COMPANY.name}. Ob Umzug, Entrümpelung oder Transport – im Kundenportal behalten Sie jederzeit den Überblick.`,
        ),
        infoCard([
          ["Kundennummer", customerNumber],
          ["E-Mail", email],
          ["Anmeldung", method],
        ]),
        heading("Das erwartet Sie im Portal"),
        checklist(PORTAL_FEATURES),
        button("Zum Kundenportal", portalUrl),
        smallText(
          `Bitte nennen Sie bei Anfragen Ihre Kundennummer <strong style="color:#0b132b">${escapeHtml(customerNumber)}</strong> – so können wir Ihnen schneller helfen.`,
        ),
        note(contactLine),
        signature(),
      ],
      reason: `Sie erhalten diese E-Mail, weil unter ${email} ein Kundenkonto bei ${COMPANY.name} angelegt wurde.`,
    }),
  };
}

// --- E-Mail-Adresse bestätigen ---------------------------------------------------------

export function verificationMail(firstName: string, url: string, purpose: "register" | "change" = "register", locale: Locale = "de"): RenderedMail {
  if (locale === "en") return verificationMailEn(firstName, url, purpose);
  if (purpose === "change") {
    return {
      subject: `Bitte bestätigen Sie Ihre neue E-Mail-Adresse – ${COMPANY.name}`,
      text:
        `Hallo ${firstName},\n\nIhr Kundenkonto bei ${COMPANY.name} nutzt ab sofort diese E-Mail-Adresse. Bitte bestätigen Sie sie ` +
        `über diesen Link (24 Stunden gültig):\n\n${url}\n\nFalls Sie das nicht veranlasst haben, melden Sie sich bitte bei uns.` +
        textFooter(),
      html: renderLayout({
        preheader: "Ein Klick – dann ist Ihre neue E-Mail-Adresse bestätigt.",
        eyebrow: "Neue E-Mail-Adresse",
        title: "Bitte bestätigen Sie Ihre neue Adresse",
        intro: "Ihr Kundenkonto nutzt ab sofort diese E-Mail-Adresse.",
        body: [
          paragraph(`Hallo ${firstName},`),
          paragraph("bitte bestätigen Sie Ihre neue E-Mail-Adresse – danach sehen Sie im Kundenportal wieder alle Aufträge, Dokumente und Rechnungen."),
          button("E-Mail-Adresse bestätigen", url),
          linkFallback(url),
          note(`Der Link ist 24 Stunden gültig. Falls Sie die Änderung nicht veranlasst haben, melden Sie sich bitte umgehend: ${COMPANY.contact.phone}.`),
          signature(),
        ],
        reason: `Sie erhalten diese E-Mail, weil diese Adresse bei ${COMPANY.name} für ein Kundenkonto hinterlegt wurde.`,
      }),
    };
  }
  return {
    subject: `Bitte bestätigen Sie Ihre E-Mail-Adresse – ${COMPANY.name}`,
    text:
      `Hallo ${firstName},\n\nwillkommen im Kundenportal von ${COMPANY.name}! Bitte bestätigen Sie Ihre E-Mail-Adresse ` +
      `über diesen Link (24 Stunden gültig):\n\n${url}\n\n` +
      `Falls Sie sich nicht registriert haben, können Sie diese E-Mail ignorieren.` +
      textFooter(),
    html: renderLayout({
      preheader: "Nur noch ein Klick – dann ist Ihr Kundenkonto startklar.",
      eyebrow: "Fast geschafft",
      title: "Bitte bestätigen Sie Ihre E-Mail-Adresse",
      intro: "Nur noch ein Klick – dann ist Ihr Kundenkonto startklar.",
      body: [
        paragraph(`Hallo ${firstName},`),
        paragraph(
          `vielen Dank für Ihre Registrierung bei ${COMPANY.name}! Bitte bestätigen Sie Ihre E-Mail-Adresse – danach sehen Sie im Kundenportal alle Aufträge, Dokumente und Rechnungen.`,
        ),
        button("E-Mail-Adresse bestätigen", url),
        linkFallback(url),
        note("Der Link ist 24 Stunden gültig. Falls Sie sich nicht bei uns registriert haben, können Sie diese E-Mail einfach ignorieren."),
        signature(),
      ],
      reason: `Sie erhalten diese E-Mail, weil mit dieser Adresse ein Kundenkonto bei ${COMPANY.name} erstellt wurde.`,
    }),
  };
}

// --- Passwort zurücksetzen ---------------------------------------------------------------

export function passwordResetMail(firstName: string, url: string, locale: Locale = "de"): RenderedMail {
  if (locale === "en") return passwordResetMailEn(firstName, url);
  return {
    subject: `Passwort zurücksetzen – ${COMPANY.name} Kundenportal`,
    text:
      `Hallo ${firstName},\n\nSie haben das Zurücksetzen Ihres Passworts angefordert. Der folgende Link ist 60 Minuten gültig:\n\n${url}\n\n` +
      `Falls Sie das nicht waren, können Sie diese E-Mail ignorieren – Ihr Passwort bleibt unverändert.` +
      textFooter(),
    html: renderLayout({
      preheader: "Legen Sie jetzt ein neues Passwort fest – der Link ist 60 Minuten gültig.",
      eyebrow: "Sicherheit",
      title: "Neues Passwort festlegen",
      intro: "Sie haben angefordert, Ihr Passwort zurückzusetzen.",
      body: [
        paragraph(`Hallo ${firstName},`),
        paragraph("über den Button legen Sie ein neues Passwort für Ihr Kundenkonto fest. Aus Sicherheitsgründen werden danach alle bestehenden Anmeldungen beendet."),
        button("Neues Passwort festlegen", url),
        linkFallback(url),
        note("Der Link ist 60 Minuten gültig und nur einmal verwendbar. Falls Sie das nicht waren, können Sie diese E-Mail ignorieren – Ihr Passwort bleibt unverändert."),
        signature(),
      ],
      reason: `Sie erhalten diese E-Mail, weil für Ihr Kundenkonto bei ${COMPANY.name} ein neues Passwort angefordert wurde.`,
    }),
  };
}

// --- Sicherheitshinweis: Zugangsdaten geändert --------------------------------------------

export interface SecurityNoticeInput {
  firstName: string;
  /** Selbst geändert (Einstellungen) oder vom Team im Admin-Bereich neu gesetzt. */
  changedBy: "self" | "staff";
  passwordChanged: boolean;
  /** Neue Adresse – die Mail geht an die bisherige, damit ein Missbrauch auffällt. */
  newEmail?: string;
  loginUrl: string;
  account?: "customer" | "staff";
  locale?: Locale;
}

export function securityNoticeMail(input: SecurityNoticeInput): RenderedMail {
  if (input.locale === "en" && input.account !== "staff") return securityNoticeMailEn(input);
  const { firstName, changedBy, passwordChanged, newEmail, loginUrl, account = "customer" } = input;
  const parts = [newEmail ? ["E-Mail-Adresse", "die E-Mail-Adresse"] : undefined, passwordChanged ? ["Passwort", "das Passwort"] : undefined].filter(
    (part): part is string[] => part !== undefined,
  );
  const what = parts.map(([label]) => label).join(" und ");
  const withArticles = parts.map(([, label]) => label).join(" und ");
  const accountLabel = account === "staff" ? "Ihres Mitarbeiterzugangs" : "Ihres Kundenkontos";
  const who =
    changedBy === "staff"
      ? `Unser Team hat ${withArticles} ${accountLabel} neu gesetzt.`
      : `${withArticles.charAt(0).toUpperCase()}${withArticles.slice(1)} ${accountLabel} ${parts.length > 1 ? "wurden" : "wurde"} soeben geändert.`;
  const rows: Array<[string, string]> = [["Geändert", what]];
  if (newEmail) rows.push(["Neue E-Mail-Adresse", newEmail]);
  rows.push(["Zeitpunkt", new Intl.DateTimeFormat("de-DE", { dateStyle: "long", timeStyle: "short", timeZone: "Europe/Berlin" }).format(new Date())]);
  const warning = `Falls Sie das nicht veranlasst haben, melden Sie sich bitte umgehend bei uns: ${COMPANY.contact.phone} oder ${COMPANY.contact.email}.`;
  const relogin = "Aus Sicherheitsgründen wurden alle anderen Anmeldungen beendet – melden Sie sich dort bitte neu an.";

  return {
    subject: `Sicherheitshinweis: ${what} geändert – ${COMPANY.name}`,
    text:
      `Hallo ${firstName},\n\n${who}\n\n${rows.map(([label, value]) => `${label}: ${value}`).join("\n")}\n\n${relogin}\n\n` +
      `Zur Anmeldung: ${loginUrl}\n\n${warning}` +
      textFooter(),
    html: renderLayout({
      preheader: who,
      eyebrow: "Sicherheit",
      title: `${what.charAt(0).toUpperCase()}${what.slice(1)} geändert`,
      intro: who,
      body: [
        paragraph(`Hallo ${firstName},`),
        paragraph(who),
        infoCard(rows),
        paragraph(relogin),
        button("Zur Anmeldung", loginUrl),
        note(warning),
        signature(),
      ],
      reason: `Sie erhalten diese E-Mail, weil sich die Zugangsdaten ${accountLabel} bei ${COMPANY.name} geändert haben.`,
    }),
  };
}

// --- Auftragsstatus -------------------------------------------------------------------------

export interface ShipmentUpdateInput {
  firstName: string;
  shipmentNumber: string;
  route: string;
  headline: string;
  message: string;
  driver?: { name: string; phone: string; plate?: string };
  url: string;
  settingsUrl: string;
  locale?: Locale;
}

export function shipmentUpdateMail(input: ShipmentUpdateInput): RenderedMail {
  if (input.locale === "en") return shipmentUpdateMailEn(input);
  const { firstName, shipmentNumber, route, headline, message, driver, url, settingsUrl } = input;
  const rows: Array<[string, string]> = [
    ["Auftrag", shipmentNumber],
    ["Strecke", route],
  ];
  if (driver) {
    rows.push(["Fahrer", driver.name], ["Telefon", driver.phone]);
    if (driver.plate) rows.push(["Kennzeichen", driver.plate]);
  }
  const optOut = `Diese Benachrichtigung können Sie in den Einstellungen des Kundenportals abbestellen: ${settingsUrl}`;
  return {
    subject: `${headline} – Auftrag ${shipmentNumber}`,
    text: `Hallo ${firstName},\n\n${message}\n\n${rows.map(([label, value]) => `${label}: ${value}`).join("\n")}\n\nLive verfolgen: ${url}\n\n${optOut}` + textFooter(),
    html: renderLayout({
      preheader: message,
      eyebrow: `Auftrag ${shipmentNumber}`,
      title: headline,
      intro: message,
      body: [paragraph(`Hallo ${firstName},`), paragraph(message), infoCard(rows), button("Auftrag ansehen", url), smallText(escapeHtml(optOut)), signature()],
      reason: `Sie erhalten diese E-Mail, weil Sie Benachrichtigungen zu Ihren Aufträgen bei ${COMPANY.name} aktiviert haben.`,
    }),
  };
}

// --- Neuer Beleg (Angebot, Auftragsbestätigung, Rechnung, Gutschrift) ----------------------

export interface InvoiceIssuedInput {
  firstName: string;
  typeLabel: string;
  number: string;
  amount: string;
  /** Z. B. „Fällig am“ + Datum oder „Gültig bis“ + Datum. */
  deadline?: [label: string, value: string];
  paidNote?: string;
  shipmentNumber?: string;
  url: string;
  settingsUrl: string;
  locale?: Locale;
}

export function invoiceIssuedMail(input: InvoiceIssuedInput): RenderedMail {
  if (input.locale === "en") return invoiceIssuedMailEn(input);
  const { firstName, typeLabel, number, amount, deadline, paidNote, shipmentNumber, url, settingsUrl } = input;
  const rows: Array<[string, string]> = [
    [typeLabel, number],
    ["Betrag", amount],
  ];
  if (deadline) rows.push(deadline);
  if (shipmentNumber) rows.push(["Auftrag", shipmentNumber]);
  if (paidNote) rows.push(["Status", paidNote]);

  const message = `wir haben Ihnen eine neue ${typeLabel} bereitgestellt. Sie finden sie im Kundenportal – dort können Sie sie jederzeit ansehen, ausdrucken und als PDF herunterladen.`;
  const optOut = `Diese Benachrichtigung können Sie in den Einstellungen des Kundenportals abbestellen: ${settingsUrl}`;
  return {
    subject: `Ihre ${typeLabel} ${number} – ${COMPANY.name}`,
    text: `Hallo ${firstName},\n\n${message}\n\n${rows.map(([label, value]) => `${label}: ${value}`).join("\n")}\n\nIm Kundenportal ansehen: ${url}\n\n${optOut}` + textFooter(),
    html: renderLayout({
      preheader: `${typeLabel} ${number} über ${amount}`,
      eyebrow: `${typeLabel} ${number}`,
      title: `Ihre ${typeLabel} ist da`,
      intro: `Ansehen, drucken und herunterladen – jederzeit im Kundenportal.`,
      body: [paragraph(`Hallo ${firstName},`), paragraph(message), infoCard(rows), button(`${typeLabel} ansehen`, url), smallText(escapeHtml(optOut)), signature()],
      reason: `Sie erhalten diese E-Mail, weil Sie Benachrichtigungen zu Rechnungen und Angeboten bei ${COMPANY.name} aktiviert haben.`,
    }),
  };
}

// --- Rechnung versenden (im Portal erstellte E-Rechnung, PDF im Anhang) --------------------

export interface InvoiceDeliveryInput {
  /** Anrede: Vorname bei Privatkunden, sonst leer („Guten Tag,“). */
  greetingName?: string;
  number: string;
  issueDate: string;
  amount: string;
  /** Offen: Fälligkeit + Bankdaten; bezahlt: Hinweis statt Zahlungsaufforderung. */
  payment: { dueDate: string; iban: string; accountHolder: string } | { paidNote: string };
  shipmentNumber?: string;
  fileName: string;
  url: string;
  locale?: Locale;
}

export function invoiceDeliveryMail(input: InvoiceDeliveryInput): RenderedMail {
  if (input.locale === "en") return invoiceDeliveryMailEn(input);
  const { greetingName, number, issueDate, amount, payment, shipmentNumber, fileName, url } = input;
  const hello = greetingName ? `Hallo ${greetingName},` : "Guten Tag,";
  const rows: Array<[string, string]> = [
    ["Rechnungsnummer", number],
    ["Rechnungsdatum", issueDate],
    ["Rechnungsbetrag", amount],
  ];
  if (shipmentNumber) rows.push(["Auftrag", shipmentNumber]);
  if ("dueDate" in payment) {
    rows.push(["Zahlbar bis", payment.dueDate], ["IBAN", payment.iban], ["Verwendungszweck", number]);
  } else {
    rows.push(["Status", payment.paidNote]);
  }

  const message = `anbei erhalten Sie unsere Rechnung ${number}. Sie ist als PDF angehängt – eine E-Rechnung im ZUGFeRD-Format, die sich ausdrucken und von Buchhaltungsprogrammen direkt einlesen lässt. Im Kundenportal finden Sie die Rechnung ebenfalls jederzeit.`;
  const request = "dueDate" in payment ? `Bitte überweisen Sie den Betrag bis zum ${payment.dueDate} an ${payment.accountHolder}. Auf der Rechnung finden Sie außerdem einen GiroCode für Ihre Banking-App.` : undefined;
  return {
    subject: `Ihre Rechnung ${number} – ${COMPANY.name}`,
    text:
      `${hello}\n\n${message}\n\n${rows.map(([label, value]) => `${label}: ${value}`).join("\n")}\n\n` +
      (request ? `${request}\n\n` : "") +
      `Anhang: ${fileName}\nIm Kundenportal ansehen: ${url}` +
      textFooter(),
    html: renderLayout({
      preheader: `Rechnung ${number} über ${amount}`,
      eyebrow: `Rechnung ${number}`,
      title: "Ihre Rechnung",
      intro: "Die PDF finden Sie im Anhang dieser E-Mail und jederzeit im Kundenportal.",
      body: [
        paragraph(hello),
        paragraph(message),
        infoCard(rows),
        ...(request ? [paragraph(request)] : []),
        button("Im Kundenportal ansehen", url),
        smallText(`Anhang: ${escapeHtml(fileName)}`),
        signature(),
      ],
      reason: `Sie erhalten diese E-Mail, weil ${COMPANY.name} Ihnen eine Rechnung gestellt hat.`,
    }),
  };
}

// --- Chat-Antwort (Kunde war offline) -------------------------------------------------------

export interface ChatReplyInput {
  firstName: string;
  staffName: string;
  preview: string;
  url: string;
  settingsUrl: string;
  locale?: Locale;
}

export function chatReplyMail(input: ChatReplyInput): RenderedMail {
  if (input.locale === "en") return chatReplyMailEn(input);
  const { firstName, staffName, preview, url, settingsUrl } = input;
  const optOut = `Diese Benachrichtigung können Sie in den Einstellungen des Kundenportals abbestellen: ${settingsUrl}`;
  return {
    subject: `Neue Antwort von ${staffName} – ${COMPANY.name}`,
    text: `Hallo ${firstName},\n\n${staffName} hat Ihnen im Chat geantwortet:\n\n„${preview}“\n\nZum Chat: ${url}\n\n${optOut}` + textFooter(),
    html: renderLayout({
      preheader: `${staffName}: ${preview}`,
      eyebrow: "Live-Chat",
      title: "Sie haben eine neue Antwort",
      intro: `${staffName} hat Ihnen im Chat geantwortet.`,
      body: [
        paragraph(`Hallo ${firstName},`),
        paragraph(`${staffName} hat Ihnen im Chat geantwortet:`),
        note(`„${preview}“`),
        button("Zum Chat", url),
        smallText(escapeHtml(optOut)),
        signature(),
      ],
      reason: `Sie erhalten diese E-Mail, weil Sie Benachrichtigungen zu Chat-Antworten bei ${COMPANY.name} aktiviert haben.`,
    }),
  };
}

// --- Konto gelöscht ---------------------------------------------------------------------

export interface AccountDeletedInput {
  firstName: string;
  /** Anzahl der Rechnungen/Gutschriften im Anhang. */
  attached: number;
  /** Belege, die nicht mehr in den Anhang passten (auf Anfrage erhältlich). */
  omitted: number;
  /** Anzahl aller aufbewahrten Belege (inkl. Angebote). */
  retained: number;
  locale?: Locale;
}

export function accountDeletedMail(input: AccountDeletedInput): RenderedMail {
  if (input.locale === "en") return accountDeletedMailEn(input);
  const { firstName, attached, omitted, retained } = input;
  const greeting = firstName ? `Hallo ${firstName},` : "Guten Tag,";
  const deletedText = `wie gewünscht haben wir Ihr Kundenkonto bei ${COMPANY.name} gelöscht – mit Ihrer Anmeldung, allen Aufträgen, Dokumenten und Nachrichten.`;
  const invoiceText =
    attached > 0
      ? `Damit Ihnen nichts fehlt, finden Sie ${attached === 1 ? "Ihre Rechnung" : `Ihre ${attached} Rechnungen`} als PDF im Anhang dieser E-Mail.${omitted > 0 ? ` ${omitted} weitere senden wir Ihnen auf Anfrage gern zu.` : ""}`
      : "";
  const retentionText =
    retained > 0
      ? `Ihre Rechnungen und Belege müssen wir gesetzlich aufbewahren (bis zu 8 Jahre, § 147 AO). Sie sind im Portal nicht mehr sichtbar und werden nach Ablauf der Frist automatisch gelöscht. Eine Kopie erhalten Sie jederzeit unter ${COMPANY.contact.email}.`
      : "";
  const warning = `Falls Sie die Löschung nicht veranlasst haben, melden Sie sich bitte umgehend: ${COMPANY.contact.phone}.`;

  return {
    subject: `Ihr Kundenkonto wurde gelöscht – ${COMPANY.name}`,
    text: [greeting, deletedText, invoiceText, retentionText, warning].filter(Boolean).join("\n\n") + textFooter(),
    html: renderLayout({
      preheader: attached > 0 ? "Ihr Konto ist gelöscht – Ihre Rechnungen finden Sie im Anhang." : "Ihr Kundenkonto wurde gelöscht.",
      eyebrow: "Konto gelöscht",
      title: "Schade, dass Sie gehen",
      intro: "Ihr Kundenkonto wurde gelöscht.",
      body: [
        paragraph(greeting),
        paragraph(deletedText),
        ...(invoiceText ? [paragraph(invoiceText)] : []),
        paragraph("Sie sind uns jederzeit wieder willkommen – ein neues Konto ist in einer Minute angelegt."),
        ...(retentionText ? [note(retentionText)] : []),
        note(warning),
        signature(),
      ],
      reason: `Sie erhalten diese E-Mail als Bestätigung der Löschung Ihres Kundenkontos bei ${COMPANY.name}.`,
    }),
  };
}

// --- Belegpaket an die Steuerberatung ------------------------------------------------------

export interface AccountingExportMailInput {
  accountantName?: string;
  period: string;
  invoiceCount: number;
  creditNoteCount: number;
  grossTotal: string;
  includesDatev: boolean;
  fileName: string;
  message?: string;
  senderName: string;
}

export function accountingExportMail(input: AccountingExportMailInput): RenderedMail {
  const hello = input.accountantName ? `Guten Tag ${input.accountantName},` : "Guten Tag,";
  const intro = `anbei erhalten Sie die Ausgangsbelege von ${COMPANY.legalName} für den Zeitraum ${input.period}.`;
  const contents = [
    `${input.invoiceCount} ${input.invoiceCount === 1 ? "Rechnung" : "Rechnungen"} und ${input.creditNoteCount} ${input.creditNoteCount === 1 ? "Gutschrift" : "Gutschriften"} als PDF (E-Rechnungen im ZUGFeRD-Format, zusätzlich als XRechnung-XML)`,
    input.includesDatev ? "DATEV-Buchungsstapel (EXTF 700) – nicht festgeschrieben" : "Kein DATEV-Buchungsstapel (Berater-/Mandantennummer fehlt)",
    "Rechnungsausgangsbuch und Debitorenliste als CSV",
    "Hinweise.txt mit Summen je Steuersatz und offenen Punkten",
  ];
  const rows: Array<[string, string]> = [
    ["Zeitraum", input.period],
    ["Belege", `${input.invoiceCount + input.creditNoteCount}`],
    ["Umsatz brutto", input.grossTotal],
    ["Anhang", input.fileName],
  ];
  return {
    subject: `Belegpaket ${input.period} – ${COMPANY.legalName}`,
    text:
      `${hello}\n\n${intro}\n\nInhalt:\n${contents.map((item) => `- ${item}`).join("\n")}\n\n` +
      (input.message ? `Nachricht von ${input.senderName}:\n${input.message}\n\n` : "") +
      `Bei Rückfragen antworten Sie einfach auf diese E-Mail.` +
      textFooter(),
    html: renderLayout({
      preheader: `Ausgangsbelege ${input.period} mit DATEV-Export`,
      eyebrow: "Buchhaltung",
      title: `Belegpaket ${input.period}`,
      intro: "Rechnungen, Gutschriften und DATEV-Export im Anhang.",
      body: [
        paragraph(hello),
        paragraph(intro),
        infoCard(rows),
        heading("Inhalt des Pakets"),
        checklist(contents),
        ...(input.message ? [heading(`Nachricht von ${input.senderName}`), note(input.message)] : []),
        paragraph("Bei Rückfragen antworten Sie einfach auf diese E-Mail."),
        signature(),
      ],
      reason: `Sie erhalten diese E-Mail, weil ${COMPANY.name} Ihnen Buchhaltungsunterlagen übermittelt.`,
    }),
  };
}

// --- Zahlungserinnerung und Mahnung ------------------------------------------------------------

export interface PaymentReminderMailInput {
  level: 1 | 2 | 3;
  greetingName: string;
  number: string;
  issueDate: string;
  dueDate: string;
  amount: string;
  iban: string;
  accountHolder: string;
  newDueDate: string;
  url?: string;
  locale?: Locale;
}

const REMINDER_TITLE = { 1: "Zahlungserinnerung", 2: "1. Mahnung", 3: "2. Mahnung" } as const;

export function paymentReminderMail(input: PaymentReminderMailInput): RenderedMail {
  if (input.locale === "en") return paymentReminderMailEn(input);
  const title = REMINDER_TITLE[input.level];
  const hello = input.greetingName ? `Hallo ${input.greetingName},` : "Guten Tag,";
  const message =
    input.level === 1
      ? `sicher ist es Ihrer Aufmerksamkeit entgangen: Für unsere Rechnung ${input.number} vom ${input.issueDate} konnten wir bis zum ${input.dueDate} noch keinen Zahlungseingang feststellen.`
      : `leider ist unsere Rechnung ${input.number} vom ${input.issueDate} trotz Fälligkeit am ${input.dueDate}${input.level === 3 ? " und unserer bisherigen Mahnung" : " und unserer Zahlungserinnerung"} weiterhin offen.`;
  const request = `Bitte überweisen Sie ${input.amount} bis zum ${input.newDueDate} an ${input.accountHolder} (IBAN ${input.iban}), Verwendungszweck ${input.number}.`;
  const closing =
    input.level === 3
      ? "Sollte die Zahlung bis dahin nicht eingehen, behalten wir uns weitere Schritte vor. Haben Sie den Betrag bereits überwiesen, betrachten Sie dieses Schreiben bitte als gegenstandslos."
      : "Haben Sie den Betrag bereits überwiesen, betrachten Sie diese E-Mail bitte als gegenstandslos. Bei Fragen sind wir gern für Sie da.";
  const rows: Array<[string, string]> = [
    ["Rechnungsnummer", input.number],
    ["Rechnungsdatum", input.issueDate],
    ["Fällig seit", input.dueDate],
    ["Offener Betrag", input.amount],
    ["Bitte zahlen bis", input.newDueDate],
  ];
  return {
    subject: `${title}: Rechnung ${input.number} – ${COMPANY.name}`,
    text: `${hello}\n\n${message}\n\n${rows.map(([label, value]) => `${label}: ${value}`).join("\n")}\n\n${request}\n\n${closing}` + (input.url ? `\n\nRechnung im Kundenportal: ${input.url}` : "") + textFooter(),
    html: renderLayout({
      preheader: `${title} zu Rechnung ${input.number} über ${input.amount}`,
      eyebrow: title,
      title: input.level === 1 ? "Kleine Erinnerung" : title,
      intro: `Rechnung ${input.number} ist noch offen.`,
      body: [
        paragraph(hello),
        paragraph(message),
        infoCard(rows),
        paragraph(request),
        ...(input.url ? [button("Rechnung ansehen", input.url)] : []),
        note(closing),
        signature(),
      ],
      reason: `Sie erhalten diese E-Mail, weil eine Rechnung von ${COMPANY.name} an Sie noch offen ist.`,
    }),
  };
}
