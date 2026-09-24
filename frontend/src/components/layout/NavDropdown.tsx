"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { navLinkClass } from "./nav-styles";

interface NavDropdownProps {
  label: string;
  /** Server-gerenderter Panel-Inhalt (Links, Icons) – hält das Client-Bundle schlank. */
  children: ReactNode;
}

/**
 * Disclosure-Navigation (WAI-ARIA „Disclosure Navigation Menu“):
 * öffnet per Hover (Maus), Klick/Tap und Tastatur; schließt mit Esc,
 * Klick außerhalb, Fokusverlust oder Auswahl eines Links.
 */
export function NavDropdown({ label, children }: NavDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLLIElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  const openNow = () => {
    window.clearTimeout(closeTimer.current);
    setOpen(true);
  };
  // Kurze Verzögerung verhindert Flackern beim Weg von Button zu Panel.
  const closeSoon = () => {
    closeTimer.current = window.setTimeout(() => setOpen(false), 160);
  };

  return (
    <li
      ref={rootRef}
      className="relative"
      onPointerEnter={(event) => event.pointerType === "mouse" && openNow()}
      onPointerLeave={(event) => event.pointerType === "mouse" && closeSoon()}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className={cn(navLinkClass, "inline-flex items-center gap-1.5", open && "text-white after:scale-x-100")}
      >
        {label}
        <ChevronDown
          aria-hidden="true"
          className={cn("size-4 transition-transform duration-300 ease-out-expo", open && "rotate-180")}
        />
      </button>

      <div
        id={panelId}
        // Link-Auswahl schließt das Panel (Event-Delegation, da Inhalt server-gerendert ist)
        onClick={(event) => (event.target as Element).closest("a") && setOpen(false)}
        className={cn(
          "absolute top-full left-1/2 z-50 w-[min(44rem,calc(100vw-4rem))] -translate-x-1/2 pt-3",
          "transition-[opacity,translate,visibility] duration-300 ease-out-expo",
          open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0",
        )}
      >
        {children}
      </div>
    </li>
  );
}
