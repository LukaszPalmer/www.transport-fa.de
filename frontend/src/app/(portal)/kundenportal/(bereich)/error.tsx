"use client";

import { RotateCw } from "lucide-react";
import { buttonClasses } from "@/components/ui/button-styles";
import { Container } from "@/components/ui/Container";

/** Fehlergrenze des Portals – z. B. wenn die API kurz nicht erreichbar ist. */
export default function PortalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Container className="py-24">
      <div className="mx-auto max-w-xl rounded-3xl bg-white p-8 text-center shadow-card ring-1 ring-primary/5 sm:p-10">
        <h1 className="font-display text-2xl font-bold text-primary">Das Portal ist gerade nicht erreichbar</h1>
        <p className="mt-3 leading-relaxed text-slate-600">
          Ihre Daten sind sicher – wir konnten sie nur gerade nicht laden. Bitte versuchen Sie es in einem Moment erneut.
        </p>
        <button type="button" onClick={reset} className={buttonClasses({ variant: "dark", className: "mt-8" })}>
          <RotateCw aria-hidden="true" className="size-4" />
          Erneut versuchen
        </button>
      </div>
    </Container>
  );
}
