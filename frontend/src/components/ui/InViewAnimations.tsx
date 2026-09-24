"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface InViewAnimationsProps {
  children: ReactNode;
  className?: string;
}

/**
 * Pausiert alle Animationen im Inneren, solange der Bereich nicht sichtbar ist.
 * SVG-Animationen (stroke-dashoffset, SMIL) laufen sonst dauerhaft auf dem
 * Main Thread – auch offscreen – und kosten Rechenzeit (TBT/INP).
 *
 * - CSS-Animationen: via [data-inview="false"] → animation-play-state: paused
 * - SMIL (<animateMotion>): via SVGSVGElement.pauseAnimations()
 */
export function InViewAnimations({ children, className }: InViewAnimationsProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const svgs = Array.from(root.querySelectorAll("svg"));

    const setActive = (active: boolean) => {
      root.dataset.inview = String(active);
      for (const svg of svgs) {
        if (active) svg.unpauseAnimations();
        else svg.pauseAnimations();
      }
    };

    setActive(false);
    const observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), {
      rootMargin: "100px",
    });
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} data-inview="false" className={cn("in-view-animations", className)}>
      {children}
    </div>
  );
}
