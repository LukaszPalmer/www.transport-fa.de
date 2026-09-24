"use server";

import { z } from "zod";
import { company } from "@/content/company";
import { careerAreas, drivingLicenses, initiativeJob, jobs, MAX_CV_MB } from "@/content/careers";
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

const applicationSchema = z.object({
  position: z.enum(positionIds, { error: "Bitte wählen Sie eine Stelle oder „Initiativbewerbung“." }),
  name: z.string().trim().min(2, "Bitte geben Sie Ihren Namen an.").max(100),
  email: z.email("Bitte geben Sie eine gültige E-Mail-Adresse an.").max(200),
  phone: z
    .string()
    .trim()
    .min(6, "Bitte geben Sie eine Telefonnummer an – wir rufen Sie gern zurück.")
    .max(40)
    .regex(/^[+\d\s()/-]+$/, "Bitte geben Sie eine gültige Telefonnummer an."),
  start: z.string().trim().max(40).optional(),
  experience: z.enum(["keine", "unter-2", "2-5", "ueber-5"]).optional().or(z.literal("")),
  licenses: z.array(z.enum(drivingLicenses)).default([]),
  message: z.string().trim().max(3000, "Maximal 3000 Zeichen.").optional(),
  privacy: z.literal("on", { error: "Bitte stimmen Sie der Datenschutzerklärung zu." }),
});

const experienceLabels: Record<string, string> = {
  keine: "Keine – Quereinstieg",
  "unter-2": "Unter 2 Jahre",
  "2-5": "2 – 5 Jahre",
  "ueber-5": "Mehr als 5 Jahre",
};

type Attachment = { filename: string; content: Buffer; contentType: string };

async function readCv(file: FormDataEntryValue | null): Promise<{ attachment?: Attachment; error?: string }> {
  if (!(file instanceof File) || file.size === 0) return {};
  if (file.size > MAX_CV_MB * 1024 * 1024) return { error: `Die Datei ist größer als ${MAX_CV_MB} MB.` };

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const mimeTypes = allowedFiles[extension];
  if (!mimeTypes || (file.type && !mimeTypes.includes(file.type))) {
    return { error: "Bitte laden Sie eine PDF-, Word- oder Bilddatei hoch." };
  }

  const content = Buffer.from(await file.arrayBuffer());
  if (!hasValidSignature(extension, content)) return { error: "Die Datei scheint beschädigt oder kein gültiges Dokument zu sein." };

  // Dateiname bereinigen (keine Pfade/Sonderzeichen im Mail-Anhang).
  const safeName = file.name.replace(/[^\w.\-äöüÄÖÜß ]+/g, "_").slice(-100);
  return { attachment: { filename: safeName, content, contentType: mimeTypes[0] } };
}

export async function submitApplication(_previous: FormState, formData: FormData): Promise<FormState> {
  const values = collectValues(formData, ["licenses"]);

  const guard = await guardSubmission(formData, "application");
  if (guard === "spam") return { status: "success" };
  if (guard === "rate-limited") {
    return { status: "error", message: "Zu viele Bewerbungen in kurzer Zeit. Bitte versuchen Sie es später erneut.", values };
  }

  const parsed = applicationSchema.safeParse({
    ...Object.fromEntries(formData),
    licenses: formData.getAll("licenses"),
  });
  const cv = await readCv(formData.get("cv"));

  if (!parsed.success || cv.error) {
    return {
      status: "error",
      message: "Bitte prüfen Sie die markierten Felder.",
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
    return {
      status: "error",
      message: `Ihre Bewerbung konnte gerade nicht übermittelt werden. Bitte senden Sie sie an ${company.contact.careersEmail}.`,
      values,
    };
  }

  await sendMail({
    to: data.email,
    subject: `Ihre Bewerbung bei ${company.name}`,
    text:
      `Hallo ${data.name},\n\nvielen Dank für Ihre Bewerbung als „${positionTitle}“. ` +
      `Wir melden uns innerhalb von 48 Stunden persönlich bei Ihnen.\n\nViele Grüße\nIhr Team von ${company.legalName}`,
  });

  return {
    status: "success",
    message: `Danke, ${data.name}! Ihre Bewerbung als „${positionTitle}“ ist bei uns eingegangen. Wir melden uns innerhalb von 48 Stunden telefonisch oder per E-Mail.`,
  };
}
