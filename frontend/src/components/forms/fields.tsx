"use client";

import { useId, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Formular-Primitive (hell). Jedes Feld verknüpft Label, Hinweis und Fehler
 * per aria-describedby und setzt aria-invalid – Screenreader lesen den
 * Fehler beim Fokussieren vor.
 */
export const inputClasses =
  "block w-full rounded-xl border border-slate-300 bg-white px-4 text-[0.9375rem] text-primary shadow-xs " +
  "placeholder:text-slate-400 transition-[border-color,box-shadow] duration-200 " +
  "hover:border-slate-400 focus:border-accent-ink focus:ring-4 focus:ring-accent/20 focus:outline-none " +
  "aria-[invalid=true]:border-red-500 aria-[invalid=true]:ring-red-500/15 disabled:bg-slate-50";

export const selectClasses = cn(
  inputClasses,
  "h-12 appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2362748e%22 stroke-width=%222%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[length:1.1rem] bg-[position:right_1rem_center] bg-no-repeat pr-11",
);

interface FieldShellProps {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  children: ReactNode;
}

export function FieldShell({ id, label, required, hint, error, className, children }: FieldShellProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-primary">
        {label}
        {required ? (
          <span className="ml-0.5 text-red-600" aria-hidden="true">
            *
          </span>
        ) : (
          <span className="ml-1.5 font-normal text-slate-500">(optional)</span>
        )}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-slate-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

/** aria-Attribute für ein Feld mit optionalem Hinweis/Fehler. */
export function describedBy(id: string, hint?: string, error?: string) {
  if (error) return { "aria-invalid": true as const, "aria-describedby": `${id}-error` };
  if (hint) return { "aria-describedby": `${id}-hint` };
  return {};
}

type BaseProps = {
  name: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  defaultValue?: string;
  className?: string;
};

export function TextField({
  name,
  label,
  required,
  hint,
  error,
  defaultValue,
  className,
  type = "text",
  autoComplete,
  placeholder,
  inputMode,
}: BaseProps & {
  type?: "text" | "email" | "tel" | "date" | "url";
  autoComplete?: string;
  placeholder?: string;
  inputMode?: "text" | "email" | "tel" | "numeric";
}) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} required={required} hint={hint} error={error} className={className}>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        autoComplete={autoComplete}
        placeholder={placeholder}
        inputMode={inputMode}
        className={cn(inputClasses, "h-12")}
        {...describedBy(id, hint, error)}
      />
    </FieldShell>
  );
}

export function TextAreaField({
  name,
  label,
  required,
  hint,
  error,
  defaultValue,
  className,
  rows = 5,
  placeholder,
  maxLength,
}: BaseProps & { rows?: number; placeholder?: string; maxLength?: number }) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} required={required} hint={hint} error={error} className={className}>
      <textarea
        id={id}
        name={name}
        rows={rows}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        maxLength={maxLength}
        className={cn(inputClasses, "resize-y py-3 leading-relaxed")}
        {...describedBy(id, hint, error)}
      />
    </FieldShell>
  );
}

export function SelectField({
  name,
  label,
  required,
  hint,
  error,
  defaultValue,
  className,
  options,
  placeholder = "Bitte wählen",
}: BaseProps & { options: Array<{ value: string; label: string }>; placeholder?: string }) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} required={required} hint={hint} error={error} className={className}>
      <select
        id={id}
        name={name}
        required={required}
        defaultValue={defaultValue ?? ""}
        className={selectClasses}
        {...describedBy(id, hint, error)}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

export function CheckboxField({
  name,
  value = "on",
  required,
  error,
  defaultChecked,
  children,
  className,
}: {
  name: string;
  value?: string;
  required?: boolean;
  error?: string;
  defaultChecked?: boolean;
  children: ReactNode;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={className}>
      <div className="flex items-start gap-3">
        <input
          id={id}
          type="checkbox"
          name={name}
          value={value}
          required={required}
          defaultChecked={defaultChecked}
          className="mt-0.5 size-5 shrink-0 cursor-pointer rounded-md border-slate-300 accent-[#0369a1]"
          {...describedBy(id, undefined, error)}
        />
        <label htmlFor={id} className="cursor-pointer text-sm leading-relaxed text-slate-600">
          {children}
        </label>
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 pl-8 text-sm font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
