"use client";

import { useEffect } from "react";

/**
 * Präzise Sprungmarken trotz `content-visibility: auto` (.defer-render).
 *
 * Nicht gerenderte Sektionen haben nur eine geschätzte Höhe – ein nativer
 * Anker-Sprung würde deshalb am Ziel vorbeiscrollen. Vor dem Scrollen wird
 * daher einmalig alles gerendert (html.render-all), danach exakt gescrollt.
 * Der Performance-Vorteil beim initialen Laden bleibt vollständig erhalten.
 */
export function AnchorScroll() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const scrollToHash = (hash: string, smooth: boolean) => {
      const target = hash.length > 1 ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
      if (!target) return false;
      document.documentElement.classList.add("render-all");
      // Einen Frame warten, damit das Layout mit echten Höhen steht.
      requestAnimationFrame(() =>
        target.scrollIntoView({ behavior: smooth && !prefersReducedMotion.matches ? "smooth" : "auto" }),
      );
      return true;
    };

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as Element | null)?.closest?.("a");
      if (!anchor?.hash || anchor.target === "_blank") return;

      const url = new URL(anchor.href);
      // Nur reine Sprungmarken auf derselben Seite – geänderte Query-Parameter übernimmt der Router.
      if (url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search) return;

      if (scrollToHash(url.hash, true)) {
        event.preventDefault();
        // history.state beibehalten – der Next.js-Router speichert dort seinen Zustand.
        history.pushState(history.state, "", url.hash);
      }
    };

    document.addEventListener("click", onClick);
    // Direkter Aufruf mit Hash (z. B. /#kontakt von einer Unterseite)
    if (location.hash) scrollToHash(location.hash, false);

    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
