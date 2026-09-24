import { cn } from "@/lib/cn";

/**
 * Button-Styles als reine Funktion – nutzbar in Server- und Client-Komponenten,
 * für <a>, <Link> und <button>, ohne Icon-Registry mitzuladen.
 */
export type ButtonVariant = "primary" | "glass" | "outline" | "dark";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "group/button relative inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold " +
  "transition-[background-color,border-color,color,box-shadow,transform] duration-300 ease-out-expo " +
  "active:scale-[0.98] focus-visible:outline-offset-4";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-accent text-primary hover:bg-accent-bright hover:shadow-glow",
  glass: "glass text-white hover:bg-white/15 hover:border-white/30",
  outline: "border border-primary/15 bg-white text-primary hover:border-primary/40 hover:shadow-card",
  dark: "bg-primary text-white hover:bg-secondary hover:shadow-card-hover",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-10 px-4 text-sm",
  md: "h-12 px-6 text-[0.9375rem]",
  lg: "h-14 px-7 text-base",
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) {
  return cn(base, variants[variant], sizes[size], className);
}
