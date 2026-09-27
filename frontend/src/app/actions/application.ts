"use server";

import { z } from "zod";
import { company } from "@/content/company";
import { careerAreas, drivingLicenses, getCareers, initiativeJob, jobs, MAX_CV_MB } from "@/content/careers";
import { isLocale, type Locale } from "@/i18n/config";
import { guardSubmission } from "@/lib/form-guard";
import { collectValues, toFieldErrors, type FormState } from "@/lib/form-state";
import { mailRecipients, renderMailTable, sendMail } from "@/lib/mail";

/** Erlaubte Formate: Endung → MIME-Typ(en). */
const allowedFiles: Record<string, string[]> = {
  pdf: ["application/pdf"],
  doc: ["application/msword"],
  docx: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  jpg: ["image/jpeg"],
  jpeg: ["image/jpeg"],
  png: ["image/png"],
};

/** Magic Bytes – verhindert umbenannte ausführbare Dateien. */
function hasValidSignature(extension: string, bytes: Uint8Array): boolean {
  const starts = (...signature: number[]) => signature.every((byte, index) => bytes[index] === byte);
  switch (extension) {
    case "pdf":
      return starts(0x25, 0x50, 0x44, 0x46); // %PDF
    case "docx":
      return starts(0x50, 0x4b, 0x03, 0x04); // ZIP-Container
    case "doc":
      return starts(0xd0, 0xcf, 0x11, 0xe0); // OLE2
    case "jpg":
    case "jpeg":
      return starts(0xff, 0xd8, 0xff);
    case "png":
      return starts(0x89, 0x50, 0x4e, 0x47);
    default:
      return false;
  }
}

const positionIds = [initiativeJob.id, ...jobs.map((job) => job.id)] as [string, ...string[]];

const texts = {
  de: {
    position: "Bitte wählen Sie eine Stelle oder „Initiativbewerbung“.",
    name: "Bitte geben Sie Ihren Namen an.",
    email: "Bitte geben Sie eine gültige E-Mail-Adresse an.",
    phoneMissing: "Bitte geben Sie eine Telefonnummer an – wir rufen Sie gern zurück.",
    phone: "Bitte geben Sie eine gültige Telefonnummer an.",
    max: "Maximal 3000 Zeichen.",
    privacy: "Bitte stimmen Sie der Datenschutzerklärung zu.",
    tooLarge: (mb: number) => `Die Datei ist größer als ${mb} MB.`,
    fileType: "Bitte laden Sie eine PDF-, Word- oder Bilddatei hoch.",
    fileBroken: "Die Datei scheint beschädigt oder kein gültiges Dokument zu sein.",
    rateLimited: "Zu viele Bewerbungen in kurzer Zeit. Bitte versuchen Sie es später erneut.",
    check: "Bitte prüfen Sie die markierten Felder.",
    failed: `Ihre Bewerbung konnte gerade nicht übermittelt werden. Bitte senden Sie sie an ${company.contact.careersEmail}.`,
    confirmSubject: `Ihre Bewerbung bei ${company.name}`,
    confirmText: (name: string, position: string) =>
      `Hallo ${name},\n\nvielen Dank für Ihre Bewerbung als „${position}“. ` +
      `Wir melden uns innerhalb von 48 Stunden persönlich bei Ihnen.\n\nViele Grüße\nIhr Team von ${company.legalName}`,
    success: (name: string, position: string) =>
      `Danke, ${name}! Ihre Bewerbung als „${position}“ ist bei uns eingegangen. Wir melden uns innerhalb von 48 Stunden telefonisch oder per E-Mail.`,
  },
  en: {
    position: "Please choose a position or \"Speculative application\".",
    name: "Please enter your name.",
    email: "Please enter a valid email address.",
    phoneMissing: "Please enter a phone number – we are happy to call you back.",
    phone: "Please enter a valid phone number.",
    max: "Maximum 3000 characters.",
    privacy: "Please accept the privacy policy.",
    tooLarge: (mb: number) => `The file is larger than ${mb} MB.`,
    fileType: "Please upload a PDF, Word or image file.",
    fileBroken: "The file seems to be damaged or is not a valid document.",
    rateLimited: "Too many applications in a short time. Please try again later.",
    check: "Please check the highlighted fields.",
    failed: `Your application could not be sent just now. Please send it to ${company.contact.careersEmail}.`,
    confirmSubject: `Your application at ${company.name}`,
    confirmText: (name: string, position: string) =>
      `Hello ${name},\n\nthank you for your application as "${position}". ` +
      `We will get back to you personally within 48 hours.\n\nKind regards\nYour team at ${company.legalName}`,
    success: (name: string, position: string) =>
      `Thank you, ${name}! Your application as "${position}" has been received. We will get back to you by phone or email within 48 hours.`,
  },
} satisfies Record<Locale, unknown>;

function applicationSchema(locale: Locale) {
  const t = texts[locale];
  return z.object({
    position: z.enum(positionIds, { error: t.position }),
    name: z.string().trim().min(2, t.name).max(100),
    email: z.email(t.email).max(200),
    phone: z
      .string()
      .trim()
      .min(6, t.phoneMissing)
      .max(40)
      .regex(/^[+\d\s()/-]+$/, t.phone),
    start: z.string().trim().max(40).optional(),
    experience: z.enum(["keine", "unter-2", "2-5", "ueber-5"]).optional().or(z.literal("")),
    licenses: z.array(z.enum(drivingLicenses)).default([]),
    message: z.string().trim().max(3000, t.max).optional(),
    privacy: z.literal("on", { error: t.privacy }),
  });
}

const experienceLabels: Record<string, string> = {
  keine: "Keine – Quereinstieg",
  "unter-2": "Unter 2 Jahre",
  "2-5": "2 – 5 Jahre",
  "ueber-5": "Mehr als 5 Jahre",
};

type Attachment = { filename: string; content: Buffer; contentType: string };

async function readCv(file: FormDataEntryValue | null, locale: Locale): Promise<{ attachment?: Attachment; error?: string }> {
  const t = texts[locale];
  if (!(file instanceof File) || file.size === 0) return {};
  if (file.size > MAX_CV_MB * 1024 * 1024) return { error: t.tooLarge(MAX_CV_MB) };

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const mimeTypes = allowedFiles[extension];
  if (!mimeTypes || (file.type && !mimeTypes.includes(file.type))) {
    return { error: t.fileType };
  }

  const content = Buffer.from(await file.arrayBuffer());
  if (!hasValidSignature(extension, content)) return { error: t.fileBroken };

  // Dateiname bereinigen (keine Pfade/Sonderzeichen im Mail-Anhang).
  const safeName = file.name.replace(/[^\w.\-äöüÄÖÜß ]+/g, "_").slice(-100);
  return { attachment: { filename: safeName, content, contentType: mimeTypes[0] } };
}

export async function submitApplication(_previous: FormState, formData: FormData): Promise<FormState> {
  const values = collectValues(formData, ["licenses"]);
  // Server Actions kennen die Seitensprache nicht – das Formular schickt sie mit.
  const rawLocale = formData.get("locale");
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "de";
  const t = texts[locale];

  const guard = await guardSubmission(formData, "application");
  if (guard === "spam") return { status: "success" };
  if (guard === "rate-limited") return { status: "error", message: t.rateLimited, values };

  const parsed = applicationSchema(locale).safeParse({
    ...Object.fromEntries(formData),
    licenses: formData.getAll("licenses"),
  });
  const cv = await readCv(formData.get("cv"), locale);

  if (!parsed.success || cv.error) {
    return {
      status: "error",
      message: t.check,
      fieldErrors: { ...(parsed.success ? {} : toFieldErrors(parsed.error)), ...(cv.error ? { cv: cv.error } : {}) },
      values,
    };
  }

  const data = parsed.data;
  const job = jobs.find((entry) => entry.id === data.position);
  const positionTitle = job?.title ?? initiativeJob.title;
  const area = job ? careerAreas.find((entry) => entry.id === job.area)?.label : undefined;

  const rows: Array<[string, string | undefined]> = [
    ["Stelle", positionTitle],
    ["Sprache", locale === "en" ? "Englisch" : undefined],
    ["Bereich", area],
    ["Name", data.name],
    ["E-Mail", data.email],
    ["Telefon", data.phone],
    ["Frühester Start", data.start],
    ["Berufserfahrung", data.experience ? experienceLabels[data.experience] : undefined],
    ["Führerscheine", data.licenses.length ? data.licenses.join(", ") : undefined],
    ["Nachricht", data.message],
    ["Lebenslauf", cv.attachment ? cv.attachment.filename : "Nicht angehängt"],
  ];

  const internal = await sendMail({
    to: mailRecipients.careers,
    replyTo: data.email,
    subject: `Bewerbung: ${positionTitle} – ${data.name}`,
    text: rows.filter(([, value]) => value).map(([label, value]) => `${label}: ${value}`).join("\n"),
    html: renderMailTable(`Neue Bewerbung: ${positionTitle}`, rows),
    attachments: cv.attachment ? [cv.attachment] : undefined,
  });

  if (!internal.ok) {
    return { status: "error", message: t.failed, values };
  }

  // Bestätigung in der Sprache der Seite, mit dem Stellentitel in dieser Sprache.
  const careers = getCareers(locale);
  const customerTitle = careers.jobs.find((entry) => entry.id === data.position)?.title ?? careers.initiativeJob.title;
  await sendMail({ to: data.email, subject: t.confirmSubject, text: t.confirmText(data.name, customerTitle) });

  return { status: "success", message: t.success(data.name, customerTitle) };
}
