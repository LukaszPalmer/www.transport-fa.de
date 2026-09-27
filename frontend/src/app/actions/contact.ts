"use server";

import { LEAD_TOPICS, type LeadTopic } from "@fa/shared";
import { z } from "zod";
import { company } from "@/content/company";
import { contactTopics, getContact } from "@/content/contact";
import { isLocale, type Locale } from "@/i18n/config";
import { guardSubmission } from "@/lib/form-guard";
import { collectValues, toFieldErrors, type FormState } from "@/lib/form-state";
import { forwardLead } from "@/lib/leads";
import { mailRecipients, renderMailTable, sendMail } from "@/lib/mail";

const topicValues = contactTopics.map((topic) => topic.value) as [string, ...string[]];

const texts = {
  de: {
    max: (max: number) => `Maximal ${max} Zeichen.`,
    topic: "Bitte wählen Sie aus, worum es geht.",
    name: "Bitte geben Sie Ihren Namen an.",
    email: "Bitte geben Sie eine gültige E-Mail-Adresse an.",
    phone: "Bitte geben Sie eine gültige Telefonnummer an.",
    message: "Bitte beschreiben Sie Ihr Anliegen kurz (mind. 10 Zeichen).",
    privacy: "Bitte stimmen Sie der Datenschutzerklärung zu.",
    rateLimited: `Sie haben in kurzer Zeit mehrere Anfragen gesendet. Bitte versuchen Sie es in einigen Minuten erneut oder rufen Sie uns an: ${company.contact.phone}.`,
    check: "Bitte prüfen Sie die markierten Felder.",
    failed: `Ihre Anfrage konnte gerade nicht übermittelt werden. Bitte versuchen Sie es erneut oder schreiben Sie direkt an ${company.contact.email}.`,
    confirmSubject: `Ihre Anfrage bei ${company.name} ist eingegangen`,
    confirmText: (name: string, topic: string, number?: string) =>
      `Guten Tag ${name},\n\nvielen Dank für Ihre Anfrage zum Thema „${topic}“${number ? ` (Anfrage-Nr. ${number})` : ""}. ` +
      `Wir melden uns in der Regel innerhalb von 24 Stunden.\n\n` +
      `Bei Fragen erreichen Sie uns unter ${company.contact.phone}.\n\nMit freundlichen Grüßen\nIhr Team von ${company.legalName}`,
    success: (name: string, email: string) =>
      `Vielen Dank, ${name}! Wir haben Ihre Anfrage erhalten und melden uns in Kürze. Eine Bestätigung ist unterwegs an ${email}.`,
  },
  en: {
    max: (max: number) => `Maximum ${max} characters.`,
    topic: "Please choose what it is about.",
    name: "Please enter your name.",
    email: "Please enter a valid email address.",
    phone: "Please enter a valid phone number.",
    message: "Please describe your request briefly (at least 10 characters).",
    privacy: "Please accept the privacy policy.",
    rateLimited: `You have sent several enquiries in a short time. Please try again in a few minutes or call us: ${company.contact.phone}.`,
    check: "Please check the highlighted fields.",
    failed: `Your enquiry could not be sent just now. Please try again or write to us directly at ${company.contact.email}.`,
    confirmSubject: `We have received your enquiry – ${company.name}`,
    confirmText: (name: string, topic: string, number?: string) =>
      `Hello ${name},\n\nthank you for your enquiry about "${topic}"${number ? ` (enquiry no. ${number})` : ""}. ` +
      `We usually get back to you within 24 hours.\n\n` +
      `If you have any questions, you can reach us at ${company.contact.phone}.\n\nKind regards\nYour team at ${company.legalName}`,
    success: (name: string, email: string) =>
      `Thank you, ${name}! We have received your enquiry and will be in touch shortly. A confirmation is on its way to ${email}.`,
  },
} satisfies Record<Locale, unknown>;

function contactSchema(locale: Locale) {
  const t = texts[locale];
  const optionalText = (max: number) => z.string().trim().max(max, t.max(max)).optional();
  return z.object({
    topic: z.enum(topicValues, { error: t.topic }),
    name: z.string().trim().min(2, t.name).max(100),
    company: optionalText(120),
    email: z.email(t.email).max(200),
    phone: z
      .string()
      .trim()
      .max(40)
      .regex(/^[+\d\s()/-]*$/, t.phone)
      .optional(),
    from: optionalText(160),
    to: optionalText(160),
    date: optionalText(20),
    message: z.string().trim().min(10, t.message).max(4000),
    callback: z.literal("on").optional(),
    privacy: z.literal("on", { error: t.privacy }),
  });
}

export async function submitContact(_previous: FormState, formData: FormData): Promise<FormState> {
  const values = collectValues(formData);
  // Server Actions kennen die Seitensprache nicht – das Formular schickt sie mit.
  const rawLocale = formData.get("locale");
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "de";
  const t = texts[locale];

  const guard = await guardSubmission(formData, "contact");
  // Bots erhalten eine scheinbare Erfolgsmeldung – kein Hinweis auf den Filter.
  if (guard === "spam") return { status: "success" };
  if (guard === "rate-limited") return { status: "error", message: t.rateLimited, values };

  const parsed = contactSchema(locale).safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: "error", message: t.check, fieldErrors: toFieldErrors(parsed.error), values };
  }

  const data = parsed.data;
  // Büro-Mail immer mit deutschem Thema, die Bestätigung in der Sprache des Kunden.
  const topic = contactTopics.find((entry) => entry.value === data.topic)?.label ?? data.topic;
  const customerTopic = getContact(locale).contactTopics.find((entry) => entry.value === data.topic)?.label ?? topic;

  // Zusätzlich ins CRM (Admin → Anfragen); die Nummer erscheint in der Büro-Mail.
  const leadNumber = await forwardLead({
    topic: (LEAD_TOPICS as readonly string[]).includes(data.topic) ? (data.topic as LeadTopic) : "sonstiges",
    source: "WEBSITE",
    name: data.name,
    company: data.company,
    email: data.email,
    phone: data.phone,
    from: data.from,
    to: data.to,
    preferredDate: data.date,
    message: data.message,
    callback: Boolean(data.callback),
    locale,
  });

  const rows: Array<[string, string | undefined]> = [
    ["Anfrage-Nr.", leadNumber],
    ["Anliegen", topic],
    ["Sprache", locale === "en" ? "Englisch" : undefined],
    ["Name", data.name],
    ["Firma", data.company],
    ["E-Mail", data.email],
    ["Telefon", data.phone],
    ["Rückruf gewünscht", data.callback ? "Ja" : undefined],
    ["Von / Objektadresse", data.from],
    ["Nach", data.to],
    ["Wunschtermin", data.date],
    ["Nachricht", data.message],
  ];

  const internal = await sendMail({
    to: mailRecipients.contact,
    replyTo: data.email,
    subject: `Neue Anfrage${leadNumber ? ` ${leadNumber}` : ""}: ${topic} – ${data.name}${locale === "en" ? " (EN)" : ""}`,
    text: rows.filter(([, value]) => value).map(([label, value]) => `${label}: ${value}`).join("\n"),
    html: renderMailTable(`Neue Anfrage: ${topic}`, rows),
  });

  if (!internal.ok) return { status: "error", message: t.failed, values };

  // Eingangsbestätigung an den Kunden (Best Effort – Fehler blockieren nicht).
  await sendMail({ to: data.email, subject: t.confirmSubject, text: t.confirmText(data.name, customerTopic, leadNumber) });

  return { status: "success", message: t.success(data.name, data.email) };
}
