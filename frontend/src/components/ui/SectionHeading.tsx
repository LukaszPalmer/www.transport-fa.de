import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Eyebrow } from "./Eyebrow";

interface SectionHeadingProps {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  /** "dark" für Sektionen mit Navy-Hintergrund. */
  tone?: "light" | "dark";
  align?: "left" | "center";
  /** ID der Überschrift – für aria-labelledby der umgebenden Sektion. */
  id?: string;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  tone = "light",
  align = "left",
  id,
  className,
}: SectionHeadingProps) {
  const isDark = tone === "dark";

  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      <Eyebrow tone={tone}>{eyebrow}</Eyebrow>
      <h2
        id={id}
        className={cn(
          "mt-4 text-3xl font-bold leading-[1.12] sm:text-4xl lg:text-5xl",
          isDark ? "text-white" : "text-primary",
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "mt-6 text-lg leading-relaxed",
            isDark ? "text-slate-300" : "text-slate-600",
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
