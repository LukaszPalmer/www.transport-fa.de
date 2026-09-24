"use client";

import { Check } from "lucide-react";
import { useId } from "react";
import { cn } from "@/lib/cn";

interface ChoiceCardsProps {
  name: string;
  legend: string;
  options: Array<{ value: string; label: string; description?: string }>;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  columns?: string;
}

/**
 * Radio-Gruppe als Auswahlkarten. Echte <input type="radio"> (visuell
 * verborgen) – Pfeiltasten-Navigation und Formularwert funktionieren nativ.
 */
export function ChoiceCards({ name, legend, options, value, onChange, error, columns = "sm:grid-cols-2 lg:grid-cols-3" }: ChoiceCardsProps) {
  const errorId = useId();

  return (
    <fieldset aria-describedby={error ? errorId : undefined}>
      <legend className="mb-3 text-sm font-semibold text-primary">
        {legend}
        <span className="ml-0.5 text-red-600" aria-hidden="true">
          *
        </span>
      </legend>
      <div className={cn("grid grid-cols-1 gap-3", columns)}>
        {options.map((option) => {
          const checked = value === option.value;
          return (
            <label
              key={option.value}
              className={cn(
                "relative flex cursor-pointer flex-col rounded-xl border bg-white p-4 transition-[border-color,box-shadow,background-color] duration-200",
                "has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-accent/30",
                checked
                  ? "border-accent-ink bg-sky-50/60 shadow-card ring-1 ring-accent-ink"
                  : "border-slate-300 hover:border-slate-400",
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={checked}
                onChange={() => onChange(option.value)}
                required
                className="sr-only"
              />
              <span className="flex items-center justify-between gap-3">
                <span className="font-semibold text-primary">{option.label}</span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                    checked ? "border-accent-ink bg-accent-ink text-white" : "border-slate-300",
                  )}
                >
                  {checked && <Check className="size-3" strokeWidth={3} />}
                </span>
              </span>
              {option.description && (
                <span className="mt-1 text-xs leading-snug text-slate-500">{option.description}</span>
              )}
            </label>
          );
        })}
      </div>
      {error && (
        <p id={errorId} className="mt-2 text-sm font-medium text-red-600">
          {error}
        </p>
      )}
    </fieldset>
  );
}
