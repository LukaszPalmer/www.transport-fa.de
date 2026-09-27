import type { ProcessStep } from "@/types/content";
import { getLocale } from "@/i18n/server";
import { cn } from "@/lib/cn";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

interface ProcessStepsProps {
  eyebrow?: string;
  title: string;
  description?: string;
  steps: ProcessStep[];
  tone?: "light" | "dark";
  id?: string;
}

/** Ablauf in nummerierten Schritten – verbunden durch eine Linie ab lg. */
export async function ProcessSteps({
  eyebrow,
  title,
  description,
  steps,
  tone = "light",
  id = "process-title",
}: ProcessStepsProps) {
  const isDark = tone === "dark";
  const eyebrowText = eyebrow ?? ((await getLocale()) === "en" ? "Process" : "Ablauf");

  return (
    <section
      aria-labelledby={id}
      className={cn("defer-render py-24 lg:py-32", isDark ? "bg-primary" : "bg-white")}
    >
      <Container>
        <SectionHeading id={id} eyebrow={eyebrowText} title={title} description={description} tone={tone} />

        <ol className="relative mt-16 grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {/* Verbindungslinie zwischen den Schritt-Nummern */}
          <span
            aria-hidden="true"
            className={cn(
              "absolute top-6 right-[12.5%] left-[12.5%] hidden h-px lg:block",
              isDark ? "bg-white/15" : "bg-slate-200",
            )}
          />
          {steps.map((step, index) => (
            <li key={step.title} data-reveal className="relative">
              <span
                className={cn(
                  "relative flex size-12 items-center justify-center rounded-full font-display text-lg font-bold ring-8 lg:mx-auto",
                  isDark ? "bg-accent text-primary ring-primary" : "bg-primary text-accent ring-white",
                )}
              >
                {index + 1}
              </span>
              <h3 className={cn("mt-6 text-lg font-bold lg:text-center", isDark ? "text-white" : "text-primary")}>
                {step.title}
              </h3>
              <p
                className={cn(
                  "mt-2 text-[0.9375rem] leading-relaxed lg:text-center",
                  isDark ? "text-slate-400" : "text-slate-600",
                )}
              >
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
