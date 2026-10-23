"use client";

import Link from "next/link";
import { company } from "@/content/company";
import { useLocale } from "@/i18n/client";
import { localizeHref } from "@/i18n/config";
import { cn } from "@/lib/cn";

interface LogoProps {
  /** "light" = helle Schrift für dunkle Flächen. */
  tone?: "light" | "dark";
  className?: string;
  /** Linkziel – Standard ist die Startseite (Admin-Bereich: /admin). */
  href?: string;
  label?: string;
}

/** Bildmarke: zwei nach vorn geneigte Fahrspuren – Bewegung & Präzision. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" aria-hidden="true" focusable="false" className={className}>
      <rect width="36" height="36" rx="9" className="fill-accent" />
      <path d="M8.5 26 15 10h5.5L14 26z M17.5 26 24 10h5.5L23 26z" className="fill-primary" />
    </svg>
  );
}

export function Logo({ tone = "light", className, href = "/", label }: LogoProps) {
  const locale = useLocale();
  return (
    <Link
      href={localizeHref(href, locale)}
      aria-label={label ?? (locale === "en" ? `${company.name} – home` : `${company.name} – zur Startseite`)}
      className={cn("group inline-flex items-center gap-3", className)}
    >
      <LogoMark className="size-9 transition-transform duration-300 ease-out-expo group-hover:-rotate-6" />
      <span
        className={cn(
          "font-display text-lg leading-none tracking-tight whitespace-nowrap",
          tone === "light" ? "text-white" : "text-primary",
        )}
      >
        <span className="font-extrabold">FA</span>{" "}
        <span className="font-medium opacity-90">Transport</span>
      </span>
    </Link>
  );
}
