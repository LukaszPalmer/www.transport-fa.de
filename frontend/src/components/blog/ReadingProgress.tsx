"use client";

import { useEffect, useRef } from "react";

/**
 * Lesefortschritt als feine Linie am oberen Rand. Schreibt direkt ins DOM (kein
 * React-State je Scroll-Ereignis) und respektiert „reduzierte Bewegung".
 */
export function ReadingProgress({ targetId }: { targetId: string }) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = document.getElementById(targetId);
    const bar = barRef.current;
    if (!target || !bar) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = target.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const progress = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 1;
      bar.style.transform = `scaleX(${progress})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [targetId]);

  return (
    <div aria-hidden="true" className="fixed inset-x-0 top-0 z-[60] h-0.5 bg-transparent">
      <div ref={barRef} className="h-full origin-left scale-x-0 bg-linear-to-r from-accent to-accent-bright motion-safe:transition-transform motion-safe:duration-150" />
    </div>
  );
}
