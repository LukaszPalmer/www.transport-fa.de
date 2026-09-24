"use server";

import { z } from "zod";
import { company } from "@/content/company";
import { contactTopics } from "@/content/contact";
import { guardSubmission } from "@/lib/form-guard";
import { collectValues, toFieldErrors, type FormState } from "@/lib/form-state";
import { mailRecipients, renderMailTable, sendMail } from "@/lib/mail";

const topicValues = contactTopics.map((topic) => topic.value) as [string, ...string[]];
const optionalText = (max: number) => z.string().trim().max(max, `Maximal ${max} Zeichen.`).optional();

const contactSchema = z.object({
  topic: z.enum(topicValues, { error: "Bitte wählen Sie aus, worum es geht." }),
  name: z.string().trim().min(2, "Bitte geben Sie Ihren Namen an.").max(100),
  company: optionalText(120),
  email: z.email("Bitte geben Sie eine gültige E-Mail-Adresse an.").max(200),
  phone: z
    .string()
    .trim()
    .max(40)
    .regex(/^[+\d\s()/-]*$/, "Bitte geben Sie eine gültige Telefonnummer an.")
    .optional(),
  from: optionalText(160),
  to: optionalText(160),
  date: optionalText(20),
  message: z.string().trim().min(10, "Bitte beschreiben Sie Ihr Anliegen kurz (mind. 10 Zeichen).").max(4000),
  callback: z.literal("on").optional(),
  privacy: z.literal("on", { error: "Bitte stimmen Sie der Datenschutzerklärung zu." }),
});

export async function submitContact(_previous: FormState, formData: FormData): Promise<FormState> {
  const values = collectValues(formData);

  const guard = await guardSubmission(formData, "contact");
  // Bots erhalten eine scheinbare Erfolgsmeldung – kein Hinweis auf den Filter.
  if (guard === "spam") return { status: "success" };
  if (guard === "rate-limited") {
    return {
      status: "error",
      message: `Sie haben in kurzer Zeit mehrere Anfragen gesendet. Bitte versuchen Sie es in einigen Minuten erneut oder rufen Sie uns an: ${company.contact.phone}.`,
      values,
    };
  }

  const parsed = contactSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      status: "error",
      message: "Bitte prüfen Sie die markierten Felder.",
      fieldErrors: toFieldErrors(parsed.error),
      values,
    };
  }

  const data = parsed.data;
  const topic = contactTopics.find((entry) => entry.value === data.topic)?.label ?? data.topic;
  const rows: Array<[string, string | undefined]> = [
    ["Anliegen", topic],
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
    subject: `Neue Anfrage: ${topic} – ${data.name}`,
    text: rows.filter(([, value]) => value).map(([label, value]) => `${label}: ${value}`).join("\n"),
    html: renderMailTable(`Neue Anfrage: ${topic}`, rows),
  });

  if (!internal.ok) {
    return {
      status: "error",
      message: `Ihre Anfrage konnte gerade nicht übermittelt werden. Bitte versuchen Sie es erneut oder schreiben Sie direkt an ${company.contact.email}.`,
      values,
    };
  }

  // Eingangsbestätigung an den Kunden (Best Effort – Fehler blockieren nicht).
  await sendMail({
    to: data.email,
    subject: `Ihre Anfrage bei ${company.name} ist eingegangen`,
    text:
      `Guten Tag ${data.name},\n\nvielen Dank für Ihre Anfrage zum Thema „${topic}“. ` +
      `Wir melden uns in der Regel innerhalb von zwei Stunden während unserer Geschäftszeiten.\n\n` +
      `Bei Fragen erreichen Sie uns unter ${company.contact.phone}.\n\nMit freundlichen Grüßen\nIhr Team von ${company.legalName}`,
  });

  return {
    status: "success",
    message: `Vielen Dank, ${data.name}! Wir haben Ihre Anfrage erhalten und melden uns in Kürze. Eine Bestätigung ist unterwegs an ${data.email}.`,
  };
}
