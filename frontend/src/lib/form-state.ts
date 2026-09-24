import type { ZodError } from "zod";

/**
 * Einheitliches Ergebnis aller Formular-Server-Actions.
 * `values` spiegelt die Eingaben zurück – React setzt Formulare nach einer
 * Action zurück, die Felder nutzen diese Werte als defaultValue.
 */
export interface FormState {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
  values?: Record<string, string | string[]>;
}

export const initialFormState: FormState = { status: "idle" };

/** Erste Fehlermeldung je Feld aus einem Zod-Fehler. */
export function toFieldErrors(error: ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    errors[key] ??= issue.message;
  }
  return errors;
}

/** Textfelder eines FormData-Objekts für das Zurückspielen in den State. */
export function collectValues(formData: FormData, multiFields: string[] = []): Record<string, string | string[]> {
  const values: Record<string, string | string[]> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value !== "string" || key.startsWith("$")) continue;
    if (multiFields.includes(key)) {
      values[key] = [...((values[key] as string[] | undefined) ?? []), value];
    } else {
      values[key] = value;
    }
  }
  return values;
}
