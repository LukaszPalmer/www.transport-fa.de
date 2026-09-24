import { cn } from "@/lib/cn";

/** Pulsierender Status-Punkt („live“). Animation stoppt bei reduced motion. */
export function LiveDot({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={cn("relative inline-flex size-2", className)}>
      <span className="absolute inset-0 rounded-full bg-current animate-pulse-ring" />
      <span className="relative size-2 rounded-full bg-current" />
    </span>
  );
}
