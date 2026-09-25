import { COMPANY } from "@fa/shared";
import { button, checklist, escapeHtml, heading, infoCard, linkFallback, note, paragraph, renderLayout, signature, smallText } from "./layout";

/**
 * E-Mail-Vorlagen: HTML im Website-Design plus Klartext (Pflicht für gute
 * Zustellbarkeit und Barrierefreiheit). Alle Nutzereingaben werden escaped.
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
  return `\n\nHerzliche Grüße\nIhr Team von ${COMPANY.name}\n\n—\n${COMPANY.legalName} · ${COMPANY.address.street} · ${COMPANY.address.postalCode} ${COMPANY.address.city}\n${COMPANY.contact.phone} · ${COMPANY.contact.email} · ${COMPANY.websiteUrl}`;
}

// --- Willkommen (nach Google-Registrierung bzw. nach E-Mail-Bestätigung) -----------

export interface WelcomeMailInput {
  firstName: string;
  email: string;
  customerNumber: string;
  signInMethod: "google" | "password";
  portalUrl: string;
}

export function welcomeMail({ firstName, email, customerNumber, signInMethod, portalUrl }: WelcomeMailInput): RenderedMail {
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

export function verificationMail(firstName: string, url: string): RenderedMail {
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

export function passwordResetMail(firstName: string, url: string): RenderedMail {
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
